import type { Metadata } from "next";
import PolicyArticle from "@/features/policy/PolicyArticle";
import { POLICIES } from "@/features/policy/policies";

export const metadata: Metadata = { title: `${POLICIES.privacy.title} | FlowerPlus` };

/** Privacy policy — /policies/privacy. The text lives in `features/policy/policies.ts`. */
export default function PrivacyPage() {
  return <PolicyArticle policy={POLICIES.privacy} />;
}
