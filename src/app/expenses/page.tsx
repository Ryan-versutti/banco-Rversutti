"use client";

import { FormEvent, useEffect, useState } from "react";
import MonthFilter from "@/components/MonthFilter";
import { IconPlus, IconTrash } from "@/components/Icons";
import {
  createExpense,
  deleteExpense,
  listExpensesByMonth,
} from "@/services/expenses.service";
import { listCategories } from "@/services/categories.service";
import { Expense, PaymentMethod } from "@/types/expense";
import { Category } from "@/types/category";
import { formatDateInput, parseDateInput } from "@/utils/date";
import { formatCurrency, formatDate } from "@/utils/format";

const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: "pix", label: "Pix" },
  { value: "debit", label: "Débito" },
  { value: "credit", label: "Crédito" },
  { value: "cash", label: "Dinheiro" },
  { value: "transfer", label: "Transferência" },
  { value: "boleto", label: "Boleto" },
  { value: "other", label: "Outro" },
];

export default function ExpensesPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [items, setItems] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filterCategory, setFilterCategory] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [spentAt, setSpentAt] = useState(formatDateInput(now));
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("pix");
  const [isRecurring, setIsRecurring] = useState(false);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [list, cats] = await Promise.all([
        listExpensesByMonth(year, month),
        listCategories(),
      ]);
      setItems(list);
      setCategories(cats);
      if (!categoryId && cats.length > 0) setCategoryId(cats[0].id);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [year, month]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name || !amount || !categoryId) return;
    const cat = categories.find((c) => c.id === categoryId);
    if (!cat) return;
    setSaving(true);
    try {
      await createExpense({
        name,
        amount: Number(amount),
        categoryId: cat.id,
        categoryName: cat.name,
        spentAt: parseDateInput(spentAt),
        paymentMethod,
        isRecurring,
        notes: notes || undefined,
      });
      setName("");
      setAmount("");
      setNotes("");
      setIsRecurring(false);
      await load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(id: string) {
    if (!confirm("Excluir esta despesa?")) return;
    await deleteExpense(id);
    await load();
  }

  const visible = filterCategory ? items.filter((i) => i.categoryId === filterCategory) : items;
  const total = visible.reduce((acc, i) => acc + i.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold">Despesas</h1>
        <MonthFilter year={year} month={month} onChange={(y, m) => { setYear(y); setMonth(m); }} />
      </div>

      {categories.length === 0 ? (
        <p className="rounded-lg border border-yellow-300 bg-yellow-50 p-3 text-sm text-yellow-800 dark:border-yellow-900 dark:bg-yellow-950/30 dark:text-yellow-200">
          Crie uma categoria antes de cadastrar despesas.
        </p>
      ) : (
        <form onSubmit={onSubmit} className="card grid gap-3 p-4 sm:grid-cols-6">
          <Field className="sm:col-span-2" label="Descrição">
            <input
              required
              placeholder="Ex: Supermercado"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input w-full"
            />
          </Field>
          <Field label="Valor (R$)">
            <input
              required
              type="number"
              step="0.01"
              placeholder="0,00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="input w-full"
            />
          </Field>
          <Field label="Categoria">
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="input w-full"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Data">
            <input
              type="date"
              value={spentAt}
              onChange={(e) => setSpentAt(e.target.value)}
              className="input w-full"
            />
          </Field>
          <Field label="Pagamento">
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
              className="input w-full"
            >
              {PAYMENT_METHODS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </Field>
          <Field className="sm:col-span-4" label="Observações (opcional)">
            <input
              placeholder="Anotações"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="input w-full"
            />
          </Field>
          <label className="flex items-center gap-2 self-end pb-2 text-sm sm:col-span-2">
            <input
              type="checkbox"
              checked={isRecurring}
              onChange={(e) => setIsRecurring(e.target.checked)}
              className="h-4 w-4 accent-brand-600"
            />
            Recorrente
          </label>
          <button type="submit" disabled={saving} className="btn-primary sm:col-span-6">
            <IconPlus />
            {saving ? "Salvando..." : "Adicionar despesa"}
          </button>
        </form>
      )}

      {error && (
        <p className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
          {error}
        </p>
      )}

      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm">
          <span className="muted">Categoria:</span>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="input"
          >
            <option value="">Todas</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <span className="text-sm font-medium">
          Total: <span className="text-red-600 dark:text-red-400">{formatCurrency(total)}</span>
        </span>
      </div>

      <ul className="card divide-y divide-neutral-200 dark:divide-neutral-800">
        {visible.map((i) => (
          <li key={i.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
            <div>
              <p className="font-medium">{i.name}</p>
              <p className="text-xs muted">
                {formatDate(i.spentAt)} · {i.categoryName} · {i.paymentMethod}
                {i.isRecurring && " · recorrente"}
              </p>
              {i.notes && <p className="text-xs muted">{i.notes}</p>}
            </div>
            <div className="flex items-center gap-3">
              <span className="font-semibold text-red-600 dark:text-red-400">
                {formatCurrency(i.amount)}
              </span>
              <button
                onClick={() => onDelete(i.id)}
                aria-label="Excluir"
                title="Excluir"
                className="btn-danger px-2 py-1.5"
              >
                <IconTrash />
              </button>
            </div>
          </li>
        ))}
        {!loading && visible.length === 0 && (
          <li className="px-4 py-3 text-sm muted">Nenhuma despesa neste filtro.</li>
        )}
      </ul>
    </div>
  );
}

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`flex flex-col gap-1 text-xs muted ${className}`}>
      {label}
      {children}
    </label>
  );
}
