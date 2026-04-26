"use client";

import { FormEvent, useEffect, useState } from "react";
import MonthFilter from "@/components/MonthFilter";
import { IconPlus, IconTrash } from "@/components/Icons";
import {
  createIncome,
  deleteIncome,
  listIncomesByMonth,
} from "@/services/incomes.service";
import { Income } from "@/types/income";
import { formatDateInput, parseDateInput } from "@/utils/date";
import { formatCurrency, formatDate } from "@/utils/format";

export default function IncomesPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [items, setItems] = useState<Income[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [receivedAt, setReceivedAt] = useState(formatDateInput(now));
  const [isRecurring, setIsRecurring] = useState(false);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setItems(await listIncomesByMonth(year, month));
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
    if (!name || !amount) return;
    setSaving(true);
    try {
      await createIncome({
        name,
        amount: Number(amount),
        receivedAt: parseDateInput(receivedAt),
        isRecurring,
      });
      setName("");
      setAmount("");
      setIsRecurring(false);
      await load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(id: string) {
    if (!confirm("Excluir esta receita?")) return;
    await deleteIncome(id);
    await load();
  }

  const total = items.reduce((acc, i) => acc + i.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold">Receitas</h1>
        <MonthFilter year={year} month={month} onChange={(y, m) => { setYear(y); setMonth(m); }} />
      </div>

      <form onSubmit={onSubmit} className="card grid gap-3 p-4 sm:grid-cols-5">
        <Field className="sm:col-span-2" label="Nome">
          <input
            required
            placeholder="Ex: Salário"
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
        <Field label="Recebido em">
          <input
            type="date"
            value={receivedAt}
            onChange={(e) => setReceivedAt(e.target.value)}
            className="input w-full"
          />
        </Field>
        <label className="flex items-center gap-2 self-end pb-2 text-sm">
          <input
            type="checkbox"
            checked={isRecurring}
            onChange={(e) => setIsRecurring(e.target.checked)}
            className="h-4 w-4 accent-brand-600"
          />
          Recorrente
        </label>
        <button type="submit" disabled={saving} className="btn-primary sm:col-span-5">
          <IconPlus />
          {saving ? "Salvando..." : "Adicionar receita"}
        </button>
      </form>

      {error && (
        <p className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
          {error}
        </p>
      )}

      <section>
        <div className="mb-2 flex justify-between text-sm">
          <span className="muted">{loading ? "Carregando..." : `${items.length} item(s)`}</span>
          <span className="font-medium">
            Total: <span className="text-brand-700 dark:text-brand-400">{formatCurrency(total)}</span>
          </span>
        </div>
        <ul className="card divide-y divide-neutral-200 dark:divide-neutral-800">
          {items.map((i) => (
            <li key={i.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
              <div>
                <p className="font-medium">{i.name}</p>
                <p className="text-xs muted">
                  {formatDate(i.receivedAt)}
                  {i.isRecurring && " · recorrente"}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-semibold text-brand-700 dark:text-brand-400">
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
          {!loading && items.length === 0 && (
            <li className="px-4 py-3 text-sm muted">Nenhuma receita neste mês.</li>
          )}
        </ul>
      </section>
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
