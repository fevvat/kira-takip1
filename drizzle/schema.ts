import { date, decimal, index, int, mysqlEnum, mysqlTable, text, timestamp, uniqueIndex, varchar } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

const ownership = {
  userId: int("userId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
};

export const sites = mysqlTable("sites", {
  id: int("id").autoincrement().primaryKey(),
  ...ownership,
  name: varchar("name", { length: 160 }).notNull(),
  address: text("address"),
  notes: text("notes"),
}, table => [index("sites_user_idx").on(table.userId)]);

export const buildings = mysqlTable("buildings", {
  id: int("id").autoincrement().primaryKey(),
  ...ownership,
  siteId: int("siteId").notNull(),
  name: varchar("name", { length: 160 }).notNull(),
  block: varchar("block", { length: 40 }),
  address: text("address"),
  notes: text("notes"),
}, table => [index("buildings_user_idx").on(table.userId), index("buildings_site_idx").on(table.siteId)]);

export const units = mysqlTable("units", {
  id: int("id").autoincrement().primaryKey(),
  ...ownership,
  buildingId: int("buildingId").notNull(),
  unitNumber: varchar("unitNumber", { length: 32 }).notNull(),
  floor: varchar("floor", { length: 24 }),
  unitType: varchar("unitType", { length: 80 }),
  grossArea: int("grossArea"),
  netArea: int("netArea"),
  roomCount: varchar("roomCount", { length: 24 }),
  targetRent: decimal("targetRent", { precision: 13, scale: 2 }),
  monthlyDues: decimal("monthlyDues", { precision: 13, scale: 2 }),
  furnished: mysqlEnum("furnished", ["evet", "hayir"]).default("hayir").notNull(),
  parkingSlot: varchar("parkingSlot", { length: 40 }),
  electricityMeterNo: varchar("electricityMeterNo", { length: 64 }),
  waterMeterNo: varchar("waterMeterNo", { length: 64 }),
  naturalGasMeterNo: varchar("naturalGasMeterNo", { length: 64 }),
  status: mysqlEnum("status", ["bos", "dolu", "pasif"]).default("bos").notNull(),
  notes: text("notes"),
}, table => [
  index("units_user_idx").on(table.userId),
  index("units_building_idx").on(table.buildingId),
  uniqueIndex("units_building_number_unique").on(table.buildingId, table.unitNumber),
]);

export const tenants = mysqlTable("tenants", {
  id: int("id").autoincrement().primaryKey(),
  ...ownership,
  fullName: varchar("fullName", { length: 160 }).notNull(),
  identityNumber: varchar("identityNumber", { length: 32 }),
  phone: varchar("phone", { length: 32 }),
  email: varchar("email", { length: 320 }),
  emergencyContact: varchar("emergencyContact", { length: 160 }),
  notes: text("notes"),
}, table => [index("tenants_user_idx").on(table.userId)]);

export const leaseContracts = mysqlTable("leaseContracts", {
  id: int("id").autoincrement().primaryKey(),
  ...ownership,
  unitId: int("unitId").notNull(),
  tenantId: int("tenantId").notNull(),
  startDate: date("startDate").notNull(),
  endDate: date("endDate").notNull(),
  monthlyRent: decimal("monthlyRent", { precision: 13, scale: 2 }).notNull(),
  increasePeriodMonths: int("increasePeriodMonths").default(12).notNull(),
  securityDeposit: decimal("securityDeposit", { precision: 13, scale: 2 }).default("0").notNull(),
  paymentDay: int("paymentDay").default(1).notNull(),
  status: mysqlEnum("status", ["aktif", "yaklasan", "sona_erdi"]).default("aktif").notNull(),
  notes: text("notes"),
}, table => [
  index("contracts_user_idx").on(table.userId),
  index("contracts_unit_idx").on(table.unitId),
  index("contracts_tenant_idx").on(table.tenantId),
]);

export const rentCharges = mysqlTable("rentCharges", {
  id: int("id").autoincrement().primaryKey(),
  ...ownership,
  contractId: int("contractId").notNull(),
  period: varchar("period", { length: 7 }).notNull(),
  dueDate: date("dueDate").notNull(),
  amount: decimal("amount", { precision: 13, scale: 2 }).notNull(),
  paidAmount: decimal("paidAmount", { precision: 13, scale: 2 }).default("0").notNull(),
  paidAt: date("paidAt"),
  status: mysqlEnum("status", ["bekliyor", "odendi", "gecikti"]).default("bekliyor").notNull(),
  notes: text("notes"),
}, table => [
  index("charges_user_idx").on(table.userId),
  index("charges_contract_idx").on(table.contractId),
  uniqueIndex("charges_contract_period_unique").on(table.contractId, table.period),
]);

export const financialRecords = mysqlTable("financialRecords", {
  id: int("id").autoincrement().primaryKey(),
  ...ownership,
  kind: mysqlEnum("kind", ["gelir", "gider"]).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  recordDate: date("recordDate").notNull(),
  amount: decimal("amount", { precision: 13, scale: 2 }).notNull(),
  unitId: int("unitId"),
  contractId: int("contractId"),
  description: text("description"),
}, table => [index("finance_user_idx").on(table.userId), index("finance_date_idx").on(table.recordDate)]);

export const assets = mysqlTable("assets", {
  id: int("id").autoincrement().primaryKey(),
  ...ownership,
  unitId: int("unitId"),
  name: varchar("name", { length: 160 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  acquisitionDate: date("acquisitionDate"),
  cost: decimal("cost", { precision: 13, scale: 2 }).default("0").notNull(),
  status: mysqlEnum("status", ["aktif", "bakimda", "hurda"]).default("aktif").notNull(),
  notes: text("notes"),
}, table => [index("assets_user_idx").on(table.userId), index("assets_unit_idx").on(table.unitId)]);

export const documents = mysqlTable("documents", {
  id: int("id").autoincrement().primaryKey(),
  ...ownership,
  title: varchar("title", { length: 180 }).notNull(),
  category: mysqlEnum("category", ["sozlesme", "kimlik", "tahsilat", "diger"]).default("diger").notNull(),
  contractId: int("contractId"),
  unitId: int("unitId"),
  tenantId: int("tenantId"),
  fileName: varchar("fileName", { length: 255 }),
  externalUrl: varchar("externalUrl", { length: 2048 }),
  notes: text("notes"),
}, table => [index("documents_user_idx").on(table.userId)]);

export const backupLogs = mysqlTable("backupLogs", {
  id: int("id").autoincrement().primaryKey(),
  ...ownership,
  label: varchar("label", { length: 160 }).notNull(),
  scope: varchar("scope", { length: 120 }).default("Tum veriler").notNull(),
  recordCount: int("recordCount").default(0).notNull(),
  status: mysqlEnum("status", ["hazir", "arsivlendi"]).default("hazir").notNull(),
}, table => [index("backups_user_idx").on(table.userId)]);

export const overdueReminderRules = mysqlTable("overdueReminderRules", {
  id: int("id").autoincrement().primaryKey(),
  ...ownership,
  status: mysqlEnum("status", ["aktif", "pasif"]).default("aktif").notNull(),
  cronExpression: varchar("cronExpression", { length: 80 }).notNull(),
  scheduleCronTaskUid: varchar("scheduleCronTaskUid", { length: 65 }),
  lastRunAt: timestamp("lastRunAt"),
  lastNotificationAt: timestamp("lastNotificationAt"),
  lastOverdueCount: int("lastOverdueCount").default(0).notNull(),
}, table => [
  uniqueIndex("overdue_reminder_user_unique").on(table.userId),
  uniqueIndex("overdue_reminder_task_unique").on(table.scheduleCronTaskUid),
  index("overdue_reminder_task_idx").on(table.scheduleCronTaskUid),
]);

export const appNotifications = mysqlTable("appNotifications", {
  id: int("id").autoincrement().primaryKey(),
  ...ownership,
  kind: mysqlEnum("kind", ["geciken_kira"]).notNull(),
  title: varchar("title", { length: 160 }).notNull(),
  content: text("content").notNull(),
  dedupeKey: varchar("dedupeKey", { length: 128 }).notNull(),
  isRead: mysqlEnum("isRead", ["evet", "hayir"]).default("hayir").notNull(),
}, table => [
  uniqueIndex("app_notification_dedupe_unique").on(table.userId, table.dedupeKey),
  index("app_notification_user_idx").on(table.userId, table.createdAt),
]);

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
