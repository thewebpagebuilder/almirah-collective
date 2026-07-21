"use server";

import { db } from "@/db";
import { reviews } from "@/db/schema";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";

export async function submitReviewAction(formData: FormData) {
  const customerName = formData.get("customerName") as string;
  const rating = Number(formData.get("rating"));
  const title = formData.get("title") as string;
  const body = formData.get("body") as string;
  
  if (!customerName || !rating || !body) {
    return { success: false, error: "Missing required fields" };
  }
  
  try {
    await db.insert(reviews).values({
      productId: 1, // Store level review, default to 1 or remove relation if not needed. But productId is required in schema, so we assign a dummy product id 1 for store reviews.
      customerName,
      rating,
      title,
      body,
      isVerified: false,
      isApproved: false,
    });
    
    revalidatePath("/");
    revalidatePath("/admin");
    
    return { success: true };
  } catch (error) {
    console.error("Error submitting review:", error);
    return { success: false, error: "Failed to submit review" };
  }
}

export async function toggleReviewApprovalAction(reviewId: number, isApproved: boolean) {
  try {
    await db.update(reviews).set({ isApproved }).where(eq(reviews.id, reviewId));
    revalidatePath("/");
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Error toggling review approval:", error);
    return { success: false, error: "Failed to update review" };
  }
}

export async function deleteReviewAction(reviewId: number) {
  try {
    await db.delete(reviews).where(eq(reviews.id, reviewId));
    revalidatePath("/");
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Error deleting review:", error);
    return { success: false, error: "Failed to delete review" };
  }
}
