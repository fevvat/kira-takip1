import { describe, expect, it } from "vitest";
import { shouldUseDemoData } from "./demoMode";

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
});
