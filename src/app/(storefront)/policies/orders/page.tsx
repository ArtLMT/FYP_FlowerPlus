import type { Metadata } from "next";
import PolicyArticle from "@/features/policy/PolicyArticle";
import { POLICIES } from "@/features/policy/policies";

export const metadata: Metadata = { title: `${POLICIES.orders.title} | FlowerPlus` };

/** Ordering, cancellation and refunds — /policies/orders. The text lives in `features/policy/policies.ts`. */
export default function OrderPolicyPage() {
  return <PolicyArticle policy={POLICIES.orders} />;
}
