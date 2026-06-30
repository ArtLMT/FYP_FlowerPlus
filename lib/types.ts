/** Stock availability shown on product badges */
export type StockStatus = "IN STOCK" | "LOW STOCK" | "OUT OF STOCK";

/** A product in the main Signature Arrangements grid */
export interface Product {
  id: string;
  name: string;
  /** Comma-separated list of floral materials */
  materials: string;
  /** Current / sale price */
  price: number;
  /** Crossed-out original price — present when item is on sale */
  originalPrice?: number;
  /** Discount percentage, e.g. 25 means "-25%" */
  discountPercent?: number;
  imageUrl: string;
  stock: StockStatus;
  /** Occasion category used for tab filtering */
  occasion?: "Birthdays" | "Weddings" | "Everyday" | "Sympathy";
}

/** A featured / on-sale item shown in the horizontal carousel */
export interface FeaturedItem {
  id: string;
  name: string;
  materials: string;
  price: number;
  originalPrice: number;
  discountPercent: number;
  imageUrl: string;
}
