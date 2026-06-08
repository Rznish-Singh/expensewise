import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { expenses, userSettings } from "@/lib/schema";
import { and, eq, gte, lte, desc } from "drizzle-orm";
import { CATEGORY_META } from "@/types";
import { format } from "date-fns";

// GET /api/export?startDate=2024-06-01&endDate=2024-06-30&format=json
// Returns structured data; PDF is generated client-side with jsPDF
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get("startDate") ?? format(new Date(), "yyyy-MM-01");
    const endDate   = searchParams.get("endDate")   ?? format(new Date(), "yyyy-MM-dd");

    const [rows, settingsRows] = await Promise.all([
      db
        .select()
        .from(expenses)
        .where(
          and(
            eq(expenses.userId, userId),
            gte(expenses.date, startDate),
            lte(expenses.date, endDate)
          )
        )
        .orderBy(desc(expenses.date)),
      db.select().from(userSettings).where(eq(userSettings.userId, userId)),
    ]);

    const settings = settingsRows[0];
    const symbol   = settings?.currencySymbol ?? "₹";

    const totalExpenses = rows.filter(r => r.type === "expense").reduce((s, r) => s + Number(r.amount), 0);
    const totalIncome   = rows.filter(r => r.type === "income").reduce((s, r) => s + Number(r.amount), 0);
    const totalSavings  = totalIncome - totalExpenses;

    // Category breakdown
    const catMap: Record<string, number> = {};
    rows.filter(r => r.type === "expense").forEach(r => {
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
          percentage: totalExpenses > 0 ? Math.round((amount / totalExpenses) * 1000) / 10 : 0,
        };
      })
      .sort((a, b) => b.amount - a.amount);

    // Daily trend for line chart
    const dailyMap: Record<string, number> = {};
    rows.filter(r => r.type === "expense").forEach(r => {
      dailyMap[r.date] = (dailyMap[r.date] ?? 0) + Number(r.amount);
    });

    return NextResponse.json({
      data: {
        period:    { startDate, endDate },
        summary:   { totalExpenses, totalIncome, totalSavings, transactionCount: rows.length, symbol },
        categories,
        dailyTrend: Object.entries(dailyMap)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([date, amount]) => ({ date, amount })),
        transactions: rows.map(r => ({
          id:          r.id,
          description: r.description,
          amount:      Number(r.amount),
          category:    r.category,
          type:        r.type,
          date:        r.date,
          notes:       r.notes,
        })),
      },
    });
  } catch (err) {
    console.error("[GET /api/export]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
