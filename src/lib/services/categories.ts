import { api, type ErrorMessages } from "@/lib/api";

export interface Category {
  id: string;
  name: string;
}

export const getCategories = (errors?: ErrorMessages) => api<Category[]>("/api/categories", { errors });
