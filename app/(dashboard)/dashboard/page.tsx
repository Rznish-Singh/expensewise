"use client";

import { useState } from "react";
import { Download, Calendar } from "lucide-react";
import { useStats } from "@/hooks/useExpenses";
import { useExportPDF } from "@/hooks/useExpenses";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { Card, CardHeader, CardActionButton } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { LineChart } from "@/components/charts/LineChart";
import { DonutChart } from "@/components/charts/DonutChart";
import { BarChart } from "@/components/charts/BarChart";
import { AddExpenseModal } from "@/components/modals/AddExpenseModal";
import { BudgetProgressBar } from "@/components/ui/BudgetProgressBar";
import { AlertBanner } from "@/components/ui/AlertBanner";
import { formatCurrency, formatDate, getCategoryMeta } from "@/lib/utils";
import { useExpenses } from "@/hooks/useExpenses";
import { CategoryTag } from "@/components/ui/CategoryTag";
import type { CategoryStat, DailyTrend, MonthlyTrend, Expense, ExpenseCategory } from "@/types";
import { format } from "date-fns";

const NOW = new Date();
const YEAR  = NOW.getFullYear();
const MONTH = NOW.getMonth() + 1;

export default function DashboardPage() {
  const { data: statsData, loading } = useStats(YEAR, MONTH);
  const { data: recentTx, loading: txLoading } = useExpenses({
    startDate: `${YEAR}-${String(MONTH).padStart(2, "0")}-01`,
    endDate:   format(new Date(YEAR, MONTH, 0), "yyyy-MM-dd"),
    pageSize:  6,
  });

  const { exportPDF, loading: exporting } = useExportPDF();
  const [addOpen, setAddOpen] = useState(false);

  const stats       = (statsData as Record<string, unknown> | null)?.stats as Record<string, number> | undefined;
  const categories  = ((statsData as Record<string, unknown> | null)?.categories as CategoryStat[]) ?? [];
  const dailyTrend  = ((statsData as Record<string, unknown> | null)?.dailyTrend as DailyTrend[]) ?? [];
  const monthlyTrend = ((statsData as Record<string, unknown> | null)?.monthlyTrend as MonthlyTrend[]) ?? [];
  const topCat      = categories[0];

  const SYM = "₹";
  const monthLabel = format(new Date(YEAR, MONTH - 1, 1), "MMMM yyyy");

  function handleExport() {
    const start = `${YEAR}-${String(MONTH).padStart(2, "0")}-01`;
    const end   = format(new Date(YEAR, MONTH, 0), "yyyy-MM-dd");
    exportPDF(start, end);
  }

  return (
    <div className="p-6 md:p-8 max-w-[1400px] animate-fade-in">
      <PageHeader
        title="Expense Analytics"
        subtitle="Track, analyze and optimize your spending"
      >
        <div className="flex items-center gap-2 bg-white border border-black/[0.07] rounded-lg px-3.5 py-2 text-[13px] text-muted-foreground">
          <Calendar size={14} />
          {monthLabel}
        </div>
        <Button
          onClick={handleExport}
          loading={exporting}
          icon={<Download size={14} />}
        >
          Export PDF
        </Button>
      </PageHeader>

      {/* ALERT BANNER */}
      <AlertBanner />

      {/* STAT CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Total Expenses"
          value={stats ? formatCurrency(stats.totalExpenses, SYM) : "—"}
          change={stats?.expenseChangePercent ?? 0}
          meta="vs last month"
          loading={loading}
          sparklineKey="expenses"
        />
        <StatCard
          label="Total Savings"
          value={stats ? formatCurrency(stats.totalSavings, SYM) : "—"}
          change={stats?.savingsChangePercent ?? 0}
          meta="vs last month"
          loading={loading}
          sparklineKey="savings"
        />
        <StatCard
          label="Budget Remaining"
          value={stats ? formatCurrency(stats.budgetRemaining, SYM) : "—"}
          change={stats?.budgetChangePercent ?? 0}
          meta={`of ${SYM}${(stats?.monthlyBudget ?? 60000).toLocaleString("en-IN")} budget`}
          loading={loading}
          sparklineKey="budget"
        />
        <StatCard
          label="Transactions"
          value={stats ? String(stats.transactionCount) : "—"}
          change={stats?.transactionChangePercent ?? 0}
          meta="vs last month"
          loading={loading}
          sparklineKey="count"
        />
      </div>

      {/* BUDGET PROGRESS */}
      {!loading && stats && (
        <div className="mb-6">
          <BudgetProgressBar
            totalExpenses={stats.totalExpenses}
            monthlyBudget={stats.monthlyBudget}
            symbol={SYM}
          />
        </div>
      )}

      {/* CHART ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-6">
        {/* Trend Line Chart */}
        <Card className="lg:col-span-3">
          <CardHeader
            title="Expenses Trend"
            action={<CardActionButton>Daily ▾</CardActionButton>}
          />
          {loading ? (
            <div className="h-[200px] bg-gray-50 rounded-lg animate-pulse" />
          ) : (
            <LineChart data={dailyTrend} symbol={SYM} height={200} />
          )}
        </Card>

        {/* Donut Pie Chart */}
        <Card className="lg:col-span-2">
          <CardHeader
            title="Expenses by Category"
            action={<CardActionButton>This Month ▾</CardActionButton>}
          />
          {loading || !categories.length ? (
            <div className="h-[160px] bg-gray-50 rounded-lg animate-pulse" />
          ) : (
            <>
              <DonutChart
                data={categories}
                symbol={SYM}
                totalLabel="Total"
                totalValue={stats ? formatCurrency(stats.totalExpenses, SYM) : ""}
                height={160}
              />
              <div className="mt-4 space-y-2.5">
                {categories.slice(0, 5).map((c) => (
                  <div key={c.category} className="flex items-center justify-between text-[12px]">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
                        style={{ background: c.color }}
                      />
                      <span className="text-foreground">{c.label}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-muted-foreground">{c.percentage}%</span>
                      <span className="font-medium">{formatCurrency(c.amount, SYM)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </Card>
      </div>

      {/* MONTHLY BAR + RECENT TRANSACTIONS + TOP CATEGORY */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-6">
        {/* Monthly trend bar */}
        <Card className="lg:col-span-2">
          <CardHeader title="Monthly Overview" />
          {loading ? (
            <div className="h-[200px] bg-gray-50 rounded-lg animate-pulse" />
          ) : (
            <BarChart data={monthlyTrend} symbol={SYM} height={200} />
          )}
        </Card>

        {/* Recent Transactions */}
        <Card className="lg:col-span-2">
          <CardHeader
            title="Recent Transactions"
            action={
              <a href="/history" className="text-[12px] text-green-700 hover:underline">
                View All
              </a>
            }
          />
          {txLoading ? (
            <div className="space-y-3">
              {[1,2,3,4].map(i => (
                <div key={i} className="flex gap-3 animate-pulse">
                  <div className="w-9 h-9 rounded-lg bg-gray-100 flex-shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 bg-gray-100 rounded w-3/4" />
                    <div className="h-2.5 bg-gray-100 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="divide-y divide-black/[0.05]">
              {recentTx.filter(t => t.type === "expense").slice(0, 5).map((tx) => {
                const meta = getCategoryMeta(tx.category as ExpenseCategory);
                return (
                  <div key={tx.id} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center text-base flex-shrink-0"
                      style={{ background: meta.bgColor }}
                    >
                      {meta.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-medium truncate">{tx.description}</div>
                      <div className="text-[11px] text-muted-foreground">{meta.label}</div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-[11px] text-muted-foreground">{formatDate(tx.date)}</div>
                      <div className="text-[13px] font-semibold text-red-600">
                        −{formatCurrency(Number(tx.amount), SYM)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Top Category */}
        <Card className="lg:col-span-1 flex flex-col">
          <CardHeader
            title="Top Category"
            action={<CardActionButton>Month ▾</CardActionButton>}
          />
          {loading || !topCat ? (
            <div className="flex-1 space-y-3 animate-pulse">
              <div className="w-12 h-12 rounded-xl bg-gray-100" />
              <div className="h-4 bg-gray-100 rounded w-20" />
              <div className="h-7 bg-gray-100 rounded w-28" />
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                style={{ background: topCat.color + "20" }}
              >
                {topCat.emoji}
              </div>
              <div className="text-[18px] font-serif font-light">{topCat.label}</div>
              <div className="text-[26px] font-serif font-light">
                {formatCurrency(topCat.amount, SYM)}
              </div>
              <div className="text-[12px] text-muted-foreground">
                {topCat.percentage}% of total expenses
              </div>
              <a
                href="/history"
                className="mt-auto text-[12px] text-green-700 border border-black/[0.07] rounded-lg py-2 text-center hover:bg-green-50 transition-colors"
              >
                View Details ›
              </a>
            </div>
          )}
        </Card>
      </div>

      <AddExpenseModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSuccess={() => {}}
      />
    </div>
  );
}
