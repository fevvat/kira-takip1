import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { RecordActions } from "../client/src/components/RecordActions";

describe("örnek kayıt aksiyonları", () => {
  it("salt okunur örnek kayıtta düzenle ve sil denetimlerini render etmez", () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    const markup = renderToStaticMarkup(createElement(RecordActions, { isReadOnly: true, onEdit, onDelete }));

    expect(markup).toContain("Örnek kayıt");
    expect(markup).not.toContain("Kaydı düzenle");
    expect(markup).not.toContain("Kaydı sil");
    expect(onEdit).not.toHaveBeenCalled();
    expect(onDelete).not.toHaveBeenCalled();
  });

  it("gerçek kayıtta düzenle ve sil denetimlerini render eder", () => {
    const markup = renderToStaticMarkup(createElement(RecordActions, { onEdit: vi.fn(), onDelete: vi.fn() }));

    expect(markup).toContain("Kaydı düzenle");
    expect(markup).toContain("Kaydı sil");
  });
});
