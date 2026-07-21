-- 1. Enable Row Level Security (RLS) on all tables exposed to public schema to secure API endpoints
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE press_mentions ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;

-- Note: We are explicitly NOT creating policies.
-- Because Drizzle ORM connects using postgres:// connection string or a Service Role key, it bypasses RLS.
-- This effectively blocks all public anonymous API access via Supabase's PostgREST (resolving the security warnings)
-- while allowing the Next.js server actions / server components to work perfectly.

-- 2. Add is_approved column to reviews
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT FALSE NOT NULL;

-- 3. Seed requested reviews
INSERT INTO reviews (product_id, customer_name, rating, title, body, is_verified, is_approved)
VALUES
(1, 'Rohan Mohammed', 5, 'Exactly what I was looking for!', 'Ordered the Goofy oversized tee and it came really well packaged. The fabric is soft and the fit is perfect — true to size. Loved that it was an actual branded piece and not some random find. Will definitely be ordering again from Almirah Collective!', true, true),
(1, 'Faiqa Saba', 5, 'Stunning dress — great quality', 'Received the broderie midi dress and I''m so happy with it. The embroidery detail is beautiful and the fabric feels premium. Packaging was neat and delivery was quick. Really impressed with the curation on this store — everything feels handpicked.', true, true),
(1, 'Sabah', 5, '', 'Absolutely loved my experience with Almirah Collective! The collection is stylish, elegant, and has such a beautiful variety of designs. The quality of the fabric, finishing, and attention to detail really stood out. Each piece feels thoughtfully curated and easy to wear. The overall shopping experience was smooth, and the outfits are perfect for anyone who loves classy, comfortable, and trendy fashion. Definitely a place I’ll keep coming back to!', true, true),
(1, 'Hifsa', 5, '', 'I am absolutely thrilled with this gorgeous piece from Almirah Collective. The deep plum hue is stunningly rich, making it an instant standout for any wardrobe. What really steals the show is the central embroidery; the intricate gold and silver threadwork mixed with subtle sequins adds the perfect touch of festive shimmer. Even the small details, like the polished decorative buttons and the sweet, handwritten thank-you note, show how much care goes into their items. The fabric looks beautifully textured, premium, and breathable. It strikes the ultimate balance between traditional elegance and modern grace—highly recommended!', true, true);
