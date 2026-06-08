import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { userSettings } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const updateSchema = z.object({
  monthlyBudget:         z.number().positive().optional(),
  currency:              z.string().max(5).optional(),
  currencySymbol:        z.string().max(5).optional(),
  notifyBudgetAlert:     z.boolean().optional(),
  notifyWeeklySummary:   z.boolean().optional(),
  notifyNewTransaction:  z.boolean().optional(),
  notifyMonthlyReport:   z.boolean().optional(),
  darkMode:              z.boolean().optional(),
  compactView:           z.boolean().optional(),
});

// GET /api/settings
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    let [row] = await db.select().from(userSettings).where(eq(userSettings.userId, userId));

    // Auto-create default settings on first access
    if (!row) {
      [row] = await db.insert(userSettings).values({ userId }).returning();
    }

    return NextResponse.json({ data: row });
  } catch (err) {
    console.error("[GET /api/settings]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH /api/settings
export async function PATCH(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid data" }, { status: 422 });
    }

    const updates: Record<string, unknown> = { ...parsed.data, updatedAt: new Date() };
    if (parsed.data.monthlyBudget !== undefined) {
      updates.monthlyBudget = parsed.data.monthlyBudget.toString();
    }

    // Upsert
    const existing = await db.select({ id: userSettings.id }).from(userSettings).where(eq(userSettings.userId, userId));

    let row;
    if (existing.length === 0) {
      [row] = await db.insert(userSettings).values({ userId, ...updates }).returning();
    } else {
      [row] = await db.update(userSettings).set(updates).where(eq(userSettings.userId, userId)).returning();
    }

    return NextResponse.json({ data: row });
  } catch (err) {
    console.error("[PATCH /api/settings]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
