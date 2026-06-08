import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { expenses } from "@/lib/schema";
import { and, eq, gte, lte, desc, like, sql } from "drizzle-orm";
import { z } from "zod";

const insertSchema = z.object({
  description: z.string().min(1).max(200),
  amount: z.number().positive(),
  category: z.string(),
  type: z.enum(["expense", "income"]),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  notes: z.string().optional(),
});

// GET /api/expenses
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const startDate  = searchParams.get("startDate");
    const endDate    = searchParams.get("endDate");
    const category   = searchParams.get("category");
    const type       = searchParams.get("type");
    const search     = searchParams.get("search");
    const page       = parseInt(searchParams.get("page") ?? "1");
    const pageSize   = parseInt(searchParams.get("pageSize") ?? "50");

    const conditions = [eq(expenses.userId, userId)];

    if (startDate) conditions.push(gte(expenses.date, startDate));
    if (endDate)   conditions.push(lte(expenses.date, endDate));
    if (category && category !== "all") conditions.push(eq(expenses.category, category));
    if (type && type !== "all")         conditions.push(eq(expenses.type, type));
    if (search) conditions.push(like(expenses.description, `%${search}%`));

    const offset = (page - 1) * pageSize;

    const [rows, countResult] = await Promise.all([
      db
        .select()
        .from(expenses)
        .where(and(...conditions))
        .orderBy(desc(expenses.date), desc(expenses.createdAt))
        .limit(pageSize)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)` })
        .from(expenses)
        .where(and(...conditions)),
    ]);

    const total = Number(countResult[0]?.count ?? 0);

    return NextResponse.json({
      data: rows,
      total,
      page,
      pageSize,
      hasMore: offset + pageSize < total,
    });
  } catch (err) {
    console.error("[GET /api/expenses]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/expenses
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const parsed = insertSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid data", details: parsed.error.flatten() },
        { status: 422 }
      );
    }

    const { description, amount, category, type, date, notes } = parsed.data;

    const [row] = await db
      .insert(expenses)
      .values({
        userId,
        description,
        amount: amount.toString(),
        category,
        type,
        date,
        notes,
      })
      .returning();

    return NextResponse.json({ data: row }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/expenses]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
