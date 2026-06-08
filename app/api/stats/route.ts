import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { expenses, userSettings } from "@/lib/schema";
import { and, eq, gte, lte, sql } from "drizzle-orm";
import { CATEGORY_META } from "@/types";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";

// GET /api/stats?year=2024&month=6
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const now = new Date();
    const year  = parseInt(searchParams.get("year")  ?? String(now.getFullYear()));
    const month = parseInt(searchParams.get("month") ?? String(now.getMonth() + 1));

    const currentStart = format(startOfMonth(new Date(year, month - 1, 1)), "yyyy-MM-dd");
    const currentEnd   = format(endOfMonth(new Date(year, month - 1, 1)), "yyyy-MM-dd");
    const prevDate     = subMonths(new Date(year, month - 1, 1), 1);
    const prevStart    = format(startOfMonth(prevDate), "yyyy-MM-dd");
    const prevEnd      = format(endOfMonth(prevDate), "yyyy-MM-dd");

    // Parallel queries
    const [currentRows, prevRows, settingsRows] = await Promise.all([
      db.select().from(expenses).where(
        and(eq(expenses.userId, userId), gte(expenses.date, currentStart), lte(expenses.date, currentEnd))
      ),
      db.select().from(expenses).where(
        and(eq(expenses.userId, userId), gte(expenses.date, prevStart), lte(expenses.date, prevEnd))
      ),
      db.select().from(userSettings).where(eq(userSettings.userId, userId)),
    ]);

    const settings = settingsRows[0];
    const monthlyBudget = Number(settings?.monthlyBudget ?? 60000);

    // Current month calculations
    const currExpenses = currentRows.filter(r => r.type === "expense").reduce((s, r) => s + Number(r.amount), 0);
    const currIncome   = currentRows.filter(r => r.type === "income").reduce((s, r) => s + Number(r.amount), 0);
    const currSavings  = currIncome - currExpenses;
    const currTxCount  = currentRows.length;

    // Prev month
    const prevExpenses = prevRows.filter(r => r.type === "expense").reduce((s, r) => s + Number(r.amount), 0);
    const prevIncome   = prevRows.filter(r => r.type === "income").reduce((s, r) => s + Number(r.amount), 0);
    const prevSavings  = prevIncome - prevExpenses;
    const prevTxCount  = prevRows.length;

    function pctChange(curr: number, prev: number) {
      if (prev === 0) return curr > 0 ? 100 : 0;
      return Math.round(((curr - prev) / prev) * 1000) / 10;
    }

    // Category breakdown
    const catMap: Record<string, number> = {};
    currentRows.filter(r => r.type === "expense").forEach(r => {
      catMap[r.category] = (catMap[r.category] ?? 0) + Number(r.amount);
    });
    const categories = Object.entries(catMap)
      .map(([cat, amount]) => {
        const meta = CATEGORY_META[cat as keyof typeof CATEGORY_META] ?? CATEGORY_META.other;
        return {
          category: cat,
          label: meta.label,
          emoji: meta.emoji,
          color: meta.color,
          amount,
          percentage: currExpenses > 0 ? Math.round((amount / currExpenses) * 1000) / 10 : 0,
        };
      })
      .sort((a, b) => b.amount - a.amount);

    // Daily trend
    const dailyMap: Record<string, number> = {};
    currentRows.filter(r => r.type === "expense").forEach(r => {
      dailyMap[r.date] = (dailyMap[r.date] ?? 0) + Number(r.amount);
    });
    const daysInMonth = new Date(year, month, 0).getDate();
    const dailyTrend = Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      const date = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      return { date, day, amount: dailyMap[date] ?? 0 };
    });

    // Monthly trend (last 6 months)
    const monthlyTrend = await Promise.all(
      Array.from({ length: 6 }, async (_, i) => {
        const d = subMonths(new Date(year, month - 1, 1), 5 - i);
        const s = format(startOfMonth(d), "yyyy-MM-dd");
        const e = format(endOfMonth(d), "yyyy-MM-dd");
        const rows = await db.select().from(expenses).where(
          and(eq(expenses.userId, userId), gte(expenses.date, s), lte(expenses.date, e))
        );
        return {
          month: format(d, "MMM"),
          expenses: rows.filter(r => r.type === "expense").reduce((s, r) => s + Number(r.amount), 0),
          income:   rows.filter(r => r.type === "income").reduce((s, r) => s + Number(r.amount), 0),
        };
      })
    );

    return NextResponse.json({
      data: {
        stats: {
          totalExpenses:            currExpenses,
          totalIncome:              currIncome,
          totalSavings:             currSavings,
          budgetRemaining:          monthlyBudget - currExpenses,
          transactionCount:         currTxCount,
          monthlyBudget,
          expenseChangePercent:     pctChange(currExpenses, prevExpenses),
          savingsChangePercent:     pctChange(currSavings, prevSavings),
          budgetChangePercent:      pctChange(monthlyBudget - currExpenses, monthlyBudget - prevExpenses),
          transactionChangePercent: pctChange(currTxCount, prevTxCount),
        },
        categories,
        dailyTrend,
        monthlyTrend,
      },
    });
  } catch (err) {
    console.error("[GET /api/stats]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
