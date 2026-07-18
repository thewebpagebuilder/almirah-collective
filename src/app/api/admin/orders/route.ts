import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { ensureSeeded } from "@/lib/seed";
import { sendOrderNotification } from "@/lib/notifications";

export async function PATCH(request: Request) {
  try {
    await ensureSeeded();
    const body = (await request.json()) as {
      id?: number;
      status?: "placed" | "confirming" | "packed" | "dispatched" | "on_the_way" | "delivered" | "cancelled" | "returned";
      trackingNumber?: string;
      courier?: string;
    };

    if (!body.id || !body.status) {
      return NextResponse.json({ error: "id and status required" }, { status: 400 });
    }

    const [updated] = await db
      .update(orders)
      .set({
        status: body.status,
        trackingNumber: body.trackingNumber,
        courier: body.courier,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, body.id))
      .returning();

    if (updated) {
      await sendOrderNotification(
        {
          orderNumber: updated.orderNumber,
          customerEmail: updated.customerEmail,
          customerName: updated.customerName,
          // DB currently doesn't store phone directly on orders for this demo,
          // but in a real app we'd fetch it here.
          phone: null,
        },
        body.status
      );
    }

    return NextResponse.json({ order: updated });
  } catch {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
