import { describe, expect, it } from "vitest";
import { withListDemoFallback, withObjectDemoFallback } from "../shared/demoFallback";

describe("modül bazlı örnek veri geri dönüşü", () => {
  it("dolu modülde gerçek listeyi korur", () => {
    expect(withListDemoFallback(["gerçek"], ["örnek"])).toEqual({ data: ["gerçek"], isDemo: false });
  });

  it("boş modülde örnek listeyi gösterir", () => {
    expect(withListDemoFallback([], ["örnek"])).toEqual({ data: ["örnek"], isDemo: true });
  });

  it("verisi olan özet nesnesini korur", () => {
    expect(withObjectDemoFallback({ count: 1 }, true, { count: 4 })).toEqual({ data: { count: 1 }, isDemo: false });
  });

  it("boş özet nesnesi için örnek veriyi kullanır", () => {
    expect(withObjectDemoFallback({ count: 0 }, false, { count: 4 })).toEqual({ data: { count: 4 }, isDemo: true });
  });
});
