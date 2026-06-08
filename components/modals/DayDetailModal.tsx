"use client";

import { useEffect, useRef } from "react";
import { X, Plus } from "lucide-react";
import { formatCurrency, formatDate, getCategoryMeta } from "@/lib/utils";
import { type Expense, type ExpenseCategory } from "@/types";
import { format, parseISO } from "date-fns";

interface DayDetailModalProps {
  date: string | null;
  expenses: Expense[];
  onClose: () => void;
  onAddExpense: (date: string) => void;
}

export function DayDetailModal({ date, expenses, onClose, onAddExpense }: DayDetailModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef  = useRef<unknown>(null);

  const dayExpenses = expenses.filter(e => e.type === "expense");
  const total       = dayExpenses.reduce((s, e) => s + Number(e.amount), 0);

  useEffect(() => {
    if (!date || !canvasRef.current || !dayExpenses.length) return;

    import("chart.js").then(({ Chart: ChartJS, registerables }) => {
      ChartJS.register(...registerables);
      if (chartRef.current) (chartRef.current as import("chart.js").Chart).destroy();
      const ctx = canvasRef.current!.getContext("2d")!;
      chartRef.current = new ChartJS(ctx, {
        type: "bar",
        data: {
          labels: dayExpenses.map(e =>
            e.description.length > 14 ? e.description.slice(0, 13) + "…" : e.description
          ),
          datasets: [{
            data: dayExpenses.map(e => Number(e.amount)),
            backgroundColor: dayExpenses.map((e, i) =>
              ["#1D9E75","#378ADD","#534AB7","#BA7517","#D85A30","#4D9E1D"][i % 6]
            ),
            borderRadius: 6,
            borderSkipped: false,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (c) => ` ₹${Number(c.raw).toLocaleString("en-IN")}`,
              },
            },
          },
          scales: {
            x: { ticks: { font: { size: 10 } }, grid: { display: false }, border: { display: false } },
            y: {
              ticks: { callback: (v) => `₹${v}`, font: { size: 10 } },
              grid: { color: "rgba(0,0,0,0.04)" },
              border: { display: false },
            },
          },
        },
      });
    });

    return () => {
      if (chartRef.current) {
        (chartRef.current as import("chart.js").Chart).destroy();
        chartRef.current = null;
      }
    };
  }, [date, dayExpenses]);

  if (!date) return null;

  const displayDate = format(parseISO(date), "EEEE, MMMM d yyyy");

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-fade-in">
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-black/[0.07]">
          <div>
            <div className="font-serif text-[20px] font-light">{displayDate}</div>
            <div
              className="text-[28px] font-serif font-light mt-1"
              style={{ color: total > 0 ? "#D85A30" : "#1D9E75" }}
            >
              {total > 0 ? `₹${total.toLocaleString("en-IN")} spent` : "No expenses"}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground mt-1"
          >
            <X size={18} />
          </button>
        </div>

        {/* Transactions */}
        <div className="px-6 py-4 max-h-[220px] overflow-y-auto">
          {dayExpenses.length === 0 ? (
            <p className="text-[13px] text-muted-foreground text-center py-6">
              No transactions on this day
            </p>
          ) : (
            <div className="divide-y divide-black/[0.05]">
              {dayExpenses.map(tx => {
                const meta = getCategoryMeta(tx.category as ExpenseCategory);
                return (
                  <div key={tx.id} className="flex items-center gap-3 py-2.5">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-base flex-shrink-0"
                      style={{ background: meta.bgColor }}
                    >
                      {meta.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-medium truncate">{tx.description}</div>
                      <div className="text-[11px] text-muted-foreground">{meta.label}</div>
                    </div>
                    <div className="text-[13px] font-semibold text-red-600">
                      −₹{Number(tx.amount).toLocaleString("en-IN")}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Bar chart */}
        {dayExpenses.length > 0 && (
          <div className="px-6 pb-4">
            <div className="h-[120px]">
              <canvas ref={canvasRef} />
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex gap-2.5 px-6 pb-5">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border border-border rounded-lg text-[13px] text-muted-foreground hover:text-foreground"
          >
            Close
          </button>
          <button
            onClick={() => { onClose(); onAddExpense(date); }}
            className="flex-[2] py-2.5 bg-green-500 hover:bg-green-700 text-white rounded-lg text-[13px] font-medium flex items-center justify-center gap-2 transition-colors"
          >
            <Plus size={14} />
            Add for this day
          </button>
        </div>
      </div>
    </div>
  );
}
