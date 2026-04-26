export interface Category {
  id: string;
  name: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
}

export type CategoryInput = Omit<Category, "id" | "createdAt" | "updatedAt">;
