import { api } from "@/lib/api";

export interface Category { id: string; name: string }
export const getCategories = () => api<Category[]>("/api/categories");
