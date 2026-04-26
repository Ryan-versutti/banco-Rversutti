import { listIncomesByMonth } from "./incomes.service";
import { listExpensesByMonth } from "./expenses.service";

export interface MonthSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  expensesByCategory: Array<{ categoryId: string; categoryName: string; total: number }>;
}

export async function getMonthSummary(year: number, month: number): Promise<MonthSummary> {
  const [incomes, expenses] = await Promise.all([
    listIncomesByMonth(year, month),
    listExpensesByMonth(year, month),
  ]);

  const totalIncome = incomes.reduce((acc, i) => acc + i.amount, 0);
  const totalExpense = expenses.reduce((acc, e) => acc + e.amount, 0);

  const byCategory = new Map<string, { categoryId: string; categoryName: string; total: number }>();
  for (const e of expenses) {
    const current = byCategory.get(e.categoryId);
    if (current) {
      current.total += e.amount;
    } else {
      byCategory.set(e.categoryId, {
        categoryId: e.categoryId,
        categoryName: e.categoryName,
        total: e.amount,
      });
    }
  }

  return {
    totalIncome,
    totalExpense,
    balance: totalIncome - totalExpense,
    expensesByCategory: Array.from(byCategory.values()).sort((a, b) => b.total - a.total),
  };
}
