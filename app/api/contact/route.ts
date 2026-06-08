import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const contactSchema = z.object({
  name:    z.string().min(1).max(100),
  email:   z.string().email(),
  subject: z.string().min(1).max(200),
  message: z.string().min(10).max(2000),
});

// POST /api/contact
export async function POST(req: NextRequest) {
  try {
    const body   = await req.json();
    const parsed = contactSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid data", details: parsed.error.flatten() },
        { status: 422 }
      );
    }

    const { name, email, subject, message } = parsed.data;

    // ─── In production, integrate your email provider here ────────────────────
    // Example with Resend:
    //
    // import { Resend } from "resend";
    // const resend = new Resend(process.env.RESEND_API_KEY);
    // await resend.emails.send({
    //   from:    "ExpenseWise <no-reply@yourdomain.com>",
    //   to:      [process.env.SUPPORT_EMAIL!],
    //   subject: `[ExpenseWise Contact] ${subject}`,
    //   text:    `From: ${name} <${email}>\n\n${message}`,
    // });
    //
    // Example with Nodemailer / SMTP:
    //
    // import nodemailer from "nodemailer";
    // const transporter = nodemailer.createTransport({ ... });
    // await transporter.sendMail({ from: email, to: "support@...", subject, text: message });
    // ──────────────────────────────────────────────────────────────────────────

    // Log for now (replace with real email send above)
    console.log("[Contact Form Submission]", { name, email, subject, message });

    return NextResponse.json(
      { message: "Message received! We'll get back to you within 24 hours." },
      { status: 200 }
    );
  } catch (err) {
    console.error("[POST /api/contact]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// GET /api/contact — health check for the microservice
export async function GET() {
  return NextResponse.json({
    service:   "ExpenseWise Contact API",
    status:    "healthy",
    version:   "1.0.0",
    timestamp: new Date().toISOString(),
  });
}
