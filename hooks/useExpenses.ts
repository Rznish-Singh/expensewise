"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "react-hot-toast";
import type { Expense, ExpenseFilters, ExpenseInsert, UserSettings } from "@/types";

// ── Generic fetcher ────────────────────────────────────────────────────────────
async function fetcher<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Network error" }));
    throw new Error(err.error ?? "Request failed");
  }
  return res.json();
}

// ── useExpenses ────────────────────────────────────────────────────────────────
export function useExpenses(filters: ExpenseFilters = {}) {
  const [data, setData] = useState<Expense[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filters.startDate)  params.set("startDate",  filters.startDate);
      if (filters.endDate)    params.set("endDate",    filters.endDate);
      if (filters.category && filters.category !== "all") params.set("category", filters.category);
      if (filters.type && filters.type !== "all")         params.set("type",     filters.type);
      if (filters.search)     params.set("search",     filters.search);
      if (filters.page)       params.set("page",       String(filters.page));
      if (filters.pageSize)   params.set("pageSize",   String(filters.pageSize));

      const res = await fetcher<{ data: Expense[]; total: number }>(
        `/api/expenses?${params.toString()}`
      );
      setData(res.data);
      setTotal(res.total);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load expenses");
    } finally {
      setLoading(false);
    }
  }, [
    filters.startDate, filters.endDate, filters.category,
    filters.type, filters.search, filters.page, filters.pageSize,
  ]);

  useEffect(() => { fetchExpenses(); }, [fetchExpenses]);

  const addExpense = useCallback(async (expense: ExpenseInsert) => {
    const toastId = toast.loading("Adding expense…");
    try {
      const res = await fetcher<{ data: Expense }>("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(expense),
      });
      setData(prev => [res.data, ...prev]);
      setTotal(prev => prev + 1);
      toast.success("Expense added!", { id: toastId });
      return res.data;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to add expense", { id: toastId });
      throw e;
    }
  }, []);

  const updateExpense = useCallback(async (id: string, updates: Partial<ExpenseInsert>) => {
    const toastId = toast.loading("Updating…");
    try {
      const res = await fetcher<{ data: Expense }>(`/api/expenses/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      setData(prev => prev.map(e => e.id === id ? res.data : e));
      toast.success("Updated!", { id: toastId });
      return res.data;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update", { id: toastId });
      throw e;
    }
  }, []);

  const deleteExpense = useCallback(async (id: string) => {
    const toastId = toast.loading("Deleting…");
    try {
      await fetcher(`/api/expenses/${id}`, { method: "DELETE" });
      setData(prev => prev.filter(e => e.id !== id));
      setTotal(prev => prev - 1);
      toast.success("Deleted!", { id: toastId });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete", { id: toastId });
      throw e;
    }
  }, []);

  return { data, total, loading, error, refetch: fetchExpenses, addExpense, updateExpense, deleteExpense };
}

// ── useStats ──────────────────────────────────────────────────────────────────
export function useStats(year: number, month: number) {
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetcher<{ data: Record<string, unknown> }>(
        `/api/stats?year=${year}&month=${month}`
      );
      setData(res.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load stats");
    } finally {
      setLoading(false);
    }
  }, [year, month]);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  return { data, loading, error, refetch: fetchStats };
}

// ── useSettings ───────────────────────────────────────────────────────────────
export function useSettings() {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetcher<{ data: UserSettings }>("/api/settings")
      .then(res => setSettings(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const updateSettings = useCallback(async (updates: Partial<UserSettings>) => {
    const toastId = toast.loading("Saving…");
    try {
      const res = await fetcher<{ data: UserSettings }>("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      setSettings(res.data);
      toast.success("Settings saved!", { id: toastId });
    } catch (e) {
      toast.error("Failed to save settings", { id: toastId });
      throw e;
    }
  }, []);

  return { settings, loading, updateSettings };
}

// ── useExportPDF ──────────────────────────────────────────────────────────────
export function useExportPDF() {
  const [loading, setLoading] = useState(false);

  const exportPDF = useCallback(async (startDate: string, endDate: string) => {
    setLoading(true);
    const toastId = toast.loading("Generating PDF…");
    try {
      const res = await fetcher<{ data: Record<string, unknown> }>(
        `/api/export?startDate=${startDate}&endDate=${endDate}`
      );
      // Dynamically import jsPDF (client-side only)
      const { default: jsPDF } = await import("jspdf");
      const autoTable = (await import("jspdf-autotable")).default;

      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const exportData = res.data as {
        period: { startDate: string; endDate: string };
        summary: { totalExpenses: number; totalIncome: number; totalSavings: number; transactionCount: number; symbol: string };
        categories: Array<{ label: string; emoji: string; amount: number; percentage: number }>;
        transactions: Array<{ description: string; category: string; type: string; date: string; amount: number }>;
      };
      const { period, summary, categories, transactions } = exportData;

      // Header
      doc.setFillColor(29, 158, 117);
      doc.rect(0, 0, 210, 36, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.setFont("helvetica", "bold");
      doc.text("ExpenseWise", 15, 16);
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.text("Expense Report", 15, 24);
      doc.setFontSize(9);
      doc.text(`${period.startDate} – ${period.endDate}`, 15, 31);

      // Summary boxes
      doc.setTextColor(30, 30, 25);
      const sym = summary.symbol ?? "₹";
      const boxes = [
        { label: "Total Expenses", value: `${sym}${summary.totalExpenses.toLocaleString("en-IN")}`, color: [212, 90, 48] },
        { label: "Total Income",   value: `${sym}${summary.totalIncome.toLocaleString("en-IN")}`,   color: [29, 158, 117] },
        { label: "Net Savings",    value: `${sym}${summary.totalSavings.toLocaleString("en-IN")}`,  color: [83, 74, 183] },
        { label: "Transactions",   value: String(summary.transactionCount),                          color: [55, 138, 221] },
      ];
      boxes.forEach((b, i) => {
        const x = 12 + i * 47;
        doc.setFillColor(247, 246, 242);
        doc.roundedRect(x, 42, 43, 22, 3, 3, "F");
        doc.setFontSize(8);
        doc.setTextColor(130, 128, 120);
        doc.text(b.label, x + 4, 50);
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(b.color[0], b.color[1], b.color[2]);
        doc.text(b.value, x + 4, 59);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(30, 30, 25);
      });

      // Category table
      doc.setFontSize(12);
      doc.setTextColor(30, 30, 25);
      doc.text("Category Breakdown", 15, 76);
      autoTable(doc, {
        startY: 80,
        head: [["Category", "Amount", "% of Total"]],
        body: categories.map(c => [
          `${c.emoji} ${c.label}`,
          `${sym}${c.amount.toLocaleString("en-IN")}`,
          `${c.percentage}%`,
        ]),
        headStyles: { fillColor: [29, 158, 117], fontSize: 9, fontStyle: "bold" },
        bodyStyles: { fontSize: 9 },
        alternateRowStyles: { fillColor: [247, 246, 242] },
        margin: { left: 15, right: 15 },
      });

      // Transactions table
      const afterCat = (doc as jsPDF & { lastAutoTable?: { finalY?: number } }).lastAutoTable?.finalY ?? 140;
      doc.setFontSize(12);
      doc.text("All Transactions", 15, afterCat + 10);
      autoTable(doc, {
        startY: afterCat + 14,
        head: [["Description", "Category", "Date", "Type", "Amount"]],
        body: transactions.map(t => [
          t.description,
          t.category,
          t.date,
          t.type,
          (t.type === "income" ? "+" : "-") + sym + Number(t.amount).toLocaleString("en-IN"),
        ]),
        headStyles: { fillColor: [29, 158, 117], fontSize: 8, fontStyle: "bold" },
        bodyStyles: { fontSize: 8 },
        alternateRowStyles: { fillColor: [247, 246, 242] },
        margin: { left: 15, right: 15 },
        didParseCell: (data) => {
          if (data.section === "body" && data.column.index === 4) {
            const val = String(data.cell.raw);
            if (val.startsWith("+")) data.cell.styles.textColor = [8, 80, 65];
            else data.cell.styles.textColor = [212, 90, 48];
          }
        },
      });

      // Footer
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(160, 158, 150);
        doc.text(
          `Generated by ExpenseWise  •  Page ${i} of ${pageCount}`,
          105, 290, { align: "center" }
        );
      }

      doc.save(`ExpenseWise_Report_${period.startDate}_${period.endDate}.pdf`);
      toast.success("PDF downloaded!", { id: toastId });
    } catch (e) {
      console.error(e);
      toast.error("Failed to generate PDF", { id: toastId });
    } finally {
      setLoading(false);
    }
  }, []);

  return { exportPDF, loading };
}
