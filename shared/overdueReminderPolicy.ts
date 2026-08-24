export function canManageOwnerReminder(userOpenId: string, ownerOpenId: string): boolean {
  return Boolean(userOpenId) && userOpenId === ownerOpenId;
}

export function isAuthorizedOverdueReminderRun(isCron: boolean, taskUid: string | undefined, expectedTaskUid: string | null): boolean {
  return isCron && Boolean(taskUid) && taskUid === expectedTaskUid;
}
