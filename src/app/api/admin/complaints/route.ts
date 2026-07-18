import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { complaints } from "@/db/schema";
import { ensureSeeded } from "@/lib/seed";

export async function PATCH(request: Request) {
  try {
    await ensureSeeded();
    const body = (await request.json()) as {
      id?: number;
      status?: "open" | "in_review" | "approved" | "rejected" | "resolved";
      adminNotes?: string;
    };

    if (!body.id || !body.status) {
      return NextResponse.json({ error: "id and status required" }, { status: 400 });
    }

    const [updated] = await db
      .update(complaints)
      .set({
        status: body.status,
        adminNotes: body.adminNotes,
        updatedAt: new Date(),
      })
      .where(eq(complaints.id, body.id))
      .returning();

    return NextResponse.json({ complaint: updated });
  } catch {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
