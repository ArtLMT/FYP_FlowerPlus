/** Format a number as Vietnamese Dong, e.g. 690000 → "690.000đ" */
export const formatVND = (price: number): string =>
  price.toLocaleString("vi-VN") + "đ";
