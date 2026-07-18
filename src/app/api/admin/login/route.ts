import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    const adminEmails = (process.env.ADMIN_EMAILS || "")
      .split(",")
      .map((e) => e.trim().toLowerCase());
      
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmails.includes(email.toLowerCase()) || password !== adminPassword) {
      return NextResponse.json({ error: "Invalid admin credentials" }, { status: 401 });
    }

    // Set an HTTP-only secure cookie
    const cookieStore = await cookies();
    cookieStore.set("admin_token", "authorized", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 });
  }
}
