import { describe, expect, it, vi } from "vitest";
import { isAuthorizedOverdueReminderRun, canManageOwnerReminder } from "../shared/overdueReminderPolicy";
import { deliverOverdueReminder, persistUserOverdueReminder } from "./scheduled/overdueRentReminders";

describe("geciken kira hatırlatma akışı", () => {
  it("yalnızca proje sahibi hesabının owner bildirim kuralını yönetmesine izin verir", () => {
    expect(canManageOwnerReminder("owner-open-id", "owner-open-id")).toBe(true);
    expect(canManageOwnerReminder("tenant-open-id", "owner-open-id")).toBe(false);
  });

  it("yalnızca kaydedilen görevin cron isteğini kabul eder", () => {
    expect(isAuthorizedOverdueReminderRun(true, "task-1", "task-1")).toBe(true);
    expect(isAuthorizedOverdueReminderRun(false, "task-1", "task-1")).toBe(false);
    expect(isAuthorizedOverdueReminderRun(true, "task-2", "task-1")).toBe(false);
  });

  it("geciken kayıt varsa proje sahibine bildirim gönderir; yoksa çağrı yapmaz", async () => {
    const sender = vi.fn().mockResolvedValue(true);
    await expect(deliverOverdueReminder([{ tenantName: "Ayşe Demir", unitNumber: "A-03", remaining: 26000 }], sender)).resolves.toBe(true);
    expect(sender).toHaveBeenCalledOnce();
    expect(sender.mock.calls[0]?.[0].title).toContain("1 geciken tahsilat");
    sender.mockClear();
    await expect(deliverOverdueReminder([], sender)).resolves.toBe(false);
    expect(sender).not.toHaveBeenCalled();
  });

  it("geciken kira özetini ilgili kullanıcı için uygulama içi bildirim olarak saklar", async () => {
    const onDuplicateKeyUpdate = vi.fn().mockResolvedValue(undefined);
    const values = vi.fn(() => ({ onDuplicateKeyUpdate }));
    const db = { insert: vi.fn(() => ({ values })) };
    const result = await persistUserOverdueReminder(db, 42, new Date("2026-08-24T06:00:00.000Z"), [{ tenantName: "Ayşe Demir", unitNumber: "A-03", remaining: 26000 }]);
    expect(result).toBe(true);
    expect(values).toHaveBeenCalledWith(expect.objectContaining({ userId: 42, kind: "geciken_kira", dedupeKey: "geciken-kira:2026-08-24" }));
    expect(onDuplicateKeyUpdate).toHaveBeenCalledOnce();
  });
});
