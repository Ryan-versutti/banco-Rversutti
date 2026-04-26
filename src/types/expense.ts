export type PaymentMethod =
  | "pix"
  | "debit"
  | "credit"
  | "cash"
  | "transfer"
  | "boleto"
  | "other";

export interface Expense {
  id: string;
  name: string;
  amount: number;
  categoryId: string;
  categoryName: string;
  spentAt: Date;
  paymentMethod: PaymentMethod;
  isRecurring: boolean;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type ExpenseInput = Omit<Expense, "id" | "createdAt" | "updatedAt">;
