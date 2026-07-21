import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  categories,
  products,
  customers,
  addresses,
  orders,
  orderItems,
  reviews,
  pressMentions,
  leads,
  complaints,
  newsletterSubscribers,
} from "@/db/schema";
import { CATEGORIES, PRODUCTS, PRESS } from "@/lib/catalog";

let seeded = false;
let reseeding = false;

async function tableHasRows() {
  const existing = await db.select({ id: products.id }).from(products).limit(1);
  return existing.length > 0;
}

async function productCount() {
  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(products);
  return Number(row?.count ?? 0);
}

async function wipeCatalog() {
  // Order matters for FKs
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
}

export async function ensureSeeded() {
  if (seeded || reseeding) return;

  const count = await productCount();
  // Re-seed when empty or when old demo catalog (< 40 products) is present
  if (count > 0 && count >= 40) {
    seeded = true;
    return;
  }

  reseeding = true;
  try {
    if (await tableHasRows()) {
      await wipeCatalog();
    }

    await db.insert(categories).values(
      CATEGORIES.map((c, i) => ({
        slug: c.slug,
        name: c.name,
        description: c.description,
        imageUrl: c.image,
        sortOrder: i,
      })),
    );

    await db.insert(products).values(
      PRODUCTS.map((p) => ({
        slug: p.slug,
        name: p.name,
        description: p.description,
        shortDescription: p.shortDescription,
        categorySlug: p.categorySlug,
        price: String(p.price),
        compareAtPrice: p.compareAtPrice ? String(p.compareAtPrice) : null,
        material: p.material,
        careInstructions: p.careInstructions,
        images: p.images,
        colors: p.colors,
        sizes: p.sizes,
        tags: p.tags,
        stock: p.stock,
        isFeatured: p.isFeatured,
        isTrending: p.isTrending,
        rating: String(p.rating),
        reviewCount: p.reviewCount,
      })),
    );

    await db.insert(pressMentions).values(
      PRESS.map((p, i) => ({
        outlet: p.outlet,
        quote: p.quote,
        sortOrder: i,
      })),
    );

    const [customer] = await db
      .insert(customers)
      .values({
        email: "ameena@almirahcollective.com",
        passwordHash: "demo-hash",
        firstName: "Ameena",
        lastName: "S",
        phone: "+91 89713 27304",
        loyaltyPoints: 1280,
        isVip: true,
        newsletter: true,
      })
      .returning();

    await db.insert(addresses).values({
      customerId: customer.id,
      label: "Home",
      line1: "Bengaluru Studio",
      line2: "Personal packing desk",
      city: "Bengaluru",
      state: "Karnataka",
      postalCode: "560001",
      country: "India",
      isDefault: true,
    });

    const allProducts = await db.select().from(products);
    const pick = (...slugs: string[]) =>
      slugs
        .map((s) => allProducts.find((p) => p.slug === s))
        .filter(Boolean) as typeof allProducts;

    const featuredPicks = pick(
      "coral-floral-satin-shirt-dress",
      "rust-orange-embroidered-cotton-kurta-set",
      "plum-minimal-co-ord-set",
      "puma-75-years-sport-racerback-crop-top-hot-pink",
      "dkny-colourblock-logo-t-shirt",
      "w-ice-blue-embroidered-anarkali-festive-wear",
    );

    const orderLines = featuredPicks.slice(0, 2);
    if (orderLines.length >= 1) {
      const subtotal = orderLines.reduce((s, p) => s + Number(p.price), 0);
      const [order1] = await db
        .insert(orders)
        .values({
          orderNumber: "ALM-DEMO-1001",
          customerId: customer.id,
          customerEmail: customer.email,
          customerName: `${customer.firstName} ${customer.lastName}`,
          status: "shipped",
          subtotal: String(subtotal),
          shipping: "0",
          tax: "0",
          total: String(subtotal),
          shippingAddress: {
            line1: "Bengaluru Studio",
            city: "Bengaluru",
            state: "Karnataka",
            postalCode: "560001",
            country: "India",
          },
          trackingNumber: "BLUEDART778812",
          courier: "BlueDart",
        })
        .returning();

      await db.insert(orderItems).values(
        orderLines.map((p) => ({
          orderId: order1.id,
          productId: p.id,
          productName: p.name,
          productImage: p.images[0],
          size: p.sizes[0] ?? "M",
          color: p.colors[0]?.name ?? "Signature",
          quantity: 1,
          unitPrice: p.price,
          lineTotal: p.price,
        })),
      );

      if (featuredPicks[2]) {
        const p = featuredPicks[2];
        const [order2] = await db
          .insert(orders)
          .values({
            orderNumber: "ALM-DEMO-1002",
            customerId: customer.id,
            customerEmail: customer.email,
            customerName: `${customer.firstName} ${customer.lastName}`,
            status: "processed",
            subtotal: p.price,
            shipping: "0",
            tax: "0",
            total: p.price,
            shippingAddress: {
              line1: "Bengaluru Studio",
              city: "Bengaluru",
              state: "Karnataka",
              postalCode: "560001",
              country: "India",
            },
            courier: "Delhivery",
          })
          .returning();

        await db.insert(orderItems).values({
          orderId: order2.id,
          productId: p.id,
          productName: p.name,
          productImage: p.images[0],
          size: p.sizes[0] ?? "M",
          color: p.colors[0]?.name ?? "Signature",
          quantity: 1,
          unitPrice: p.price,
          lineTotal: p.price,
        });
      }

      // Reviews on a few products
      const reviewTargets = featuredPicks.slice(0, 4);
      for (const p of reviewTargets) {
        await db.insert(reviews).values([
          {
            productId: p.id,
            customerName: "Riya K.",
            rating: 5,
            title: "Exactly as curated",
            body: "Beautiful piece, true to photos, and packed so thoughtfully from Bengaluru.",
            isVerified: true,
          },
          {
            productId: p.id,
            customerName: "Neha S.",
            rating: 5,
            title: "Worth the find",
            body: "Love that Almirah handpicks brands — quality feels genuine and styling is easy.",
            photoUrl: p.images[1] ?? p.images[0],
            isVerified: true,
          },
        ]);
      }

      await db.insert(complaints).values({
        ticketNumber: "RMA-ALM-01",
        orderId: order1.id,
        customerEmail: customer.email,
        customerName: `${customer.firstName} ${customer.lastName}`,
        type: "exchange",
        reason: "Requested alternate size on cotton suit set.",
        status: "in_review",
      });
    }

    await db.insert(leads).values([
      {
        email: "guest@studio.com",
        name: "Weekend Browser",
        source: "abandoned_cart",
        status: "new",
        cartValue: "1699",
        notes: "Left embroidered kurta set in cart",
      },
      {
        email: "stylist@inquiry.com",
        name: "Priya Nair",
        source: "inquiry",
        status: "contacted",
        cartValue: "4200",
        notes: "Festive wardrobe edit for wedding week",
      },
    ]);

    await db.insert(newsletterSubscribers).values([
      { email: "ameena@almirahcollective.com", source: "account" },
      { email: "hello@example.com", source: "website" },
    ]);

    const reviewCount = await db.select({ count: sql<number>`count(*)` }).from(reviews);
    if (reviewCount[0].count === 0) {
      await db.insert(reviews).values([
        {
          productId: allProducts[0]?.id,
          customerName: "Priya S.",
          rating: 5,
          title: "Incredible quality",
          body: "The quality is simply unmatched. It feels incredibly luxurious without being loud.",
          isVerified: true,
          isApproved: true,
        },
        {
          productId: allProducts[0]?.id,
          customerName: "Anjali M.",
          rating: 5,
          title: "Perfect fit",
          body: "Ameena's curation is perfect. I found exactly what I needed for my sister's wedding.",
          isVerified: true,
          isApproved: true,
        },
        {
          productId: allProducts[0]?.id,
          customerName: "Sneha R.",
          rating: 5,
          title: "Fast shipping",
          body: "Shipping was surprisingly fast, and the packaging felt like receiving a gift.",
          isVerified: true,
          isApproved: true,
        },
        {
          productId: allProducts[0]?.id,
          customerName: "Meera K.",
          rating: 5,
          title: "Understated elegance",
          body: "Finally, an Indian brand that understands understated elegance.",
          isVerified: true,
          isApproved: true,
        },
        {
          productId: allProducts[0]?.id, // Using dummy id for store-level reviews
          customerName: "Anonymous",
          rating: 5,
          title: "Exactly what I was looking for!",
          body: "Ordered the Goofy oversized tee and it came really well packaged. The fabric is soft and the fit is perfect — true to size. Loved that it was an actual branded piece and not some random find. Will definitely be ordering again from Almirah Collective!",
          isVerified: true,
          isApproved: true,
        },
      ]);
    }

    seeded = true;
  } finally {
    reseeding = false;
  }
}

export async function getProductBySlug(slug: string) {
  await ensureSeeded();
  const rows = await db.select().from(products).where(eq(products.slug, slug)).limit(1);
  return rows[0] ?? null;
}
