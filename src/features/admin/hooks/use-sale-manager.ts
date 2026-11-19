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

  /** Runs a backend action; resolves to true on success, false after showing the error. */
  async function run(action: () => Promise<unknown>, message: string): Promise<boolean> {
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      await action();
      sales.reload();
      setSuccess(message);
      return true;
    } catch (cause) {
      setError(asApiError(cause).message);
      return false;
    } finally {
      setBusy(false);
    }
  }

  /** Resolves to true only when the backend saved the sale, so the form can stay open on an error. */
  async function save(input: { productId?: string; discountType: SaleDiscountType; discountValue: number; startsAt: string; endsAt: string }, sale?: Sale): Promise<boolean> {
    if (sale) {
      return run(() => updateSale(sale, input), "Đã cập nhật chương trình giảm giá.");
    }
    if (input.productId) {
      return run(() => createSale({ ...input, productId: input.productId! }), "Đã tạo chương trình giảm giá.");
    }
    return false;
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
