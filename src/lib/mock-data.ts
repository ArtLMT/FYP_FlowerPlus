import type {
  Product,
  FeaturedItem,
  User,
  Address,
  PaymentMethod,
  DeliveryDate,
  CartItem,
  Order,
  LiveOrder,
  Voucher,
  Notification,
} from "./types";

/**
 * Single source of mock data for the whole app.
 *
 * One canonical collection per type — screens import these (via lib/services)
 * instead of declaring their own inline arrays, so the same order / address /
 * voucher appears consistently everywhere. Swap each service for a real fetch()
 * when the backend is ready.
 */

/* Shared image URLs (a small pool reused across the mock catalog). */
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

/* ── Catalog ─────────────────────────────────────── */

export const products: Product[] = [
  { id: "1", name: "Sương Đông", materials: "Thu mẫu đơn, Bạch đàn, Bông", price: 450000, originalPrice: 600000, discountPercent: 25, imageUrl: IMG.anemone, stock: "IN STOCK", occasion: "Everyday" },
  { id: "2", name: "Hoàng Hôn San Hô", materials: "Hồng san hô, Dương xỉ, Kế", price: 680000, originalPrice: 850000, discountPercent: 20, imageUrl: IMG.peony, stock: "LOW STOCK", occasion: "Birthdays" },
  { id: "3", name: "Mây Trắng", materials: "Hồng trắng, Baby, Bạch đàn", price: 560000, originalPrice: 700000, discountPercent: 20, imageUrl: IMG.white, stock: "IN STOCK", occasion: "Weddings" },
  { id: "4", name: "Giờ Vàng", materials: "Hướng dương, Cúc La Mã, Hoàng anh", price: 520000, originalPrice: 650000, discountPercent: 20, imageUrl: IMG.sun, stock: "IN STOCK", occasion: "Birthdays" },
  { id: "5", name: "Nắng Sớm", materials: "Cúc vàng, Cẩm chướng, Lá nho", price: 450000, originalPrice: 580000, discountPercent: 22, imageUrl: IMG.anemone, stock: "LOW STOCK", occasion: "Weddings" },
  { id: "6", name: "Mẫu Đơn Lụa", materials: "Mẫu đơn, Ngải bạc, Bạch đàn", price: 720000, originalPrice: 900000, discountPercent: 20, imageUrl: IMG.peony, stock: "IN STOCK", occasion: "Everyday" },
];

const byId = (id: string) => products.find((p) => p.id === id)!;

export const saleItems: FeaturedItem[] = [
  { id: "s1", name: "Bó Mùa Hạ", materials: "Hồng, Cát tường", price: 690000, originalPrice: 980000, discountPercent: 30, imageUrl: IMG.rose },
  { id: "s2", name: "Sắc Đào", materials: "Đào, Baby trắng", price: 430000, originalPrice: 620000, discountPercent: 30, imageUrl: IMG.peony },
  { id: "s3", name: "Hồng Phai", materials: "Hồng phấn, Lá bạc", price: 380000, originalPrice: 540000, discountPercent: 30, imageUrl: IMG.white },
  { id: "s4", name: "Cúc Dại", materials: "Cúc, Hoàng anh", price: 360000, originalPrice: 480000, discountPercent: 25, imageUrl: IMG.sun },
];

export const featuredCollections: FeaturedItem[] = [
  { id: "f1", name: "Hồng Nhung", materials: "Đỏ thẫm, Bạch đàn", price: 560000, originalPrice: 750000, discountPercent: 25, imageUrl: IMG.rose },
  { id: "f2", name: "Mẫu Đơn Lụa", materials: "Mẫu đơn, Ngải bạc", price: 720000, originalPrice: 900000, discountPercent: 20, imageUrl: IMG.peony },
  { id: "f3", name: "Hoàng Hôn San Hô", materials: "Hồng san hô, Dương xỉ", price: 680000, originalPrice: 850000, discountPercent: 20, imageUrl: IMG.white },
  { id: "f4", name: "Giờ Vàng", materials: "Hướng dương, Cúc La Mã", price: 520000, originalPrice: 650000, discountPercent: 20, imageUrl: IMG.sun },
];

/* ── Account ─────────────────────────────────────── */

export const user: User = {
  id: "u1",
  username: "floral_dreamer_92",
  fullName: "Le Minh Thanh",
  email: "t****@email.com",
  phone: "***-***-5521",
  gender: "female",
  dob: { day: 12, month: "Tháng 10", year: 1992 },
};

export const addresses: Address[] = [
  { id: "a1", name: "Le Minh Thanh", line1: "124 Đường Maplewood, Căn 4B", line2: "Quận 1, TP. Hồ Chí Minh", phone: "(555) 867-5309", isDefault: true },
  { id: "a2", name: "Văn phòng Studio", line1: "890 Đường Broadway, Tầng 5", line2: "Quận 3, TP. Hồ Chí Minh", phone: "(555) 123-4567", isDefault: false },
];

/* ── Checkout ────────────────────────────────────── */

export const paymentMethods: PaymentMethod[] = [
  { id: "pm1", kind: "cod", label: "Thanh toán khi nhận hàng", icon: "payments" },
  { id: "pm2", kind: "bank", label: "Chuyển khoản / VNPay", icon: "account_balance" },
];

export const deliveryDates: DeliveryDate[] = [
  { key: "today", label: "Hôm nay" },
  { key: "tomorrow", label: "Ngày mai" },
  { key: "pick", label: "Chọn ngày", calendar: true },
];

export const deliveryTimeSlots: string[] = [
  "9:00 – 12:00",
  "12:00 – 15:00",
  "15:00 – 18:00",
  "18:00 – 21:00",
];

/* ── Cart ────────────────────────────────────────── */

export const cartItems: CartItem[] = [
  { product: byId("2"), qty: 1, selected: true }, // Hoàng Hôn San Hô
  { product: byId("4"), qty: 1, selected: true }, // Giờ Vàng
  { product: byId("6"), qty: 1, selected: true }, // Mẫu Đơn Lụa
];

/* ── Orders ──────────────────────────────────────── */

export const orders: Order[] = [
  {
    id: "FP00124",
    date: "20 Th6, 2026",
    status: "done",
    statusLabel: "HOÀN TẤT",
    total: 560000,
    items: [{ name: "Hồng Nhung", materials: "Hồng đỏ và bạch đàn", qty: 1, price: 560000, imageUrl: IMG.rose }],
  },
  {
    id: "FP00120",
    date: "12 Th6, 2026",
    status: "done",
    statusLabel: "HOÀN TẤT",
    total: 720000,
    items: [{ name: "Mẫu Đơn Phấn", materials: "Mẫu đơn trắng và hoa baby", qty: 1, price: 720000, imageUrl: IMG.peony }],
  },
];

export const liveOrder: LiveOrder = {
  id: "FP00123",
  steps: [
    { label: "CHỜ XÁC NHẬN", state: "done" },
    { label: "ĐANG XỬ LÝ", state: "current" },
    { label: "ĐANG GIAO", state: "todo" },
  ],
  timeline: [
    { time: "11:45", text: "Đơn hàng đã được bàn giao cho đơn vị vận chuyển", active: true },
    { time: "10:30", text: "Đơn hàng #FP00123 đã được duyệt", active: false },
  ],
};

/* ── Vouchers & notifications ────────────────────── */

export const vouchers: Voucher[] = [
  { code: "FLOWER50", amount: "Giảm 50%", tag: "THEO MÙA", desc: "Đơn tối thiểu 500.000đ", validUntil: "25/10/2026", state: "active" },
  { code: "FREEDEL", amount: "Miễn phí giao", tag: "ƯU ĐÃI", desc: "Cho mọi đơn đặt riêng", validUntil: "01/11/2026", state: "active" },
  { code: "WELCOME15", amount: "Giảm 150.000đ", tag: "CHÀO MỪNG", desc: "Cho lần mua đầu tiên", validUntil: "31/12/2026", state: "active" },
];

export const notifications: Notification[] = [
  { id: "n1", kind: "order", cat: "ĐƠN HÀNG", title: "Hoa của bạn đã nở!", body: "Đơn #FLW-8924 đang được giao hôm nay.", time: "Vừa xong", unread: true },
  { id: "n2", kind: "voucher", cat: "ƯU ĐÃI & KHUYẾN MÃI", title: "Ưu đãi chào xuân", body: "Giảm 20% cho tất cả bộ sưu tập theo mùa.", time: "2 giờ trước", unread: true },
  { id: "n3", kind: "order", cat: "ĐƠN HÀNG", title: "Đã giao: Mộc Mạc", body: "Đơn hoa của bạn đã được giao đến tận cửa.", time: "Hôm qua", unread: false },
  { id: "n4", kind: "account", cat: "TÀI KHOẢN", title: "Chào mừng đến FlowerPlus Premium", body: "Gói đăng ký của bạn đã được kích hoạt.", time: "12/10", unread: false },
  { id: "n5", kind: "order", cat: "ĐƠN HÀNG", title: "Đã xác nhận đơn hàng", body: "Đã nhận đơn #FLW-8810. Đang chuẩn bị…", time: "10/10", unread: false },
];
