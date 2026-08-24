import { describe, expect, it } from "vitest";
import { canMutateRecord, shouldUseDemoData } from "../shared/demoMode";

describe("örnek veri modu", () => {
  it("veriler yüklenirken örnek kayıtları göstermez", () => {
    expect(shouldUseDemoData(true, false)).toBe(false);
  });

  it("kullanıcı kaydı olmadığında örnek kayıtları gösterir", () => {
    expect(shouldUseDemoData(false, false)).toBe(true);
  });

  it("kullanıcı kaydı bulunduğunda gerçek veriyi önceler", () => {
    expect(shouldUseDemoData(false, true)).toBe(false);
  });

  it("örnek kayıt satırlarında mutasyon izni vermez", () => {
    expect(canMutateRecord(true)).toBe(false);
  });

  it("salt okunur işaretli gerçek kayıt için de mutasyon izni vermez", () => {
    expect(canMutateRecord(false, true)).toBe(false);
  });

  it("gerçek ve salt okunur olmayan kayıtlar için mutasyon izni verir", () => {
    expect(canMutateRecord(false)).toBe(true);
  });
});
