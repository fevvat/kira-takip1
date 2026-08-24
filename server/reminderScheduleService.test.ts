import { describe, expect, it, vi } from "vitest";
import { disableOverdueReminderSchedule, enableOverdueReminderSchedule } from "./reminderScheduleService";

const makeClient = () => ({
  create: vi.fn().mockResolvedValue({ taskUid: "task-new", nextExecutionAt: "2026-08-25T06:00:00Z" }),
  update: vi.fn().mockResolvedValue({ nextExecutionAt: "2026-08-25T06:00:00Z" }),
});
const input = { userId: 7, cron: "0 0 6 * * *", path: "/api/scheduled/overdue-rent-reminders", description: "test", sessionToken: "session" };

describe("günlük geciken kira zamanlayıcısı", () => {
  it("ilk etkinleştirmede yeni görev oluşturur", async () => {
    const client = makeClient(); const result = await enableOverdueReminderSchedule(input, client);
    expect(result).toMatchObject({ taskUid: "task-new", action: "created" });
    expect(client.create).toHaveBeenCalledOnce();
  });
  it("var olan görev tekrar etkinleştirildiğinde aynı görevi günceller", async () => {
    const client = makeClient(); const result = await enableOverdueReminderSchedule({ ...input, existingTaskUid: "task-current" }, client);
    expect(result).toMatchObject({ taskUid: "task-current", action: "restarted" });
    expect(client.update).toHaveBeenCalledWith("task-current", expect.objectContaining({ enable: true }), "session");
  });
  it("duraklatma yalnızca kayıtlı görev için zamanlayıcıyı pasifleştirir", async () => {
    const client = makeClient();
    await expect(disableOverdueReminderSchedule(null, "session", client)).resolves.toEqual({ updated: false });
    await expect(disableOverdueReminderSchedule("task-current", "session", client)).resolves.toEqual({ updated: true });
    expect(client.update).toHaveBeenCalledWith("task-current", { enable: false }, "session");
  });
});
