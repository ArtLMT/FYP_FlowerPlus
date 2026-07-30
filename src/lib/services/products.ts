import type { Product, FeaturedItem } from "@/lib/types";
import { products, featuredCollections, saleItems } from "@/lib/mock-data";

/**
 * Catalog service. Returns mock data from lib/mock-data.
 * TODO(api): replace each body with a fetch() when the backend is ready.
 */

export async function getProducts(): Promise<Product[]> {
  return products;
}

export async function getFeaturedCollections(): Promise<FeaturedItem[]> {
  return featuredCollections;
}

export async function getSaleItems(): Promise<FeaturedItem[]> {
  return saleItems;
}

export async function getProduct(id: string): Promise<Product | undefined> {
  return products.find((p) => p.id === id);
}
