import { api, RequestError } from "@/lib/api";
import type {
  FeaturedItem,
  PublicProductDetail,
  PublicProductSummary,
} from "@/lib/types";
import { featuredCollections, saleItems } from "@/lib/mock-data";

/**
 * Public Product catalog service. Product list/detail come from the backend;
 * Promotion-owned showcase sections remain separate until Promotion is built.
 */

interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export async function getProducts(search?: string): Promise<PublicProductSummary[]> {
  const params = new URLSearchParams({ page: "0", size: "100" });
  if (search?.trim()) params.set("search", search.trim());
  const page = await api<PageResponse<PublicProductSummary>>(`/api/products?${params.toString()}`);
  return page.content;
}

export async function getFeaturedCollections(): Promise<FeaturedItem[]> {
  return featuredCollections;
}

export async function getSaleItems(): Promise<FeaturedItem[]> {
  return saleItems;
}

export async function getProduct(id: string): Promise<PublicProductDetail | undefined> {
  try {
    return await api<PublicProductDetail>(`/api/products/${encodeURIComponent(id)}`);
  } catch (error) {
    if (error instanceof RequestError && error.status === 404) return undefined;
    throw error;
  }
}
