import { api, asApiError, path } from "@/lib/api";
import { getCurrentUser } from "@/lib/services/auth";
import type { PublicProductType } from "@/lib/services/products";

/**
 * The signed-in Customer's own Cart. Every change answers with the Cart re-read after commit.
 * Prices are current values, never an Order snapshot. Stock is never checked for a PreOrder: the
 * shop takes its materials when staff start preparing the order (BR-PROD-10, BR-INV-15).
 */

/** HIDDEN: the product is no longer sold. MATERIAL_INACTIVE: unavailable for new orders (BR-PROD-12). */
export type CartUnavailableReason = "HIDDEN" | "MATERIAL_INACTIVE";

const PROBLEMS: Record<CartUnavailableReason, string> = {
  HIDDEN: "Sản phẩm không còn được bán",
  MATERIAL_INACTIVE: "Sản phẩm tạm ngừng nhận đơn",
};

interface CartLineResponse {
  productId: string;
  quantity: number;
  name: string;
  type: PublicProductType;
  mainImageUrl: string | null;
  basePrice: number;
  unavailableReason: CartUnavailableReason | null;
}

interface CartResponse {
  version: number;
  lines: CartLineResponse[];
}

export interface CartLine extends CartLineResponse {
  /** What the customer must fix before checkout (the product is no longer sold), or null. */
  problem: string | null;
  /** Whether one more can be added: still sold and below 99 per line. */
  canIncrease: boolean;
}

export interface Cart {
  /** Sent back as `cartVersion` at checkout. */
  version: number;
  lines: CartLine[];
  /** Total quantity across all lines — the header badge. */
  itemCount: number;
  /** At current list prices. */
  subtotal: number;
  /** Some line blocks checkout. */
  hasProblems: boolean;
}

/**
 * Who is shopping. Every signed-in (verified) account — Customer, Staff or Admin — has a Cart and
 * may check out while Active; a Suspended account may edit its Cart but not place an Order. A
 * Guest has no Cart.
 */
export type Shopper = "loading" | "guest" | "active" | "suspended";

const MAX_LINE_QUANTITY = 99;

function toCart(response: CartResponse): Cart {
  const lines = response.lines.map((line) => ({
    ...line,
    problem: line.unavailableReason === null ? null : PROBLEMS[line.unavailableReason],
    canIncrease: line.unavailableReason === null && line.quantity < MAX_LINE_QUANTITY,
  }));
  return {
    version: response.version,
    lines,
    itemCount: lines.reduce((sum, line) => sum + line.quantity, 0),
    subtotal: lines.reduce((sum, line) => sum + line.basePrice * line.quantity, 0),
    hasProblems: lines.some((line) => line.problem !== null),
  };
}

export const getCart = () => api<CartResponse>("/api/cart").then(toCart);

/** The current shopper and, when signed in, their Cart. */
export async function getShopperCart(): Promise<{ shopper: Exclude<Shopper, "loading">; cart: Cart | null }> {
  try {
    const user = await getCurrentUser();
    if (!user) return { shopper: "guest", cart: null };
    // Only ACTIVE may order (the server's canPlaceOrder); a signed-in account is otherwise SUSPENDED.
    return { shopper: user.status === "ACTIVE" ? "active" : "suspended", cart: await getCart() };
  } catch (cause) {
    if (asApiError(cause).status === 401) return { shopper: "guest", cart: null };
    throw cause;
  }
}

export const addCartItem = (productId: string, quantity: number) =>
  api<CartResponse>("/api/cart/items", { method: "POST", body: { productId, quantity } }).then(toCart);

/** Quantity 0 removes the line. */
export const updateCartItem = (productId: string, quantity: number) =>
  api<CartResponse>(path`/api/cart/items/${productId}`, { method: "PUT", body: { quantity } }).then(toCart);

export async function removeCartItem(productId: string): Promise<Cart> {
  await api<void>(path`/api/cart/items/${productId}`, { method: "DELETE" });
  return getCart();
}
