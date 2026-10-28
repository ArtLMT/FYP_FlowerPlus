import { useRouter } from "next/navigation";
import { logout } from "@/lib/services/auth";
import { useCart } from "@/features/cart/cart-provider";

/** Signs out, clears the cached Cart (so the badge empties) and returns to /login. */
export function useSignOut() {
  const router = useRouter();
  const { refresh: refreshCart } = useCart();

  return async () => {
    await logout();
    await refreshCart();
    router.replace("/login");
    router.refresh();
  };
}
