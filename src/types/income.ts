export interface Income {
  id: string;
  name: string;
  amount: number;
  receivedAt: Date;
  isRecurring: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type IncomeInput = Omit<Income, "id" | "createdAt" | "updatedAt">;
