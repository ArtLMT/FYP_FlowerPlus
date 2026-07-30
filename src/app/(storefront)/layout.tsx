import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import BottomNav from "@/components/layout/BottomNav";
import ChatbotFAB from "@/components/layout/ChatbotFAB";

/**
 * Storefront layout — chrome shared by all shopping pages
 * (home, and later /shop, /cart, product pages).
 *
 * The folder name "(storefront)" is wrapped in parentheses, so it's a
 * ROUTE GROUP: it organizes files without adding a URL segment. The home
 * page lives at app/(storefront)/page.tsx but its URL is still "/", not
 * "/storefront".
 *
 * Account pages live OUTSIDE this group, so they never inherit this header/
 * footer — that's how we avoid the "double header" problem.
 */
export default function StorefrontLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <Header />
      {children}
      <Footer />
      <ChatbotFAB />
      <BottomNav active="home" />
    </>
  );
}
