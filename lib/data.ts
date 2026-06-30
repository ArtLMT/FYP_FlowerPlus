import type { Product, FeaturedItem } from "./types";

/**
 * Sale items — compact strip between Hero and Featured Collections.
 * Prices in VND.
 */
export const saleItems: FeaturedItem[] = [
  {
    id: "s1",
    name: "Bó Mùa Hạ",
    materials: "Hồng, Cát tường",
    price: 690000,
    originalPrice: 980000,
    discountPercent: 30,
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCSmkSgMDgNa_sr1692th8VHhzWjJcPzbq5aqrhkiFTAqBeOYrD_GLVUzLIJcaD0_t_enhC0N0oTus5Zcqve-i5kPJ2i_kpruq18MlKlu5-lUxW9YUi9gTxp2XePM3c1zNi4mKdrjHkpwogX34HJFKQfTfZ1wL_W_zUvd9lUAEy0ugypQjvMTIw56SUBw7Y_CA2lgJGoAJNMUYDp7mCUOVOxZpsR2ER83lifNQsf8-zRum06W4wlWdFSxMOgByn6YQA-WiQYbLPsME",
  },
  {
    id: "s2",
    name: "Sắc Đào",
    materials: "Đào, Baby trắng",
    price: 430000,
    originalPrice: 620000,
    discountPercent: 30,
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCYDmsLMWFACA0R51yv4dgXbYDLJMZLk-iuqO7N5fG4AC9Dw2zZRBkwiS4I9kxb7R6PKrLE-YY32ZzEsE9wJybuGPWrSq649z9PGhdNxtyooI8g0aJJatQVmp44E2h2_u2s2inUz4-4noqpY2zeu-k9x0H1XXt0ubxphBE5fqezLqUn2NwFW59BO8s4NRJqjnMQUPs62eRF8rH3T9k00qBuB9ORwONK1ECh6qbXB_aTIthzw6SRmtZk4jNiCK0wBVk8VQXikwERgBM",
  },
  {
    id: "s3",
    name: "Hồng Phai",
    materials: "Hồng phấn, Lá bạc",
    price: 380000,
    originalPrice: 540000,
    discountPercent: 30,
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBJdxt2vU0MXJHzIqkT6_Vx0sV2bht99bOm7GL7RogbnW6PrD-CIjsk76EjJpNQdGA2OVO0gAvyDRd1GGtPR24EU2ymPb4YhbQWLve_f6eDnXGhHK8_o7FtavC1WNsQ9QSotD0fHGZCTPmmVXB7jfLhNN1eTU48YVLAzN9_aEdDbjKs99sLg-FalNOUyHOgK4T7hHLBBJ88nGd5VghInGelaifmU0BlGyJgvKjNp3H_UhLBCQhvuRL5yVGGSbymeGI5_l6seOmZSzo",
  },
  {
    id: "s4",
    name: "Cúc Dại",
    materials: "Cúc, Hoàng anh",
    price: 360000,
    originalPrice: 480000,
    discountPercent: 25,
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAP8CzErW_iY6qKZn5ZdaKwBl-cGOEuihUev-QaXTwDGiloH9uR-H9NosZ9E5joO2ZqIfBI4e446zDG8-xPQQ3m9RSzEw3VKv9sg4VyRAc9X7npqVfnUGkYFsZ7odFs3CtypUjrLcYQoQstqNduc1t3QB5yLNSzzSJQHpdmv9PnEZ49vHPhT4RY_XIQL0WNNzH6LZm0-1LSiZrs4wOafjJX61Bu3NcGyKQBxvYv7hHWcTXGAarOSZL6xhmDeuPBWn3_3Xs99Nom8bk",
  },
];

/**
 * Featured Collections — horizontal carousel.
 * Prices in VND.
 */
export const featuredCollections: FeaturedItem[] = [
  {
    id: "f1",
    name: "Hồng Nhung",
    materials: "Đỏ thẫm, Bạch đàn",
    price: 560000,
    originalPrice: 750000,
    discountPercent: 25,
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCSmkSgMDgNa_sr1692th8VHhzWjJcPzbq5aqrhkiFTAqBeOYrD_GLVUzLIJcaD0_t_enhC0N0oTus5Zcqve-i5kPJ2i_kpruq18MlKlu5-lUxW9YUi9gTxp2XePM3c1zNi4mKdrjHkpwogX34HJFKQfTfZ1wL_W_zUvd9lUAEy0ugypQjvMTIw56SUBw7Y_CA2lgJGoAJNMUYDp7mCUOVOxZpsR2ER83lifNQsf8-zRum06W4wlWdFSxMOgByn6YQA-WiQYbLPsME",
  },
  {
    id: "f2",
    name: "Mẫu Đơn Lụa",
    materials: "Mẫu đơn, Ngải bạc",
    price: 720000,
    originalPrice: 900000,
    discountPercent: 20,
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCYDmsLMWFACA0R51yv4dgXbYDLJMZLk-iuqO7N5fG4AC9Dw2zZRBkwiS4I9kxb7R6PKrLE-YY32ZzEsE9wJybuGPWrSq649z9PGhdNxtyooI8g0aJJatQVmp44E2h2_u2s2inUz4-4noqpY2zeu-k9x0H1XXt0ubxphBE5fqezLqUn2NwFW59BO8s4NRJqjnMQUPs62eRF8rH3T9k00qBuB9ORwONK1ECh6qbXB_aTIthzw6SRmtZk4jNiCK0wBVk8VQXikwERgBM",
  },
  {
    id: "f3",
    name: "Hoàng Hôn San Hô",
    materials: "Hồng san hô, Dương xỉ",
    price: 680000,
    originalPrice: 850000,
    discountPercent: 20,
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBJdxt2vU0MXJHzIqkT6_Vx0sV2bht99bOm7GL7RogbnW6PrD-CIjsk76EjJpNQdGA2OVO0gAvyDRd1GGtPR24EU2ymPb4YhbQWLve_f6eDnXGhHK8_o7FtavC1WNsQ9QSotD0fHGZCTPmmVXB7jfLhNN1eTU48YVLAzN9_aEdDbjKs99sLg-FalNOUyHOgK4T7hHLBBJ88nGd5VghInGelaifmU0BlGyJgvKjNp3H_UhLBCQhvuRL5yVGGSbymeGI5_l6seOmZSzo",
  },
  {
    id: "f4",
    name: "Giờ Vàng",
    materials: "Hướng dương, Cúc La Mã",
    price: 520000,
    originalPrice: 650000,
    discountPercent: 20,
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAP8CzErW_iY6qKZn5ZdaKwBl-cGOEuihUev-QaXTwDGiloH9uR-H9NosZ9E5joO2ZqIfBI4e446zDG8-xPQQ3m9RSzEw3VKv9sg4VyRAc9X7npqVfnUGkYFsZ7odFs3CtypUjrLcYQoQstqNduc1t3QB5yLNSzzSJQHpdmv9PnEZ49vHPhT4RY_XIQL0WNNzH6LZm0-1LSiZrs4wOafjJX61Bu3NcGyKQBxvYv7hHWcTXGAarOSZL6xhmDeuPBWn3_3Xs99Nom8bk",
  },
];

/**
 * Signature Arrangements — "Thiết kế đặc trưng" 2-column grid.
 * Prices in VND.
 */
export const products: Product[] = [
  {
    id: "1",
    name: "Sương Đông",
    materials: "Thu mẫu đơn, Bạch đàn, Bông",
    price: 450000,
    originalPrice: 600000,
    discountPercent: 25,
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuABdmnB7oIBRIOGurGccYgibAqpdGjpg_wgyaHoA1RT7Gh5cdqGHmN4bm5FX5m9zzrBo5dpYeRPpoDheNQEuS2ETD-J3znizMGWxX_2XK0aL_cBf3W_yPuGkkYMHVYeKPH9nDaFu4wSXvFcDYfkLGzmk878yR2-oDj7Mp5vfj8fI_A_6LG4tHrF9GYA3s9f6Ib4iMgbUP_Gb6EvDfvHuKBnIp5mOF9XmuRL-Mu1j2zBVWKVU8O2I1tdBu9Ieg9lTzeicD6M4Upy6l8",
    stock: "IN STOCK",
    occasion: "Everyday",
  },
  {
    id: "2",
    name: "Hoàng Hôn San Hô",
    materials: "Hồng san hô, Dương xỉ, Kế",
    price: 680000,
    originalPrice: 850000,
    discountPercent: 20,
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCYDmsLMWFACA0R51yv4dgXbYDLJMZLk-iuqO7N5fG4AC9Dw2zZRBkwiS4I9kxb7R6PKrLE-YY32ZzEsE9wJybuGPWrSq649z9PGhdNxtyooI8g0aJJatQVmp44E2h2_u2s2inUz4-4noqpY2zeu-k9x0H1XXt0ubxphBE5fqezLqUn2NwFW59BO8s4NRJqjnMQUPs62eRF8rH3T9k00qBuB9ORwONK1ECh6qbXB_aTIthzw6SRmtZk4jNiCK0wBVk8VQXikwERgBM",
    stock: "LOW STOCK",
    occasion: "Birthdays",
  },
  {
    id: "3",
    name: "Mây Trắng",
    materials: "Hồng trắng, Baby, Bạch đàn",
    price: 560000,
    originalPrice: 700000,
    discountPercent: 20,
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAWTOd3J__fDYyXONRn_r6-l5qpZGre-_yZGDbzFv2IFDV16TOT6RKlVkCWVMpJFDO3geWa-W-ktrYQnQ9f69n6uMOicNaL92klhB951hRxG6nHM5s1-ZlqIA1xv1VxZFMEL-BFTT1WwogwiJSBk0-62MiRwIXaTnmcHgdcfGFqW9xKmE5zcFushwFSv2-CPUAvgLpCaSYs9ofNOAkbe5WSC-SJ0t0QOcFIOPcYPw7sagGRf-L5CHQlX4M09xCp86RJllxClS3bN6s",
    stock: "IN STOCK",
    occasion: "Weddings",
  },
  {
    id: "4",
    name: "Giờ Vàng",
    materials: "Hướng dương, Cúc La Mã, Hoàng anh",
    price: 520000,
    originalPrice: 650000,
    discountPercent: 20,
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAP8CzErW_iY6qKZn5ZdaKwBl-cGOEuihUev-QaXTwDGiloH9uR-H9NosZ9E5joO2ZqIfBI4e446zDG8-xPQQ3m9RSzEw3VKv9sg4VyRAc9X7npqVfnUGkYFsZ7odFs3CtypUjrLcYQoQstqNduc1t3QB5yLNSzzSJQHpdmv9PnEZ49vHPhT4RY_XIQL0WNNzH6LZm0-1LSiZrs4wOafjJX61Bu3NcGyKQBxvYv7hHWcTXGAarOSZL6xhmDeuPBWn3_3Xs99Nom8bk",
    stock: "IN STOCK",
    occasion: "Birthdays",
  },
  {
    id: "5",
    name: "Nắng Sớm",
    materials: "Cúc vàng, Cẩm chướng, Lá nho",
    price: 450000,
    originalPrice: 580000,
    discountPercent: 22,
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuABdmnB7oIBRIOGurGccYgibAqpdGjpg_wgyaHoA1RT7Gh5cdqGHmN4bm5FX5m9zzrBo5dpYeRPpoDheNQEuS2ETD-J3znizMGWxX_2XK0aL_cBf3W_yPuGkkYMHVYeKPH9nDaFu4wSXvFcDYfkLGzmk878yR2-oDj7Mp5vfj8fI_A_6LG4tHrF9GYA3s9f6Ib4iMgbUP_Gb6EvDfvHuKBnIp5mOF9XmuRL-Mu1j2zBVWKVU8O2I1tdBu9Ieg9lTzeicD6M4Upy6l8",
    stock: "LOW STOCK",
    occasion: "Weddings",
  },
  {
    id: "6",
    name: "Mẫu Đơn Lụa",
    materials: "Mẫu đơn, Ngải bạc, Bạch đàn",
    price: 720000,
    originalPrice: 900000,
    discountPercent: 20,
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCYDmsLMWFACA0R51yv4dgXbYDLJMZLk-iuqO7N5fG4AC9Dw2zZRBkwiS4I9kxb7R6PKrLE-YY32ZzEsE9wJybuGPWrSq649z9PGhdNxtyooI8g0aJJatQVmp44E2h2_u2s2inUz4-4noqpY2zeu-k9x0H1XXt0ubxphBE5fqezLqUn2NwFW59BO8s4NRJqjnMQUPs62eRF8rH3T9k00qBuB9ORwONK1ECh6qbXB_aTIthzw6SRmtZk4jNiCK0wBVk8VQXikwERgBM",
    stock: "IN STOCK",
    occasion: "Everyday",
  },
];
