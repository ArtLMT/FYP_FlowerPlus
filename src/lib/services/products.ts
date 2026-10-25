import { api, asApiError, path, withQuery, type Page } from "@/lib/api";
import type { FeaturedItem } from "@/lib/types";
import { saleItems } from "@/lib/mock-data";

/**
 * Public Product catalog. Product list/detail come from the backend; the Promotion-owned sale
 * showcase stays on mock data until Promotion is built.
 */

export type PublicProductType = "PRE_ORDER" | "PRE_MADE";

export interface PublicProductCategory {
  id: string;
  name: string;
}

export interface PublicProductImage {
  id: string;
  contentUrl: string;
  displayOrder: number;
}

/** Public-safe card data returned by GET /api/products. */
export interface PublicProductSummary {
  id: string;
  name: string;
  type: PublicProductType;
  basePrice: number;
  categories: PublicProductCategory[];
  mainImageUrl: string | null;
}

/** Public-safe detail data returned by GET /api/products/{id}. */
interface PublicProductDetailResponse extends Omit<PublicProductSummary, "mainImageUrl"> {
  description: string;
  images: PublicProductImage[];
}

/** Whether the customer can buy now, and how to say so. Checkout rechecks the whole Cart anyway. */
export interface ProductAvailability {
  canBuy: boolean;
  title: string;
  detail: string;
}

export interface ProductDetail extends PublicProductDetailResponse {
  /** Sorted by display order. */
  images: PublicProductImage[];
  availability: ProductAvailability;
}

export interface CategoryShowcase {
  category: PublicProductCategory;
  products: PublicProductSummary[];
}

/** Active products, optionally only the first `limit`. */
export async function getProducts(limit?: number): Promise<PublicProductSummary[]> {
  const page = await api<Page<PublicProductSummary>>(withQuery("/api/products", { page: 0, size: 100 }));
  return page.content.slice(0, limit);
}

/** The product, or undefined when it does not exist or is not Active. */
export async function getProduct(id: string): Promise<ProductDetail | undefined> {
  try {
    const product = await api<PublicProductDetailResponse>(path`/api/products/${id}`);
    return {
      ...product,
      images: [...product.images].sort((left, right) => left.displayOrder - right.displayOrder),
      availability: availabilityOf(product),
    };
  } catch (cause) {
    if (asApiError(cause).status === 404) return undefined;
    throw cause;
  }
}

/** Up to three other products sharing a category with `product`. */
export async function getRelatedProducts(product: ProductDetail): Promise<PublicProductSummary[]> {
  const categoryIds = new Set(product.categories.map((category) => category.id));
  return (await getProducts())
    .filter((candidate) => candidate.id !== product.id
      && candidate.categories.some((category) => categoryIds.has(category.id)))
    .slice(0, 3);
}

/** The home page's "shop by category" rows: the first three categories, four products each. */
export async function getCategoryShowcases(): Promise<CategoryShowcase[]> {
  const products = await getProducts();
  const categories = new Map<string, PublicProductCategory>();
  products.forEach((product) => product.categories.forEach((category) => categories.set(category.id, category)));

  return [...categories.values()].slice(0, 3).map((category) => ({
    category,
    products: products
      .filter((product) => product.categories.some((candidate) => candidate.id === category.id))
      .slice(0, 4),
  }));
}

export async function getSaleItems(): Promise<FeaturedItem[]> {
  return saleItems;
}

/**
 * Purchase state; the product cards and the product page both use it. A PreOrder is never shown as
 * out of stock: it is made for its delivery date, so checkout alone checks the materials.
 */
export function availabilityOf(product: Pick<PublicProductSummary, "type">): ProductAvailability {
  if (product.type !== "PRE_ORDER") {
    return { canBuy: false, title: "Chưa mở bán trực tuyến", detail: "Sản phẩm làm sẵn sẽ được mở bán sau." };
  }
  return {
    canBuy: true,
    title: "Có thể đặt trước",
    detail: "Cửa hàng kiểm tra nguyên liệu theo ngày chuẩn bị bạn chọn khi đặt hàng.",
  };
}
