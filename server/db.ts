import { and, asc, desc, eq, lt, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { backupLogs, InsertUser, leaseContracts, rentCharges, tenants, units, users } from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;
  const values: InsertUser = { openId: user.openId, lastSignedIn: user.lastSignedIn ?? new Date() };
  const updateSet: Record<string, unknown> = { lastSignedIn: values.lastSignedIn };
  (["name", "email", "loginMethod"] as const).forEach(field => {
    if (user[field] !== undefined) {
      values[field] = user[field] ?? null;
      updateSet[field] = user[field] ?? null;
    }
  });
  values.role = user.role ?? (user.openId === ENV.ownerOpenId ? "admin" : "user");
  updateSet.role = values.role;
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export async function getDashboardSummary(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Veritabanı bağlantısı kurulamadı.");
  const count = async (table: typeof units | typeof tenants | typeof leaseContracts) => {
    const result = await db.select({ value: sql<number>`count(*)` }).from(table).where(eq(table.userId, userId));
    return Number(result[0]?.value ?? 0);
  };
  const [unitCount, tenantCount, activeContractCount, occupancy] = await Promise.all([
    count(units),
    count(tenants),
    db.select({ value: sql<number>`count(*)` }).from(leaseContracts).where(and(eq(leaseContracts.userId, userId), eq(leaseContracts.status, "aktif"))).then(rows => Number(rows[0]?.value ?? 0)),
    db.select({
      occupied: sql<number>`sum(case when ${units.status} = 'dolu' then 1 else 0 end)`,
      available: sql<number>`sum(case when ${units.status} = 'bos' then 1 else 0 end)`,
    }).from(units).where(eq(units.userId, userId)),
  ]);
  const chargeRows = await db.select({
    pending: sql<string>`coalesce(sum(case when ${rentCharges.status} in ('bekliyor', 'gecikti') then ${rentCharges.amount} - ${rentCharges.paidAmount} else 0 end), 0)`,
    overdue: sql<number>`sum(case when ${rentCharges.dueDate} < UTC_DATE() and ${rentCharges.paidAmount} < ${rentCharges.amount} then 1 else 0 end)`,
  }).from(rentCharges).where(eq(rentCharges.userId, userId));
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const overdueCharges = await db.select({
    id: rentCharges.id,
    dueDate: rentCharges.dueDate,
    tenantName: tenants.fullName,
    unitNumber: units.unitNumber,
    remaining: sql<number>`${rentCharges.amount} - ${rentCharges.paidAmount}`,
  }).from(rentCharges)
    .leftJoin(leaseContracts, eq(rentCharges.contractId, leaseContracts.id))
    .leftJoin(tenants, eq(leaseContracts.tenantId, tenants.id))
    .leftJoin(units, eq(leaseContracts.unitId, units.id))
    .where(and(eq(rentCharges.userId, userId), lt(rentCharges.dueDate, today), sql`${rentCharges.paidAmount} < ${rentCharges.amount}`))
    .orderBy(asc(rentCharges.dueDate)).limit(5);
  const recentBackups = await db.select().from(backupLogs).where(eq(backupLogs.userId, userId)).orderBy(desc(backupLogs.createdAt)).limit(3);
  return {
    unitCount,
    tenantCount,
    activeContractCount,
    occupiedUnitCount: Number(occupancy[0]?.occupied ?? 0),
    availableUnitCount: Number(occupancy[0]?.available ?? 0),
    outstandingAmount: Number(chargeRows[0]?.pending ?? 0),
    overdueCount: Number(chargeRows[0]?.overdue ?? 0),
    overdueCharges: overdueCharges.map(charge => ({ ...charge, remaining: Number(charge.remaining) })),
    recentBackups,
  };
}
