import { MetadataRoute } from 'next';
import { db } from '@/db';
import { products } from '@/db/schema';
import { CATEGORIES } from '@/lib/catalog';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://almirahcollective.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const allProducts = await db.select({ slug: products.slug, updatedAt: products.updatedAt }).from(products);

  const productUrls = allProducts.map((p) => ({
    url: `${baseUrl}/product/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const categoryUrls = CATEGORIES.map((c) => ({
    url: `${baseUrl}/shop/${c.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const staticUrls = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/shop`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/lookbook`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }
  ];

  return [...staticUrls, ...categoryUrls, ...productUrls];
}
