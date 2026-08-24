import type { Request, Response } from "express";
import { and, asc, eq, lt, sql } from "drizzle-orm";
import { appNotifications, leaseContracts, overdueReminderRules, rentCharges, tenants, units } from "../../drizzle/schema";
import { buildOverdueReminderContent } from "../../shared/reminderRules";
import { isAuthorizedOverdueReminderRun } from "../../shared/overdueReminderPolicy";
import { getDb } from "../db";
import { notifyOwner } from "../_core/notification";
import { sdk } from "../_core/sdk";

type OverdueReminderItem = { tenantName: string | null; unitNumber: string | null; remaining: number };
type NotificationSender = (payload: { title: string; content: string }) => Promise<boolean>;
type ReminderHandlerDeps = { authenticate: typeof sdk.authenticateRequest; getDatabase: typeof getDb; sendOwner: NotificationSender };

export async function deliverOverdueReminder(items: OverdueReminderItem[], sender: NotificationSender = notifyOwner): Promise<boolean> {
  if (items.length === 0) return false;
  return sender({ title: `KiraTakip: ${items.length} geciken tahsilat`, content: buildOverdueReminderContent(items) });
}

export async function persistUserOverdueReminder(db: any, userId: number, runDate: Date, items: OverdueReminderItem[]) {
  if (items.length === 0) return false;
  const title = `Geciken kira hatırlatması · ${items.length} kayıt`;
  await db.insert(appNotifications).values({
    userId,
    kind: "geciken_kira",
    title,
    content: buildOverdueReminderContent(items),
    dedupeKey: `geciken-kira:${runDate.toISOString().slice(0, 10)}`,
    isRead: "hayir",
  }).onDuplicateKeyUpdate({ set: { title, content: buildOverdueReminderContent(items), isRead: "hayir" } });
  return true;
}

export function hasValidVercelCronAuthorization(authorization: string | undefined, cronSecret: string | undefined): boolean {
  return Boolean(cronSecret) && authorization === `Bearer ${cronSecret}`;
}

export async function runOverdueReminderRule(db: any, rule: any, sender: NotificationSender = notifyOwner) {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  await db.update(rentCharges).set({ status: "gecikti" }).where(and(
    eq(rentCharges.userId, rule.userId),
    lt(rentCharges.dueDate, today),
    sql`${rentCharges.paidAmount} < ${rentCharges.amount}`,
  ));
  const overdue = await db.select({
    tenantName: tenants.fullName,
    unitNumber: units.unitNumber,
    remaining: sql<number>`${rentCharges.amount} - ${rentCharges.paidAmount}`,
  }).from(rentCharges)
    .leftJoin(leaseContracts, eq(rentCharges.contractId, leaseContracts.id))
    .leftJoin(tenants, eq(leaseContracts.tenantId, tenants.id))
    .leftJoin(units, eq(leaseContracts.unitId, units.id))
    .where(and(eq(rentCharges.userId, rule.userId), lt(rentCharges.dueDate, today), sql`${rentCharges.paidAmount} < ${rentCharges.amount}`))
    .orderBy(asc(rentCharges.dueDate));
  const now = new Date();
  const normalizedOverdue = overdue.map((item: any) => ({ ...item, remaining: Number(item.remaining) }));
  const inAppRecorded = await persistUserOverdueReminder(db, rule.userId, now, normalizedOverdue);
  const sent = await deliverOverdueReminder(normalizedOverdue, sender);
  await db.update(overdueReminderRules).set({ lastRunAt: now, lastNotificationAt: sent ? now : rule.lastNotificationAt, lastOverdueCount: overdue.length }).where(eq(overdueReminderRules.id, rule.id));
  return { overdueCount: overdue.length, notificationSent: sent, inAppRecorded };
}

export async function overdueRentRemindersHandler(req: Request, res: Response, dependencies: ReminderHandlerDeps = { authenticate: sdk.authenticateRequest, getDatabase: getDb, sendOwner: notifyOwner }) {
  try {
    const cronUser = await dependencies.authenticate(req);
    if (!cronUser.isCron || !cronUser.taskUid) return res.status(403).json({ error: "cron-only" });
    const db = await dependencies.getDatabase();
    if (!db) throw new Error("Veritabanı bağlantısı kurulamadı.");
    const rule = (await db.select().from(overdueReminderRules).where(eq(overdueReminderRules.scheduleCronTaskUid, cronUser.taskUid)).limit(1))[0];
    if (!isAuthorizedOverdueReminderRun(cronUser.isCron, cronUser.taskUid, rule?.scheduleCronTaskUid ?? null)) return res.status(403).json({ error: "unexpected-task" });
    if (rule.status !== "aktif") return res.json({ ok: true, skipped: "paused" });

    return res.json({ ok: true, ...(await runOverdueReminderRule(db, rule, dependencies.sendOwner)) });
  } catch (error) {
    const detail = error instanceof Error ? { message: error.message, stack: error.stack } : { message: String(error) };
    return res.status(500).json({ error: "overdue-reminder-failed", detail, timestamp: new Date().toISOString() });
  }
}

export async function vercelOverdueRentRemindersHandler(req: Request, res: Response, dependencies: { getDatabase?: typeof getDb; sendOwner?: NotificationSender; cronSecret?: string } = {}) {
  const cronSecret = dependencies.cronSecret ?? process.env.CRON_SECRET;
  if (!hasValidVercelCronAuthorization(req.headers.authorization, cronSecret)) return res.status(401).json({ error: "unauthorized" });
  try {
    const db = await (dependencies.getDatabase ?? getDb)();
    if (!db) throw new Error("Veritabanı bağlantısı kurulamadı.");
    const rules = await db.select().from(overdueReminderRules).where(eq(overdueReminderRules.status, "aktif"));
    const results = await Promise.all(rules.map((rule: any) => runOverdueReminderRule(db, rule, dependencies.sendOwner ?? notifyOwner)));
    return res.json({ ok: true, processedRules: rules.length, results });
  } catch (error) {
    const detail = error instanceof Error ? { message: error.message } : { message: String(error) };
    return res.status(500).json({ error: "vercel-overdue-reminder-failed", detail });
  }
}
