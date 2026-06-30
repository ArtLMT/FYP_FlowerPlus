import type { Product, FeaturedItem } from "@/lib/types";

/**
 * Products Service
 *
 * Centralized data fetching abstraction.
 * Currently returns mock data from lib/data.ts.
 * Once the backend API is ready, replace these implementations with fetch() calls.
 */

export async function getProducts(): Promise<Product[]> {
  // Replace with: return fetch("https://api.flowerplus.com/products").then(r => r.json());
  return import("@/lib/data").then((m) => m.products);
}

export async function getFeaturedCollections(): Promise<FeaturedItem[]> {
  // Replace with: return fetch("https://api.flowerplus.com/featured").then(r => r.json());
  return import("@/lib/data").then((m) => m.featuredCollections);
}

export async function getSaleItems(): Promise<FeaturedItem[]> {
  // Replace with: return fetch("https://api.flowerplus.com/sale").then(r => r.json());
  return import("@/lib/data").then((m) => m.saleItems);
}
