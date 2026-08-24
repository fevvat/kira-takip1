import { TRPCError } from "@trpc/server";
import { and, desc, eq, gte, lte, sql } from "drizzle-orm";
import { parse as parseCookie } from "cookie";
import { z } from "zod";
import { appNotifications, assets, backupLogs, buildings, documents, financialRecords, leaseContracts, overdueReminderRules, rentCharges, sites, tenants, units } from "../../drizzle/schema";
import { COOKIE_NAME } from "../../shared/const";
import { canManageOwnerReminder } from "../../shared/overdueReminderPolicy";
import { TURKEY_DAILY_REMINDER_CRON, TURKEY_DAILY_REMINDER_LABEL } from "../../shared/reminderRules";
import { deriveChargeStatus } from "../../shared/rentalCalculations";
import { getDashboardSummary, getDb } from "../db";
import { protectedProcedure, router } from "../_core/trpc";
import { createHeartbeatJob, updateHeartbeatJob } from "../_core/heartbeat";
import { disableOverdueReminderSchedule, enableOverdueReminderSchedule } from "../reminderScheduleService";
import { ENV } from "../_core/env";

const idSchema = z.coerce.number().int().positive();
const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const nullableText = z.string().trim().max(3000).optional().nullable();
const money = z.coerce.number().min(0).max(99999999999);

function toDate(value: string): Date {
  return new Date(`${value}T00:00:00.000Z`);
}

function toDateKey(value: Date): string {
  return value.toISOString().slice(0, 10);
}

function toMoney(value: number): string {
  return value.toFixed(2);
}

async function dbOrThrow() {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Veritabanı bağlantısı kurulamadı." });
  return db;
}

async function ensureOwned(table: typeof sites | typeof buildings | typeof units | typeof tenants | typeof leaseContracts | typeof rentCharges | typeof financialRecords | typeof assets | typeof documents | typeof backupLogs, id: number, userId: number) {
  const db = await dbOrThrow();
  const row = await db.select({ id: table.id }).from(table).where(and(eq(table.id, id), eq(table.userId, userId))).limit(1);
  if (!row[0]) throw new TRPCError({ code: "NOT_FOUND", message: "Kayıt bulunamadı." });
}

const siteInput = z.object({ id: idSchema.optional(), name: z.string().trim().min(2).max(160), address: nullableText, notes: nullableText });
const buildingInput = z.object({ id: idSchema.optional(), siteId: idSchema, name: z.string().trim().min(1).max(160), block: z.string().trim().max(40).optional().nullable(), address: nullableText, notes: nullableText });
export const unitInput = z.object({ id: idSchema.optional(), buildingId: idSchema, unitNumber: z.string().trim().min(1).max(32), floor: z.string().trim().max(24).optional().nullable(), unitType: z.string().trim().max(80).optional().nullable(), grossArea: z.coerce.number().int().min(0).max(100000).optional().nullable(), netArea: z.coerce.number().int().min(0).max(100000).optional().nullable(), roomCount: z.string().trim().max(24).optional().nullable(), targetRent: money.optional().nullable(), monthlyDues: money.optional().nullable(), furnished: z.enum(["evet", "hayir"]), parkingSlot: z.string().trim().max(40).optional().nullable(), electricityMeterNo: z.string().trim().max(64).optional().nullable(), waterMeterNo: z.string().trim().max(64).optional().nullable(), naturalGasMeterNo: z.string().trim().max(64).optional().nullable(), status: z.enum(["bos", "dolu", "pasif"]), notes: nullableText });
const tenantInput = z.object({ id: idSchema.optional(), fullName: z.string().trim().min(2).max(160), identityNumber: z.string().trim().max(32).optional().nullable(), phone: z.string().trim().max(32).optional().nullable(), email: z.string().email().max(320).optional().nullable().or(z.literal("")), emergencyContact: z.string().trim().max(160).optional().nullable(), notes: nullableText });
const contractInput = z.object({ id: idSchema.optional(), unitId: idSchema, tenantId: idSchema, startDate: dateSchema, endDate: dateSchema, monthlyRent: money, increasePeriodMonths: z.coerce.number().int().min(1).max(60), securityDeposit: money, paymentDay: z.coerce.number().int().min(1).max(31), status: z.enum(["aktif", "yaklasan", "sona_erdi"]), notes: nullableText });
const chargeInput = z.object({ id: idSchema.optional(), contractId: idSchema, period: z.string().regex(/^\d{4}-\d{2}$/), dueDate: dateSchema, amount: money, paidAmount: money, paidAt: dateSchema.optional().nullable(), notes: nullableText });
const financialInput = z.object({ id: idSchema.optional(), kind: z.enum(["gelir", "gider"]), category: z.string().trim().min(2).max(100), recordDate: dateSchema, amount: money, unitId: idSchema.optional().nullable(), contractId: idSchema.optional().nullable(), description: nullableText });
const assetInput = z.object({ id: idSchema.optional(), unitId: idSchema.optional().nullable(), name: z.string().trim().min(2).max(160), category: z.string().trim().min(2).max(100), acquisitionDate: dateSchema.optional().nullable(), cost: money, status: z.enum(["aktif", "bakimda", "hurda"]), notes: nullableText });
const documentInput = z.object({ id: idSchema.optional(), title: z.string().trim().min(2).max(180), category: z.enum(["sozlesme", "kimlik", "tahsilat", "diger"]), contractId: idSchema.optional().nullable(), unitId: idSchema.optional().nullable(), tenantId: idSchema.optional().nullable(), fileName: z.string().trim().max(255).optional().nullable(), externalUrl: z.string().url().max(2048).optional().nullable().or(z.literal("")), notes: nullableText });

export const rentalRouter = router({
  dashboard: router({
    summary: protectedProcedure.query(({ ctx }) => getDashboardSummary(ctx.user.id)),
  }),
  portfolio: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const db = await dbOrThrow();
      const [siteRows, buildingRows, unitRows] = await Promise.all([
        db.select().from(sites).where(eq(sites.userId, ctx.user.id)).orderBy(desc(sites.createdAt)),
        db.select().from(buildings).where(eq(buildings.userId, ctx.user.id)).orderBy(desc(buildings.createdAt)),
        db.select().from(units).where(eq(units.userId, ctx.user.id)).orderBy(desc(units.createdAt)),
      ]);
      return { sites: siteRows, buildings: buildingRows, units: unitRows };
    }),
    saveSite: protectedProcedure.input(siteInput).mutation(async ({ ctx, input }) => {
      const db = await dbOrThrow();
      const { id, ...values } = input;
      if (id) { await ensureOwned(sites, id, ctx.user.id); await db.update(sites).set(values).where(and(eq(sites.id, id), eq(sites.userId, ctx.user.id))); return { id }; }
      const result = await db.insert(sites).values({ ...values, userId: ctx.user.id }); return { id: result[0].insertId };
    }),
    saveBuilding: protectedProcedure.input(buildingInput).mutation(async ({ ctx, input }) => {
      const db = await dbOrThrow();
      const { id, ...values } = input;
      await ensureOwned(sites, values.siteId, ctx.user.id);
      if (id) { await ensureOwned(buildings, id, ctx.user.id); await db.update(buildings).set(values).where(and(eq(buildings.id, id), eq(buildings.userId, ctx.user.id))); return { id }; }
      const result = await db.insert(buildings).values({ ...values, userId: ctx.user.id }); return { id: result[0].insertId };
    }),
    saveUnit: protectedProcedure.input(unitInput).mutation(async ({ ctx, input }) => {
      const db = await dbOrThrow();
      const { id, ...values } = input;
      await ensureOwned(buildings, values.buildingId, ctx.user.id);
      const normalized = { ...values, targetRent: values.targetRent === null || values.targetRent === undefined ? null : toMoney(values.targetRent), monthlyDues: values.monthlyDues === null || values.monthlyDues === undefined ? null : toMoney(values.monthlyDues) };
      if (id) { await ensureOwned(units, id, ctx.user.id); await db.update(units).set(normalized).where(and(eq(units.id, id), eq(units.userId, ctx.user.id))); return { id }; }
      const result = await db.insert(units).values({ ...normalized, userId: ctx.user.id }); return { id: result[0].insertId };
    }),
    remove: protectedProcedure.input(z.object({ type: z.enum(["site", "building", "unit"]), id: idSchema })).mutation(async ({ ctx, input }) => {
      const db = await dbOrThrow();
      const table = input.type === "site" ? sites : input.type === "building" ? buildings : units;
      await ensureOwned(table, input.id, ctx.user.id);
      await db.delete(table).where(and(eq(table.id, input.id), eq(table.userId, ctx.user.id)));
      return { success: true };
    }),
  }),
  tenants: router({
    list: protectedProcedure.query(async ({ ctx }) => (await dbOrThrow()).select().from(tenants).where(eq(tenants.userId, ctx.user.id)).orderBy(desc(tenants.createdAt))),
    save: protectedProcedure.input(tenantInput).mutation(async ({ ctx, input }) => {
      const db = await dbOrThrow(); const { id, ...values } = input; const normalized = { ...values, email: values.email || null };
      if (id) { await ensureOwned(tenants, id, ctx.user.id); await db.update(tenants).set(normalized).where(and(eq(tenants.id, id), eq(tenants.userId, ctx.user.id))); return { id }; }
      const result = await db.insert(tenants).values({ ...normalized, userId: ctx.user.id }); return { id: result[0].insertId };
    }),
    remove: protectedProcedure.input(idSchema).mutation(async ({ ctx, input }) => { const db = await dbOrThrow(); await ensureOwned(tenants, input, ctx.user.id); await db.delete(tenants).where(and(eq(tenants.id, input), eq(tenants.userId, ctx.user.id))); return { success: true }; }),
  }),
  contracts: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const db = await dbOrThrow();
      return db.select({ contract: leaseContracts, tenantName: tenants.fullName, unitNumber: units.unitNumber, buildingName: buildings.name }).from(leaseContracts).leftJoin(tenants, eq(leaseContracts.tenantId, tenants.id)).leftJoin(units, eq(leaseContracts.unitId, units.id)).leftJoin(buildings, eq(units.buildingId, buildings.id)).where(eq(leaseContracts.userId, ctx.user.id)).orderBy(sql`${leaseContracts.endDate} desc`);
    }),
    save: protectedProcedure.input(contractInput).mutation(async ({ ctx, input }) => {
      const db = await dbOrThrow(); const { id, ...values } = input;
      if (values.endDate <= values.startDate) throw new TRPCError({ code: "BAD_REQUEST", message: "Bitiş tarihi başlangıç tarihinden sonra olmalıdır." });
      await Promise.all([ensureOwned(units, values.unitId, ctx.user.id), ensureOwned(tenants, values.tenantId, ctx.user.id)]);
      const normalized = { ...values, startDate: toDate(values.startDate), endDate: toDate(values.endDate), monthlyRent: toMoney(values.monthlyRent), securityDeposit: toMoney(values.securityDeposit) };
      if (id) { await ensureOwned(leaseContracts, id, ctx.user.id); await db.update(leaseContracts).set(normalized).where(and(eq(leaseContracts.id, id), eq(leaseContracts.userId, ctx.user.id))); return { id }; }
      const result = await db.insert(leaseContracts).values({ ...normalized, userId: ctx.user.id }); return { id: result[0].insertId };
    }),
    remove: protectedProcedure.input(idSchema).mutation(async ({ ctx, input }) => { const db = await dbOrThrow(); await ensureOwned(leaseContracts, input, ctx.user.id); await db.delete(leaseContracts).where(and(eq(leaseContracts.id, input), eq(leaseContracts.userId, ctx.user.id))); return { success: true }; }),
  }),
  charges: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const db = await dbOrThrow();
      return db.select({ charge: rentCharges, tenantName: tenants.fullName, unitNumber: units.unitNumber }).from(rentCharges).leftJoin(leaseContracts, eq(rentCharges.contractId, leaseContracts.id)).leftJoin(tenants, eq(leaseContracts.tenantId, tenants.id)).leftJoin(units, eq(leaseContracts.unitId, units.id)).where(eq(rentCharges.userId, ctx.user.id)).orderBy(desc(rentCharges.dueDate));
    }),
    save: protectedProcedure.input(chargeInput).mutation(async ({ ctx, input }) => {
      const db = await dbOrThrow(); const { id, ...values } = input;
      await ensureOwned(leaseContracts, values.contractId, ctx.user.id);
      const status = deriveChargeStatus({ amount: values.amount, paidAmount: values.paidAmount, dueDate: values.dueDate });
      const normalized = { ...values, status, dueDate: toDate(values.dueDate), amount: toMoney(values.amount), paidAmount: toMoney(values.paidAmount), paidAt: values.paidAmount > 0 && values.paidAt ? toDate(values.paidAt) : null };
      if (id) { await ensureOwned(rentCharges, id, ctx.user.id); await db.update(rentCharges).set(normalized).where(and(eq(rentCharges.id, id), eq(rentCharges.userId, ctx.user.id))); return { id }; }
      const result = await db.insert(rentCharges).values({ ...normalized, userId: ctx.user.id }); return { id: result[0].insertId };
    }),
    remove: protectedProcedure.input(idSchema).mutation(async ({ ctx, input }) => { const db = await dbOrThrow(); await ensureOwned(rentCharges, input, ctx.user.id); await db.delete(rentCharges).where(and(eq(rentCharges.id, input), eq(rentCharges.userId, ctx.user.id))); return { success: true }; }),
  }),
  finance: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const db = await dbOrThrow();
      const records = await db.select().from(financialRecords).where(eq(financialRecords.userId, ctx.user.id)).orderBy(desc(financialRecords.recordDate));
      const summary = records.reduce((totals, record) => ({ gelir: totals.gelir + (record.kind === "gelir" ? Number(record.amount) : 0), gider: totals.gider + (record.kind === "gider" ? Number(record.amount) : 0) }), { gelir: 0, gider: 0 });
      return { records, summary: { ...summary, net: summary.gelir - summary.gider } };
    }),
    save: protectedProcedure.input(financialInput).mutation(async ({ ctx, input }) => {
      const db = await dbOrThrow(); const { id, ...values } = input;
      if (values.unitId) await ensureOwned(units, values.unitId, ctx.user.id); if (values.contractId) await ensureOwned(leaseContracts, values.contractId, ctx.user.id);
      const normalized = { ...values, recordDate: toDate(values.recordDate), amount: toMoney(values.amount) };
      if (id) { await ensureOwned(financialRecords, id, ctx.user.id); await db.update(financialRecords).set(normalized).where(and(eq(financialRecords.id, id), eq(financialRecords.userId, ctx.user.id))); return { id }; }
      const result = await db.insert(financialRecords).values({ ...normalized, userId: ctx.user.id }); return { id: result[0].insertId };
    }),
    remove: protectedProcedure.input(idSchema).mutation(async ({ ctx, input }) => { const db = await dbOrThrow(); await ensureOwned(financialRecords, input, ctx.user.id); await db.delete(financialRecords).where(and(eq(financialRecords.id, input), eq(financialRecords.userId, ctx.user.id))); return { success: true }; }),
  }),
  inventory: router({
    list: protectedProcedure.query(async ({ ctx }) => (await dbOrThrow()).select().from(assets).where(eq(assets.userId, ctx.user.id)).orderBy(desc(assets.createdAt))),
    save: protectedProcedure.input(assetInput).mutation(async ({ ctx, input }) => { const db = await dbOrThrow(); const { id, ...values } = input; const normalized = { ...values, acquisitionDate: values.acquisitionDate ? toDate(values.acquisitionDate) : null, cost: toMoney(values.cost) }; if (values.unitId) await ensureOwned(units, values.unitId, ctx.user.id); if (id) { await ensureOwned(assets, id, ctx.user.id); await db.update(assets).set(normalized).where(and(eq(assets.id, id), eq(assets.userId, ctx.user.id))); return { id }; } const result = await db.insert(assets).values({ ...normalized, userId: ctx.user.id }); return { id: result[0].insertId }; }),
    remove: protectedProcedure.input(idSchema).mutation(async ({ ctx, input }) => { const db = await dbOrThrow(); await ensureOwned(assets, input, ctx.user.id); await db.delete(assets).where(and(eq(assets.id, input), eq(assets.userId, ctx.user.id))); return { success: true }; }),
  }),
  archive: router({
    list: protectedProcedure.query(async ({ ctx }) => (await dbOrThrow()).select().from(documents).where(eq(documents.userId, ctx.user.id)).orderBy(desc(documents.createdAt))),
    save: protectedProcedure.input(documentInput).mutation(async ({ ctx, input }) => { const db = await dbOrThrow(); const { id, ...values } = input; const normalized = { ...values, externalUrl: values.externalUrl || null }; if (values.contractId) await ensureOwned(leaseContracts, values.contractId, ctx.user.id); if (values.unitId) await ensureOwned(units, values.unitId, ctx.user.id); if (values.tenantId) await ensureOwned(tenants, values.tenantId, ctx.user.id); if (id) { await ensureOwned(documents, id, ctx.user.id); await db.update(documents).set(normalized).where(and(eq(documents.id, id), eq(documents.userId, ctx.user.id))); return { id }; } const result = await db.insert(documents).values({ ...normalized, userId: ctx.user.id }); return { id: result[0].insertId }; }),
    remove: protectedProcedure.input(idSchema).mutation(async ({ ctx, input }) => { const db = await dbOrThrow(); await ensureOwned(documents, input, ctx.user.id); await db.delete(documents).where(and(eq(documents.id, input), eq(documents.userId, ctx.user.id))); return { success: true }; }),
  }),
  reminders: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const db = await dbOrThrow(); const today = new Date(); today.setUTCHours(0, 0, 0, 0); const soon = new Date(today); soon.setUTCDate(soon.getUTCDate() + 30);
      const [chargeRows, contractRows] = await Promise.all([
        db.select({ id: rentCharges.id, dueDate: rentCharges.dueDate, amount: rentCharges.amount, paidAmount: rentCharges.paidAmount, status: rentCharges.status, tenantName: tenants.fullName, unitNumber: units.unitNumber }).from(rentCharges).leftJoin(leaseContracts, eq(rentCharges.contractId, leaseContracts.id)).leftJoin(tenants, eq(leaseContracts.tenantId, tenants.id)).leftJoin(units, eq(leaseContracts.unitId, units.id)).where(and(eq(rentCharges.userId, ctx.user.id), lte(rentCharges.dueDate, soon), sql`${rentCharges.status} != 'odendi'`)).orderBy(sql`${rentCharges.dueDate} asc`),
        db.select({ id: leaseContracts.id, endDate: leaseContracts.endDate, tenantName: tenants.fullName, unitNumber: units.unitNumber }).from(leaseContracts).leftJoin(tenants, eq(leaseContracts.tenantId, tenants.id)).leftJoin(units, eq(leaseContracts.unitId, units.id)).where(and(eq(leaseContracts.userId, ctx.user.id), gte(leaseContracts.endDate, today), lte(leaseContracts.endDate, soon))).orderBy(sql`${leaseContracts.endDate} asc`),
      ]);
      return { today: toDateKey(today), charges: chargeRows, contracts: contractRows };
    }),
    rule: protectedProcedure.query(async ({ ctx }) => {
      if (!canManageOwnerReminder(ctx.user.openId, ENV.ownerOpenId)) return { status: "pasif" as const, cronExpression: TURKEY_DAILY_REMINDER_CRON, scheduleCronTaskUid: null, lastRunAt: null, lastNotificationAt: null, lastOverdueCount: 0, canManage: false };
      const db = await dbOrThrow();
      const rule = (await db.select().from(overdueReminderRules).where(eq(overdueReminderRules.userId, ctx.user.id)).limit(1))[0];
      return { ...(rule ?? { status: "pasif" as const, cronExpression: TURKEY_DAILY_REMINDER_CRON, scheduleCronTaskUid: null, lastRunAt: null, lastNotificationAt: null, lastOverdueCount: 0 }), canManage: true };
    }),
    notifications: protectedProcedure.query(async ({ ctx }) => (await dbOrThrow()).select().from(appNotifications).where(eq(appNotifications.userId, ctx.user.id)).orderBy(desc(appNotifications.createdAt)).limit(5)),
    enableDaily: protectedProcedure.mutation(async ({ ctx }) => {
      if (!canManageOwnerReminder(ctx.user.openId, ENV.ownerOpenId)) throw new TRPCError({ code: "FORBIDDEN", message: "Hatırlatma kuralı yalnızca proje sahibi tarafından etkinleştirilebilir." });
      const db = await dbOrThrow();
      const sessionToken = parseCookie(ctx.req.headers.cookie ?? "")[COOKIE_NAME] ?? "";
      const existing = (await db.select().from(overdueReminderRules).where(eq(overdueReminderRules.userId, ctx.user.id)).limit(1))[0];
      if (process.env.VERCEL === "1") {
        if (existing) await db.update(overdueReminderRules).set({ status: "aktif", cronExpression: "0 6 * * *", scheduleCronTaskUid: null }).where(eq(overdueReminderRules.id, existing.id));
        else await db.insert(overdueReminderRules).values({ userId: ctx.user.id, status: "aktif", cronExpression: "0 6 * * *", scheduleCronTaskUid: null });
        return { enabled: true, nextExecutionAt: null };
      }
      const description = `Geciken kira tahsilatları için ${TURKEY_DAILY_REMINDER_LABEL} hatırlatması`;
      const schedule = await enableOverdueReminderSchedule({ userId: ctx.user.id, existingTaskUid: existing?.scheduleCronTaskUid, cron: TURKEY_DAILY_REMINDER_CRON, path: "/api/scheduled/overdue-rent-reminders", description, sessionToken }, { create: createHeartbeatJob, update: updateHeartbeatJob });
      if (existing) await db.update(overdueReminderRules).set({ status: "aktif", cronExpression: TURKEY_DAILY_REMINDER_CRON, scheduleCronTaskUid: schedule.taskUid }).where(eq(overdueReminderRules.id, existing.id));
      else await db.insert(overdueReminderRules).values({ userId: ctx.user.id, status: "aktif", cronExpression: TURKEY_DAILY_REMINDER_CRON, scheduleCronTaskUid: schedule.taskUid });
      return { enabled: true, nextExecutionAt: schedule.nextExecutionAt };
    }),
    disableDaily: protectedProcedure.mutation(async ({ ctx }) => {
      if (!canManageOwnerReminder(ctx.user.openId, ENV.ownerOpenId)) throw new TRPCError({ code: "FORBIDDEN", message: "Hatırlatma kuralı yalnızca proje sahibi tarafından duraklatılabilir." });
      const db = await dbOrThrow();
      const sessionToken = parseCookie(ctx.req.headers.cookie ?? "")[COOKIE_NAME] ?? "";
      const existing = (await db.select().from(overdueReminderRules).where(eq(overdueReminderRules.userId, ctx.user.id)).limit(1))[0];
      if (process.env.VERCEL === "1") {
        if (existing) await db.update(overdueReminderRules).set({ status: "pasif" }).where(eq(overdueReminderRules.id, existing.id));
        return { enabled: false };
      }
      const result = await disableOverdueReminderSchedule(existing?.scheduleCronTaskUid, sessionToken, { create: createHeartbeatJob, update: updateHeartbeatJob });
      if (!result.updated) return { enabled: false };
      await db.update(overdueReminderRules).set({ status: "pasif" }).where(eq(overdueReminderRules.id, existing.id));
      return { enabled: false };
    }),
  }),
  backups: router({
    list: protectedProcedure.query(async ({ ctx }) => (await dbOrThrow()).select().from(backupLogs).where(eq(backupLogs.userId, ctx.user.id)).orderBy(desc(backupLogs.createdAt))),
    record: protectedProcedure.input(z.object({ label: z.string().trim().min(2).max(160), scope: z.string().trim().min(2).max(120) })).mutation(async ({ ctx, input }) => {
      const db = await dbOrThrow();
      const countRows = await Promise.all([sites, buildings, units, tenants, leaseContracts, rentCharges, financialRecords, assets, documents].map(table => db.select({ value: sql<number>`count(*)` }).from(table).where(eq(table.userId, ctx.user.id))));
      const recordCount = countRows.reduce((sum, rows) => sum + Number(rows[0]?.value ?? 0), 0);
      const result = await db.insert(backupLogs).values({ ...input, recordCount, userId: ctx.user.id }); return { id: result[0].insertId, recordCount };
    }),
  }),
});
