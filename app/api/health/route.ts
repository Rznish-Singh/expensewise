import { NextResponse } from "next/server";

// GET /api/health — microservice health check endpoint
export async function GET() {
  const checks: Record<string, "ok" | "error"> = {};

  // Database check
  try {
    const { db }     = await import("@/lib/db");
    const { sql }    = await import("drizzle-orm");
    await db.execute(sql`SELECT 1`);
    checks.database  = "ok";
  } catch {
    checks.database  = "error";
  }

  // Clerk check (env vars present)
  checks.auth = process.env.CLERK_SECRET_KEY ? "ok" : "error";

  const allOk  = Object.values(checks).every(v => v === "ok");
  const status = allOk ? 200 : 503;

  return NextResponse.json(
    {
      status:    allOk ? "healthy" : "degraded",
      service:   "ExpenseWise API",
      version:   "1.0.0",
      timestamp: new Date().toISOString(),
      checks,
      uptime:    process.uptime(),
    },
    { status }
  );
}
