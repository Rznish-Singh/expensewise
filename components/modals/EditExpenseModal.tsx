"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { cn, todayISO } from "@/lib/utils";
import { CATEGORY_META, type ExpenseCategory, type Expense } from "@/types";
import { useExpenses } from "@/hooks/useExpenses";

interface Props {
  expense: Expense | null;
  onClose: () => void;
  onSuccess?: () => void;
}

const EXPENSE_CATS = Object.entries(CATEGORY_META)
  .filter(([cat]) => cat !== "income")
  .map(([cat, meta]) => ({ cat: cat as ExpenseCategory, ...meta }));

export function EditExpenseModal({ expense, onClose, onSuccess }: Props) {
  const { updateExpense } = useExpenses();

  const [description, setDescription] = useState("");
  const [amount, setAmount]           = useState("");
  const [date, setDate]               = useState(todayISO());
  const [category, setCategory]       = useState<ExpenseCategory>("food");
  const [type, setType]               = useState<"expense" | "income">("expense");
  const [notes, setNotes]             = useState("");
  const [submitting, setSubmitting]   = useState(false);

  useEffect(() => {
    if (!expense) return;
    setDescription(expense.description);
    setAmount(String(expense.amount));
    setDate(expense.date);
    setCategory(expense.category as ExpenseCategory);
    setType(expense.type);
    setNotes(expense.notes ?? "");
  }, [expense]);

  async function handleSubmit() {
    if (!expense) return;
    if (!description.trim()) return;
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) return;

    setSubmitting(true);
    try {
      await updateExpense(expense.id, {
        description: description.trim(),
        amount: amt,
        category: type === "income" ? "income" : category,
        type,
        date,
        notes: notes.trim() || undefined,
      });
      onSuccess?.();
      onClose();
    } finally {
      setSubmitting(false);
    }
  }

  if (!expense) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-black/[0.07]">
          <h2 className="font-serif text-xl font-light">Edit Transaction</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {/* Type tabs */}
          <div className="flex bg-[#F7F6F2] rounded-lg p-1 gap-1">
            {(["expense", "income"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={cn(
                  "flex-1 py-2 rounded-md text-[13px] font-medium transition-all",
                  type === t
                    ? "bg-white text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {t === "expense" ? "💸 Expense" : "💰 Income"}
              </button>
            ))}
          </div>

          {/* Description */}
          <div>
            <label className="block text-[12px] font-medium text-muted-foreground mb-1.5">Description</label>
            <input
              className="w-full px-3.5 py-2.5 border border-border rounded-lg text-[13px] bg-[#F7F6F2] outline-none focus:border-green-500 focus:bg-white transition-all"
              placeholder="e.g. Lunch at Cafe"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Amount + Date row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-medium text-muted-foreground mb-1.5">Amount (₹)</label>
              <input
                type="number"
                min="0"
                className="w-full px-3.5 py-2.5 border border-border rounded-lg text-[13px] bg-[#F7F6F2] outline-none focus:border-green-500 focus:bg-white transition-all"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-muted-foreground mb-1.5">Date</label>
              <input
                type="date"
                className="w-full px-3.5 py-2.5 border border-border rounded-lg text-[13px] bg-[#F7F6F2] outline-none focus:border-green-500 focus:bg-white transition-all"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>

          {/* Category chips (only for expense) */}
          {type === "expense" && (
            <div>
              <label className="block text-[12px] font-medium text-muted-foreground mb-1.5">Category</label>
              <div className="flex flex-wrap gap-2">
                {EXPENSE_CATS.map(({ cat, emoji, label, bgColor, textColor }) => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[12px] transition-all",
                      category === cat
                        ? "border-green-500 font-medium"
                        : "border-border hover:border-black/20"
                    )}
                    style={category === cat ? { background: bgColor, color: textColor } : {}}
                  >
                    <span>{emoji}</span>
                    {label.split(" ")[0]}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-[12px] font-medium text-muted-foreground mb-1.5">
              Notes <span className="text-muted-foreground/60">(optional)</span>
            </label>
            <textarea
              className="w-full px-3.5 py-2.5 border border-border rounded-lg text-[13px] bg-[#F7F6F2] outline-none focus:border-green-500 focus:bg-white transition-all resize-none h-16"
              placeholder="Any additional notes…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-2.5 px-6 pb-6">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border border-border rounded-lg text-[13px] text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || !description.trim() || !amount}
            className="flex-[2] py-2.5 bg-green-500 hover:bg-green-700 disabled:opacity-50 text-white rounded-lg text-[13px] font-medium transition-colors"
          >
            {submitting ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
