/**
 * Notification service to simulate sending SMS and Emails for order updates.
 */
export async function sendOrderNotification(
  order: { orderNumber: string; customerEmail: string; customerName: string; phone?: string | null },
  status: string,
) {
  const message = `Hi ${order.customerName}, your Almirah Collective order ${order.orderNumber} is now: ${status.toUpperCase()}.`;

  // Simulate Email
  console.log(`\n[EMAIL SENT] To: ${order.customerEmail}`);
  console.log(`Subject: Order Update - ${order.orderNumber}`);
  console.log(`Body: ${message}`);

  // Simulate SMS
  if (order.phone) {
    console.log(`\n[SMS SENT] To: ${order.phone}`);
    console.log(`Message: ${message}\n`);
  } else {
    console.log(`\n[SMS SKIPPED] No phone number provided for ${order.orderNumber}\n`);
  }
}
