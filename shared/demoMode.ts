export function shouldUseDemoData(isLoading: boolean, hasUserData: boolean): boolean {
  return !isLoading && !hasUserData;
}

export function canMutateRecord(isDemoMode: boolean, isReadOnly = false): boolean {
  return !isDemoMode && !isReadOnly;
}
