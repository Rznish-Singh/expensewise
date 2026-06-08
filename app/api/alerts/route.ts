import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { expenses, userSettings } from "@/lib/schema";
import { and, eq, gte, lte } from "drizzle-orm";
import { format, startOfMonth, endOfMonth } from "date-fns";

// GET /api/alerts — checks budget thresholds and returns alert state
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const now   = new Date();
    const start = format(startOfMonth(now), "yyyy-MM-dd");
    const end   = format(endOfMonth(now),   "yyyy-MM-dd");

    const [rows, settingsRows] = await Promise.all([
      db.select().from(expenses).where(
        and(eq(expenses.userId, userId), gte(expenses.date, start), lte(expenses.date, end))
      ),
      db.select().from(userSettings).where(eq(userSettings.userId, userId)),
    ]);

    const settings      = settingsRows[0];
    const monthlyBudget = Number(settings?.monthlyBudget ?? 60000);
    const totalSpent    = rows
      .filter(r => r.type === "expense")
      .reduce((s, r) => s + Number(r.amount), 0);

    const pct         = monthlyBudget > 0 ? (totalSpent / monthlyBudget) * 100 : 0;
    const isOverBudget = totalSpent > monthlyBudget;
    const alerts: Array<{ type: string; level: "info" | "warning" | "danger"; message: string }> = [];

    if (isOverBudget) {
      alerts.push({
        type:    "over_budget",
        level:   "danger",
        message: `You've exceeded your monthly budget by ₹${(totalSpent - monthlyBudget).toLocaleString("en-IN")}.`,
      });
    } else if (pct >= 90) {
      alerts.push({
        type:    "near_budget",
        level:   "danger",
        message: `You've used ${Math.round(pct)}% of your monthly budget. Only ₹${(monthlyBudget - totalSpent).toLocaleString("en-IN")} left.`,
      });
    } else if (pct >= 70) {
      alerts.push({
        type:    "approaching_budget",
        level:   "warning",
        message: `You've used ${Math.round(pct)}% of your monthly budget.`,
      });
    }

    // Check for unusually high single-day spend
    const dailyMap: Record<string, number> = {};
    rows.filter(r => r.type === "expense").forEach(r => {
      dailyMap[r.date] = (dailyMap[r.date] ?? 0) + Number(r.amount);
    });
    const avgDaily = totalSpent / now.getDate();
    const todayStr = format(now, "yyyy-MM-dd");
    const todaySpend = dailyMap[todayStr] ?? 0;
    if (todaySpend > avgDaily * 2.5 && todaySpend > 500) {
      alerts.push({
        type:    "high_daily_spend",
        level:   "warning",
        message: `Today's spending (₹${todaySpend.toLocaleString("en-IN")}) is unusually high compared to your daily average.`,
      });
    }

    return NextResponse.json({
      data: {
        totalSpent,
        monthlyBudget,
        percentage:  Math.round(pct * 10) / 10,
        isOverBudget,
        alerts,
        notifyEnabled: settings?.notifyBudgetAlert ?? true,
      },
    });
  } catch (err) {
    console.error("[GET /api/alerts]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
