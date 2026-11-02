import { useState } from "react";
import { useRouter } from "next/navigation";
import { asApiError } from "@/lib/api";
import { useCart } from "@/features/cart/cart-provider";
import { useToast } from "@/components/ui/ToastProvider";

/** "Add to cart" / "Buy now" on the product page. A guest is sent to sign in instead. */
export function useAddToCart(productId: string) {
  const router = useRouter();
  const { add } = useCart();
  const { showToast } = useToast();
  const [adding, setAdding] = useState(false);

  async function addToCart(goToCart: boolean) {
    setAdding(true);
    try {
      await add(productId, 1);
      if (goToCart) router.push("/cart");
      else showToast("success", "Đã thêm vào giỏ hàng.");
    } catch (cause) {
      const error = asApiError(cause);
      if (error.status === 401) router.push("/login");
      else showToast("error", error.message);
    } finally {
      setAdding(false);
    }
  }

  return { adding, addToCart };
}
