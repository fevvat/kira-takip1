import React from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "./ui/button";

type RecordActionsProps = {
  onEdit: () => void;
  onDelete: () => void;
  isReadOnly?: boolean;
};

export function RecordActions({ onEdit, onDelete, isReadOnly = false }: RecordActionsProps) {
  if (isReadOnly) return <span className="text-xs font-medium text-slate-400">Örnek kayıt</span>;
  return <div className="flex justify-end gap-1"><Button onClick={onEdit} variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-stone-500 hover:bg-stone-100 hover:text-stone-800" aria-label="Kaydı düzenle"><Pencil className="h-3.5 w-3.5" /></Button><Button onClick={onDelete} variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-stone-400 hover:bg-rose-50 hover:text-rose-600" aria-label="Kaydı sil"><Trash2 className="h-3.5 w-3.5" /></Button></div>;
}
