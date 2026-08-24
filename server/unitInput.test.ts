import { describe, expect, it } from "vitest";
import { unitInput } from "./routers/rentals";

const completeUnit = {
  buildingId: 1,
  unitNumber: "A-12",
  floor: "3",
  unitType: "Daire",
  grossArea: 112,
  netArea: 94,
  roomCount: "3+1",
  targetRent: 28500,
  monthlyDues: 1750,
  furnished: "hayir",
  parkingSlot: "P-18",
  electricityMeterNo: "E-40213",
  waterMeterNo: "S-30192",
  naturalGasMeterNo: "DG-56041",
  status: "bos",
  notes: "İlk kiralama için hazır.",
};

describe("detaylı bağımsız bölüm girişi", () => {
  it("kira, aidat, alan ve sayaç bilgileriyle eksiksiz bir bölümü kabul eder", () => {
    expect(unitInput.parse(completeUnit)).toMatchObject(completeUnit);
  });

  it("negatif alan veya geçersiz eşyalı durumunu reddeder", () => {
    expect(unitInput.safeParse({ ...completeUnit, netArea: -1 }).success).toBe(false);
    expect(unitInput.safeParse({ ...completeUnit, furnished: "belirsiz" }).success).toBe(false);
  });
});
