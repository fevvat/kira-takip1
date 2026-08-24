import { beforeEach, describe, expect, it, vi } from "vitest";
import { COOKIE_NAME } from "../shared/const";

const getDb = vi.fn(); const createHeartbeatJob = vi.fn(); const updateHeartbeatJob = vi.fn();
vi.mock("./db", () => ({ getDb }));
vi.mock("./_core/heartbeat", () => ({ createHeartbeatJob, updateHeartbeatJob }));

function dbFor(existing: any) { const query: any = {}; query.from = vi.fn(() => query); query.where = vi.fn(() => query); query.limit = vi.fn(() => Promise.resolve(existing ? [existing] : [])); const update: any = {}; update.set = vi.fn(() => update); update.where = vi.fn(() => Promise.resolve(undefined)); return { select: vi.fn(() => query), update: vi.fn(() => update), insert: vi.fn(() => ({ values: vi.fn().mockResolvedValue(undefined) })) }; }

describe("rental.reminders zamanlayıcı yordamları", async () => {
  const { appRouter } = await import("./routers"); const { ENV } = await import("./_core/env");
  const context = (openId: string) => ({ user: { id: 9, openId, name: "Owner", email: "owner@example.com", loginMethod: "manus", role: "admin", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() }, req: { headers: { cookie: `${COOKIE_NAME}=test` } }, res: {} }) as any;
  beforeEach(() => { vi.clearAllMocks(); createHeartbeatJob.mockResolvedValue({ taskUid: "task-new", nextExecutionAt: "2026-08-25T06:00:00Z" }); updateHeartbeatJob.mockResolvedValue({ nextExecutionAt: "2026-08-25T06:00:00Z" }); });
  it("yetkisiz kullanıcıda FORBIDDEN döndürür", async () => { getDb.mockResolvedValue(dbFor(null)); await expect(appRouter.createCaller(context("not-owner")).rental.reminders.enableDaily()).rejects.toMatchObject({ code: "FORBIDDEN" }); });
  it("ilk başlatmada zamanlayıcı görevi oluşturur", async () => { getDb.mockResolvedValue(dbFor(null)); const result = await appRouter.createCaller(context(ENV.ownerOpenId)).rental.reminders.enableDaily(); expect(result.enabled).toBe(true); expect(createHeartbeatJob).toHaveBeenCalledOnce(); });
  it("mevcut görevi yeniden etkinleştirir ve duraklatır", async () => { const existing = { id: 1, userId: 9, status: "pasif", scheduleCronTaskUid: "task-old" }; getDb.mockResolvedValue(dbFor(existing)); const caller = appRouter.createCaller(context(ENV.ownerOpenId)); await caller.rental.reminders.enableDaily(); expect(updateHeartbeatJob).toHaveBeenCalledWith("task-old", expect.objectContaining({ enable: true }), "test"); await caller.rental.reminders.disableDaily(); expect(updateHeartbeatJob).toHaveBeenCalledWith("task-old", { enable: false }, "test"); });
});
