import { useState } from "react";
import { asApiError } from "@/lib/api";
import { useResource } from "@/lib/hooks/use-resource";
import { listAllManagedProducts } from "@/lib/services/managed-products";
import { createSale, endSale, listSales, updateSale, type Sale, type SaleDiscountType } from "@/lib/services/sales";

const salesKey = "promotion:sales";
const activeProductsKey = "promotion:active-products";

/** Management state and backend actions for the sale schedule workbench. */
export function useSaleManager() {
  const sales = useResource(listSales, salesKey);
  const products = useResource(() => listAllManagedProducts(""), activeProductsKey);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function run(action: () => Promise<unknown>, message: string) {
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      await action();
      sales.reload();
      setSuccess(message);
    } catch (cause) {
      setError(asApiError(cause).message);
    } finally {
      setBusy(false);
    }
  }

  async function save(input: { productId?: string; discountType: SaleDiscountType; discountValue: number; startsAt: string; endsAt: string }, sale?: Sale) {
    if (sale) {
      await run(() => updateSale(sale, input), "Đã cập nhật chương trình giảm giá.");
    } else if (input.productId) {
      await run(() => createSale({ ...input, productId: input.productId! }), "Đã tạo chương trình giảm giá.");
    }
  }

  return {
    sales: sales.data ?? [],
    loading: sales.loading,
    loadError: sales.error?.message ?? "",
    products: (products.data ?? []).filter((product) => product.status === "ACTIVE"),
    productsLoading: products.loading,
    busy,
    error,
    success,
    save,
    end: (sale: Sale) => run(() => endSale(sale), "Đã kết thúc chương trình giảm giá."),
  };
}
