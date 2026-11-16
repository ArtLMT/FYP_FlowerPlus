import type { Metadata } from "next";
import PolicyArticle from "@/features/policy/PolicyArticle";
import { POLICIES } from "@/features/policy/policies";

export const metadata: Metadata = { title: `${POLICIES.delivery.title} | FlowerPlus` };

/** Delivery policy — /policies/delivery. The text lives in `features/policy/policies.ts`. */
export default function DeliveryPolicyPage() {
  return <PolicyArticle policy={POLICIES.delivery} />;
}
