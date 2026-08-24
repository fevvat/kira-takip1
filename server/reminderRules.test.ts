import { describe, expect, it } from "vitest";
import { buildOverdueReminderContent, TURKEY_DAILY_REMINDER_CRON, TURKEY_DAILY_REMINDER_LABEL } from "../shared/reminderRules";

describe("geciken kira hatırlatma kuralları", () => {
  it("Türkiye saatiyle her gün 09:00 için geçerli altı alanlı UTC cron ifadesini kullanır", () => {
    expect(TURKEY_DAILY_REMINDER_CRON).toBe("0 0 6 * * *");
    expect(TURKEY_DAILY_REMINDER_LABEL).toContain("09:00");
  });

  it("geciken kayıtları ve toplam bakiyeyi bildirim içeriğinde özetler", () => {
    const content = buildOverdueReminderContent([
      { tenantName: "Ayşe Demir", unitNumber: "A-03", remaining: 26000 },
      { tenantName: "Mehmet Kaya", unitNumber: "B-01", remaining: 8500 },
    ]);

    expect(content).toContain("₺34.500");
    expect(content).toContain("Ayşe Demir · A-03");
    expect(content).toContain("Mehmet Kaya · B-01");
  });
});
