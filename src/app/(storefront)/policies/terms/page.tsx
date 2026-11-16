import type { Metadata } from "next";
import PolicyArticle from "@/features/policy/PolicyArticle";
import { POLICIES } from "@/features/policy/policies";

export const metadata: Metadata = { title: `${POLICIES.terms.title} | FlowerPlus` };

/** Terms of use — /policies/terms. The text lives in `features/policy/policies.ts`. */
export default function TermsPage() {
  return <PolicyArticle policy={POLICIES.terms} />;
}
