"use client";

import { useState, useMemo } from "react";
import { Download, Search, Trash2, Pencil } from "lucide-react";
import { useExpenses, useExportPDF } from "@/hooks/useExpenses";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { CategoryTag } from "@/components/ui/CategoryTag";
import { formatCurrency, formatDate, getCategoryMeta } from "@/lib/utils";
import { CATEGORY_META, type ExpenseCategory, type Expense } from "@/types";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { EditExpenseModal } from "@/components/modals/EditExpenseModal";
import { useDebounce } from "@/hooks/useDebounce";

const NOW = new Date();
const FILTER_CATS = [
  { key: "all",           label: "All" },
  { key: "food",          label: "🍽 Food" },
  { key: "transport",     label: "🚗 Transport" },
  { key: "bills",         label: "📋 Bills" },
  { key: "shopping",      label: "🛍 Shopping" },
  { key: "entertainment", label: "🎮 Entertainment" },
  { key: "gym",           label: "💪 Gym" },
  { key: "grocery",       label: "🛒 Grocery" },
  { key: "travel",        label: "✈ Travel" },
  { key: "online",        label: "💻 Online" },
  { key: "income",        label: "💰 Income" },
];

export default function HistoryPage() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [search, setSearch]             = useState("");
  const debouncedSearch                 = useDebounce(search, 300);
  const [sortBy, setSortBy]             = useState<"date" | "amount">("date");
  const [sortOrder, setSortOrder]       = useState<"asc" | "desc">("desc");
  const [editExpense, setEditExpense]   = useState<Expense | null>(null);

  const { data, loading, deleteExpense } = useExpenses({
    startDate: `${NOW.getFullYear() - 1}-01-01`,
    endDate:   format(NOW, "yyyy-MM-dd"),
    pageSize:  200,
  });

  const { exportPDF, loading: exporting } = useExportPDF();

  function handleExport() {
    exportPDF(
      `${NOW.getFullYear()}-${String(NOW.getMonth() + 1).padStart(2, "0")}-01`,
      format(NOW, "yyyy-MM-dd")
    );
  }

  const filtered = useMemo(() => {
    let rows = [...data];
    if (activeFilter !== "all") {
      rows = rows.filter(r =>
        activeFilter === "income" ? r.type === "income" : r.category === activeFilter
      );
    }
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase();
      rows = rows.filter(r =>
        r.description.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q)
      );
    }
    rows.sort((a, b) => {
      if (sortBy === "date") {
        return sortOrder === "desc"
          ? b.date.localeCompare(a.date)
          : a.date.localeCompare(b.date);
      }
      return sortOrder === "desc"
        ? Number(b.amount) - Number(a.amount)
        : Number(a.amount) - Number(b.amount);
    });
    return rows;
  }, [data, activeFilter, debouncedSearch, sortBy, sortOrder]);

  const totalShown = filtered
    .filter(r => r.type === "expense")
    .reduce((s, r) => s + Number(r.amount), 0);

  return (
    <div className="p-6 md:p-8 max-w-[1400px] animate-fade-in">
      <PageHeader
        title="Transaction History"
        subtitle="All your expenses and income in one place"
      >
        <Button
          onClick={handleExport}
          loading={exporting}
          icon={<Download size={14} />}
        >
          Export PDF
        </Button>
      </PageHeader>

      <Card padding="none">
        {/* Filter chips */}
        <div className="px-5 pt-5 pb-3 border-b border-black/[0.05]">
          <div className="flex flex-wrap gap-2 mb-4">
            {FILTER_CATS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setActiveFilter(key)}
                className={cn(
                  "px-3.5 py-1.5 rounded-full border text-[12px] font-medium transition-all",
                  activeFilter === key
                    ? "bg-green-50 border-green-500 text-green-900"
                    : "border-black/[0.09] text-muted-foreground hover:border-black/[0.18] hover:text-foreground"
                )}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Search + sort */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                className="w-full pl-8 pr-4 py-2 border border-black/[0.09] rounded-lg text-[13px] bg-[#F7F6F2] outline-none focus:border-green-500 focus:bg-white transition-all"
                placeholder="Search transactions…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
              <span>Sort:</span>
              <select
                className="border border-black/[0.09] rounded-lg px-2.5 py-1.5 bg-[#F7F6F2] text-[13px] outline-none"
                value={`${sortBy}-${sortOrder}`}
                onChange={e => {
                  const [s, o] = e.target.value.split("-");
                  setSortBy(s as "date" | "amount");
                  setSortOrder(o as "asc" | "desc");
                }}
              >
                <option value="date-desc">Date (newest)</option>
                <option value="date-asc">Date (oldest)</option>
                <option value="amount-desc">Amount (high–low)</option>
                <option value="amount-asc">Amount (low–high)</option>
              </select>
            </div>
            <div className="text-[12px] text-muted-foreground ml-auto">
              {filtered.length} transactions
              {totalShown > 0 && (
                <span className="ml-2 text-red-600 font-medium">
                  · Total: ₹{totalShown.toLocaleString("en-IN")}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-black/[0.05]">
                {["Description", "Category", "Date", "Type", "Amount", ""].map(h => (
                  <th
                    key={h}
                    className="text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3 bg-[#FAFAF8]"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="border-b border-black/[0.04]">
                    {[1,2,3,4,5,6].map(j => (
                      <td key={j} className="px-5 py-3.5">
                        <div className="h-3 bg-gray-100 rounded animate-pulse" style={{ width: `${50 + Math.random()*40}%` }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-muted-foreground text-[13px]">
                    No transactions found
                  </td>
                </tr>
              ) : (
                filtered.map((tx) => {
                  const meta = getCategoryMeta(tx.category as ExpenseCategory);
                  const isIncome = tx.type === "income";
                  return (
                    <tr
                      key={tx.id}
                      className="border-b border-black/[0.04] hover:bg-[#FAFAF8] transition-colors group"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-[15px] flex-shrink-0"
                            style={{ background: meta.bgColor }}
                          >
                            {meta.emoji}
                          </div>
                          <div>
                            <div className="text-[13px] font-medium">{tx.description}</div>
                            {tx.notes && (
                              <div className="text-[11px] text-muted-foreground">{tx.notes}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <CategoryTag category={tx.category as ExpenseCategory} />
                      </td>
                      <td className="px-5 py-3.5 text-[12px] text-muted-foreground whitespace-nowrap">
                        {formatDate(tx.date)}
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className="inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium"
                          style={{
                            background: isIncome ? "#E1F5EE" : "#FAECE7",
                            color:      isIncome ? "#085041" : "#712B13",
                          }}
                        >
                          {isIncome ? "Income" : "Expense"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={cn(
                            "text-[13px] font-semibold",
                            isIncome ? "text-green-900" : "text-red-600"
                          )}
                        >
                          {isIncome ? "+" : "−"}₹{Number(tx.amount).toLocaleString("en-IN")}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => setEditExpense(tx)}
                            className="p-1.5 rounded-md text-muted-foreground hover:text-green-700 hover:bg-green-50 transition-colors"
                          >
                            <Pencil size={13} />
                          </button>
                          <button
                            onClick={() => deleteExpense(tx.id)}
                            className="p-1.5 rounded-md text-muted-foreground hover:text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <EditExpenseModal
        expense={editExpense}
        onClose={() => setEditExpense(null)}
        onSuccess={() => setEditExpense(null)}
      />
    </div>
  );
}
