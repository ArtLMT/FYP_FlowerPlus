import type { Metadata } from "next";
import { EB_Garamond, Karla } from "next/font/google";
import "./globals.css";

/**
 * ── TYPOGRAPHY — single swap point ──────────────────────────────
 * To change the whole app's type, change the two font functions below.
 * They feed --font-serif-src / --font-sans-src, which globals.css maps onto the
 * `font-serif` / `font-sans` utilities. Nothing else needs to change.
 *
 * The `vietnamese` subset is REQUIRED: without it the Vietnamese diacritics
 * (ế, ữ, ọ, đ …) fall back to a system font and render inconsistently.
 */
const displayFont = EB_Garamond({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800"],
  style: ["normal", "italic"],
  variable: "--font-serif-src",
  display: "swap",
});

// NOTE: Karla does NOT publish a Vietnamese subset (only latin / latin-ext),
// so Vietnamese tone-marked glyphs in body text fall back to a system font.
// For full coverage, swap this to a Vietnamese-native sans (e.g. Be_Vietnam_Pro).
const bodyFont = Karla({
  subsets: ["latin", "latin-ext"],
  weight: ["200", "300", "400", "500", "600", "700", "800"],
  variable: "--font-sans-src",
  display: "swap",
});

import { CartProvider } from "@/features/cart/cart-provider";
import { ToastProvider } from "@/components/ui/ToastProvider";

export const metadata: Metadata = {
  title: "FlowerPlus | Modern Botanical Gifting",
  description:
    "Fresh Blooms, Your Way. Elegance delivered to your doorstep, crafted with seasonal materials for every moment.",
};

/**
 * Root layout — the ONE required layout (must contain <html> and <body>).
 *
 * Deliberately minimal: it owns only the document shell, fonts, and global CSS.
 * It does NOT render Header/Footer/BottomNav, because different sections of the
 * app need different chrome:
 *   • app/(storefront)/layout.tsx → storefront chrome (search header, footer, bottom nav)
 *   • app/account/*               → each account screen composes its own chrome
 *
 * This is the key App Router idea: a layout.tsx shares chrome with everything
 * BELOW it. Keep the root bare so each section can opt into its own shell.
 */
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="vi"
      className={`${displayFont.variable} ${bodyFont.variable} scroll-smooth`}
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
        {/* App-wide providers: the toast banner and cart state are available on every page. */}
        <ToastProvider>
          <CartProvider>{children}</CartProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
