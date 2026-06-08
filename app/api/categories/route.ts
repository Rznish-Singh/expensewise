import { NextResponse } from "next/server";
import { CATEGORY_META } from "@/types";

// GET /api/categories — returns all category metadata
export async function GET() {
  const categories = Object.entries(CATEGORY_META).map(([key, meta]) => ({
    key,
    label:     meta.label,
    emoji:     meta.emoji,
    color:     meta.color,
    bgColor:   meta.bgColor,
    textColor: meta.textColor,
  }));

  return NextResponse.json({ data: categories });
}
