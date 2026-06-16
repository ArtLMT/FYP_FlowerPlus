import type { Metadata } from "next";
import { EB_Garamond, Karla } from "next/font/google";
import "./globals.css";

/**
 * EB Garamond — display / headline serif.
 * `variable` injects --font-garamond onto <html> so globals.css @theme
 * can reference it via var(--font-garamond).
 */
const ebGaramond = EB_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  style: ["normal", "italic"],
  variable: "--font-garamond",
  display: "swap",
});

/**
 * Karla — body / UI humanist sans-serif.
 */
const karla = Karla({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800"],
  variable: "--font-karla",
  display: "swap",
});

export const metadata: Metadata = {
  title: "FlowerPlus | Modern Botanical Gifting",
  description:
    "Fresh Blooms, Your Way. Elegance delivered to your doorstep, crafted with seasonal materials for every moment.",
};

import Header from "@/app/components/layout/Header";
import Footer from "@/app/components/layout/Footer";
import BottomNav from "@/app/components/layout/BottomNav";
import ChatbotFAB from "@/app/components/ui/ChatbotFAB";

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${ebGaramond.variable} ${karla.variable} scroll-smooth`}
    >
      <head>
        {/*
          Material Symbols Outlined — icon font.
          next/font doesn't support icon fonts, so this stays as a <link>.
          The font-variation-settings are controlled globally via .material-symbols-outlined in globals.css.
        */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        />
      </head>
      <body className="bg-neutral-canvas text-text-primary font-sans overflow-x-hidden">
        <Header />
        {children}
        <Footer />
        <ChatbotFAB />
        <BottomNav />
      </body>
    </html>
  );
}
