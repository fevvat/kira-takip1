export type ReminderScheduleClient = {
  create: (input: { name: string; cron: string; path: string; description: string }, sessionToken: string) => Promise<{ taskUid: string; nextExecutionAt?: string | null }>;
  update: (taskUid: string, input: { cron?: string; path?: string; enable?: boolean; description?: string }, sessionToken: string) => Promise<{ taskUid?: string; nextExecutionAt?: string | null }>;
};

type ScheduleInput = { userId: number; existingTaskUid?: string | null; cron: string; path: string; description: string; sessionToken: string };

export async function enableOverdueReminderSchedule(input: ScheduleInput, client: ReminderScheduleClient) {
  if (input.existingTaskUid) {
    const result = await client.update(input.existingTaskUid, { cron: input.cron, path: input.path, enable: true, description: input.description }, input.sessionToken);
    return { taskUid: input.existingTaskUid, nextExecutionAt: result.nextExecutionAt ?? null, action: "restarted" as const };
  }
  const result = await client.create({ name: `overdue-rent-reminders-${input.userId}`, cron: input.cron, path: input.path, description: input.description }, input.sessionToken);
  return { taskUid: result.taskUid, nextExecutionAt: result.nextExecutionAt ?? null, action: "created" as const };
}

export async function disableOverdueReminderSchedule(taskUid: string | null | undefined, sessionToken: string, client: ReminderScheduleClient) {
  if (!taskUid) return { updated: false };
  await client.update(taskUid, { enable: false }, sessionToken);
  return { updated: true };
}
