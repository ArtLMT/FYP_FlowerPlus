import type { FeaturedItem, Notification, Voucher } from "./types";

/**
 * Mock data for the screens that have no backend yet.
 *
 * Screens never import this file directly — they call lib/services, which
 * return these collections. Swap each service body for a real request when
 * its backend is ready, then delete the data here.
 */

/* Shared image URLs (a small pool reused across the mock data). */
const IMG = {
  rose:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCSmkSgMDgNa_sr1692th8VHhzWjJcPzbq5aqrhkiFTAqBeOYrD_GLVUzLIJcaD0_t_enhC0N0oTus5Zcqve-i5kPJ2i_kpruq18MlKlu5-lUxW9YUi9gTxp2XePM3c1zNi4mKdrjHkpwogX34HJFKQfTfZ1wL_W_zUvd9lUAEy0ugypQjvMTIw56SUBw7Y_CA2lgJGoAJNMUYDp7mCUOVOxZpsR2ER83lifNQsf8-zRum06W4wlWdFSxMOgByn6YQA-WiQYbLPsME",
  peony:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCYDmsLMWFACA0R51yv4dgXbYDLJMZLk-iuqO7N5fG4AC9Dw2zZRBkwiS4I9kxb7R6PKrLE-YY32ZzEsE9wJybuGPWrSq649z9PGhdNxtyooI8g0aJJatQVmp44E2h2_u2s2inUz4-4noqpY2zeu-k9x0H1XXt0ubxphBE5fqezLqUn2NwFW59BO8s4NRJqjnMQUPs62eRF8rH3T9k00qBuB9ORwONK1ECh6qbXB_aTIthzw6SRmtZk4jNiCK0wBVk8VQXikwERgBM",
  white:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuBJdxt2vU0MXJHzIqkT6_Vx0sV2bht99bOm7GL7RogbnW6PrD-CIjsk76EjJpNQdGA2OVO0gAvyDRd1GGtPR24EU2ymPb4YhbQWLve_f6eDnXGhHK8_o7FtavC1WNsQ9QSotD0fHGZCTPmmVXB7jfLhNN1eTU48YVLAzN9_aEdDbjKs99sLg-FalNOUyHOgK4T7hHLBBJ88nGd5VghInGelaifmU0BlGyJgvKjNp3H_UhLBCQhvuRL5yVGGSbymeGI5_l6seOmZSzo",
  sun:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuAP8CzErW_iY6qKZn5ZdaKwBl-cGOEuihUev-QaXTwDGiloH9uR-H9NosZ9E5joO2ZqIfBI4e446zDG8-xPQQ3m9RSzEw3VKv9sg4VyRAc9X7npqVfnUGkYFsZ7odFs3CtypUjrLcYQoQstqNduc1t3QB5yLNSzzSJQHpdmv9PnEZ49vHPhT4RY_XIQL0WNNzH6LZm0-1LSiZrs4wOafjJX61Bu3NcGyKQBxvYv7hHWcTXGAarOSZL6xhmDeuPBWn3_3Xs99Nom8bk",
  anemone:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuABdmnB7oIBRIOGurGccYgibAqpdGjpg_wgyaHoA1RT7Gh5cdqGHmN4bm5FX5m9zzrBo5dpYeRPpoDheNQEuS2ETD-J3znizMGWxX_2XK0aL_cBf3W_yPuGkkYMHVYeKPH9nDaFu4wSXvFcDYfkLGzmk878yR2-oDj7Mp5vfj8fI_A_6LG4tHrF9GYA3s9f6Ib4iMgbUP_Gb6EvDfvHuKBnIp5mOF9XmuRL-Mu1j2zBVWKVU8O2I1tdBu9Ieg9lTzeicD6M4Upy6l8",
};

/* ── Sale showcase ───────────────────────────────── */

export const saleItems: FeaturedItem[] = [
  { id: "s1", name: "Bó Mùa Hạ", materials: "Hồng, Cát tường", price: 690000, originalPrice: 980000, discountPercent: 30, imageUrl: IMG.rose },
  { id: "s2", name: "Sắc Đào", materials: "Đào, Baby trắng", price: 430000, originalPrice: 620000, discountPercent: 30, imageUrl: IMG.peony },
  { id: "s3", name: "Hồng Phai", materials: "Hồng phấn, Lá bạc", price: 380000, originalPrice: 540000, discountPercent: 30, imageUrl: IMG.white },
  { id: "s4", name: "Cúc Dại", materials: "Cúc, Hoàng anh", price: 360000, originalPrice: 480000, discountPercent: 25, imageUrl: IMG.sun },
];

/* ── Vouchers & notifications ────────────────────── */

export const vouchers: Voucher[] = [
  { code: "FLOWER50", amount: "Giảm 50%", tag: "THEO MÙA", desc: "Đơn tối thiểu 500.000đ", validUntil: "25/10/2026", state: "active", kind: "percent", value: 50, minSubtotal: 500000 },
  { code: "FREEDEL", amount: "Miễn phí giao", tag: "ƯU ĐÃI", desc: "Cho mọi đơn đặt riêng", validUntil: "01/11/2026", state: "active", kind: "shipping", value: 0 },
  { code: "WELCOME15", amount: "Giảm 150.000đ", tag: "CHÀO MỪNG", desc: "Cho lần mua đầu tiên", validUntil: "31/12/2026", state: "active", kind: "fixed", value: 150000 },
];

export const notifications: Notification[] = [
  { id: "n1", kind: "order", cat: "ĐƠN HÀNG", title: "Hoa của bạn đã nở!", body: "Đơn #FLW-8924 đang được giao hôm nay.", time: "Vừa xong", unread: true },
  { id: "n2", kind: "voucher", cat: "ƯU ĐÃI & KHUYẾN MÃI", title: "Ưu đãi chào xuân", body: "Giảm 20% cho tất cả bộ sưu tập theo mùa.", time: "2 giờ trước", unread: true },
  { id: "n3", kind: "order", cat: "ĐƠN HÀNG", title: "Đã giao: Mộc Mạc", body: "Đơn hoa của bạn đã được giao đến tận cửa.", time: "Hôm qua", unread: false },
  { id: "n4", kind: "account", cat: "TÀI KHOẢN", title: "Chào mừng đến FlowerPlus Premium", body: "Gói đăng ký của bạn đã được kích hoạt.", time: "12/10", unread: false },
  { id: "n5", kind: "order", cat: "ĐƠN HÀNG", title: "Đã xác nhận đơn hàng", body: "Đã nhận đơn #FLW-8810. Đang chuẩn bị…", time: "10/10", unread: false },
];
