export type ChargeStatus = "bekliyor" | "odendi" | "gecikti";

export function deriveChargeStatus(input: {
  amount: number;
  paidAmount: number;
  dueDate: string;
  today?: string;
}): ChargeStatus {
  if (input.paidAmount >= input.amount && input.amount > 0) return "odendi";
  const today = input.today ?? new Date().toISOString().slice(0, 10);
  return input.dueDate < today ? "gecikti" : "bekliyor";
}

export function formatPeriod(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${date.getFullYear()}-${month}`;
}
