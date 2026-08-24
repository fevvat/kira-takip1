export const TURKEY_DAILY_REMINDER_CRON = "0 0 6 * * *";
export const TURKEY_DAILY_REMINDER_LABEL = "Her gün 09:00 (Türkiye saati)";

export function buildOverdueReminderContent(items: Array<{ tenantName: string | null; unitNumber: string | null; remaining: number }>): string {
  const total = items.reduce((sum, item) => sum + item.remaining, 0);
  const preview = items.slice(0, 5).map(item => `${item.tenantName ?? "Kiracı"} · ${item.unitNumber ?? "Bölüm"}: ₺${item.remaining.toLocaleString("tr-TR")}`).join("\n");
  return `Toplam geciken alacak: ₺${total.toLocaleString("tr-TR")}\n${preview}`;
}
