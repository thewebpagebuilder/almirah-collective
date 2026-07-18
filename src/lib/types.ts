export type CatalogProduct = {
  slug: string;
  name: string;
  description: string;
  shortDescription: string;
  categorySlug: string;
  price: number;
  compareAtPrice?: number;
  material: string;
  careInstructions: string;
  images: string[];
  colors: { name: string; hex: string }[];
  sizes: string[];
  tags: string[];
  stock: number;
  isFeatured: boolean;
  isTrending: boolean;
  rating: number;
  reviewCount: number;
  /** Styling story / occasion tags (e.g. Office Ready, Festive) for future Lookbook looks */
  occasions?: string[];
};
