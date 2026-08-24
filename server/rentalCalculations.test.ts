import { describe, expect, it } from "vitest";
import { deriveChargeStatus, formatPeriod } from "../shared/rentalCalculations";

describe("kira tahakkuku durumları", () => {
  it("tam tahsil edilen kaydı ödendi olarak işaretler", () => {
    expect(deriveChargeStatus({ amount: 25000, paidAmount: 25000, dueDate: "2026-08-01", today: "2026-08-24" })).toBe("odendi");
  });

  it("vadesi geçen eksik tahsilatı gecikti olarak işaretler", () => {
    expect(deriveChargeStatus({ amount: 25000, paidAmount: 5000, dueDate: "2026-08-01", today: "2026-08-24" })).toBe("gecikti");
  });

  it("gelecek vadeli tahakkuku bekliyor olarak işaretler", () => {
    expect(deriveChargeStatus({ amount: 25000, paidAmount: 0, dueDate: "2026-09-01", today: "2026-08-24" })).toBe("bekliyor");
  });

  it("raporlama için yıl-ay dönemini iki haneli üretir", () => {
    expect(formatPeriod(new Date(2026, 0, 15))).toBe("2026-01");
  });
});

