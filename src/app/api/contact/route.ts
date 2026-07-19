import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { contactMessages, leads } from "@/db/schema";
import { ensureSeeded } from "@/lib/seed";

const contactSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Must be a valid 10-digit Indian phone number").optional().or(z.literal("")),
  subject: z.string().min(2, "Subject is required"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export async function POST(request: Request) {
  try {
    await ensureSeeded();
    const rawBody = await request.json();
    const result = contactSchema.safeParse(rawBody);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const { name, email, phone, subject, message } = result.data;

    await db.insert(contactMessages).values({
      name: name.trim(),
      email: email.toLowerCase(),
      phone: phone || null,
      subject: subject.trim(),
      message: message.trim(),
      status: "new",
    });

    await db.insert(leads).values({
      email,
      name,
      source: "inquiry",
      status: "new",
      notes: subject,
    });

    return NextResponse.json({
      message: "Message received. Our team will respond within 24 hours.",
    });
  } catch {
    return NextResponse.json({ error: "Unable to send message" }, { status: 500 });
  }
}
