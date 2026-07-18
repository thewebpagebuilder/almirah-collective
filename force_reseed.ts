import { ensureSeeded } from "./src/lib/seed";
import { db } from "./src/db";
import { products, categories, customers, addresses, orderItems, orders, reviews, complaints, leads, newsletterSubscribers, pressMentions } from "./src/db/schema";

async function main() {
    console.log("Wiping catalog...");
    await db.delete(orderItems);
    await db.delete(orders);
    await db.delete(reviews);
    await db.delete(complaints);
    await db.delete(leads);
    await db.delete(newsletterSubscribers);
    await db.delete(pressMentions);
    await db.delete(addresses);
    await db.delete(customers);
    await db.delete(products);
    await db.delete(categories);
    
    console.log("Database wiped. Triggering re-seed...");
    await ensureSeeded();
    console.log("Database seeded successfully.");
    process.exit(0);
}
main();
