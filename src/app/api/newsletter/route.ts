import { NextResponse } from "next/server";
import { db } from "@/db";
import { newsletterSubscribers } from "@/db/schema";
import { ensureSeeded } from "@/lib/seed";

export async function POST(request: Request) {
  try {
    await ensureSeeded();
    const body = (await request.json()) as { email?: string };
    const email = body.email?.trim().toLowerCase();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Valid email required" }, { status: 400 });
    }

    await db
      .insert(newsletterSubscribers)
      .values({ email, source: "website" })
      .onConflictDoNothing();

    return NextResponse.json({
      message: "You're on the list. Welcome to the inner circle.",
    });
  } catch {
    return NextResponse.json({ error: "Unable to subscribe right now" }, { status: 500 });
  }
}
