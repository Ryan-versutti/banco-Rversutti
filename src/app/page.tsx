"use client";

import { useEffect, useState } from "react";
import MonthFilter from "@/components/MonthFilter";
import { IconArrowDown, IconArrowUp, IconWallet } from "@/components/Icons";
import { getMonthSummary, MonthSummary } from "@/services/summary.service";
import { formatCurrency } from "@/utils/format";

export default function DashboardPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [summary, setSummary] = useState<MonthSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getMonthSummary(year, month)
      .then((s) => {
        if (!cancelled) setSummary(s);
      })
      .catch((e) => {
        if (!cancelled) setError(e?.message ?? "Erro ao carregar resumo");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [year, month]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold">Resumo do mês</h1>
        <MonthFilter
          year={year}
          month={month}
          onChange={(y, m) => {
            setYear(y);
            setMonth(m);
          }}
        />
      </div>

      {error && (
        <p className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
          {error}
        </p>
      )}
      {loading && <p className="text-sm muted">Carregando...</p>}

      {summary && (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <Card
              icon={<IconArrowUp className="h-5 w-5" />}
              label="Receitas"
              value={formatCurrency(summary.totalIncome)}
              tone="positive"
            />
            <Card
              icon={<IconArrowDown className="h-5 w-5" />}
              label="Despesas"
              value={formatCurrency(summary.totalExpense)}
              tone="negative"
            />
            <Card
              icon={<IconWallet className="h-5 w-5" />}
              label="Saldo"
              value={formatCurrency(summary.balance)}
              tone={summary.balance >= 0 ? "positive" : "negative"}
            />
          </div>

          <section>
            <h2 className="mb-3 text-lg font-semibold">Por categoria</h2>
            {summary.expensesByCategory.length === 0 ? (
              <p className="text-sm muted">Nenhuma despesa neste mês.</p>
            ) : (
              <ul className="card divide-y divide-neutral-200 dark:divide-neutral-800">
                {summary.expensesByCategory.map((c) => (
                  <li key={c.categoryId} className="flex justify-between px-4 py-3 text-sm">
                    <span>{c.categoryName}</span>
                    <span className="font-medium">{formatCurrency(c.total)}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  );
}

function Card({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone: "positive" | "negative";
}) {
  const color =
    tone === "positive"
      ? "text-brand-600 dark:text-brand-400"
      : "text-red-600 dark:text-red-400";
  const ring =
    tone === "positive"
      ? "bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300"
      : "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300";
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-wide muted">{label}</p>
        <span className={`flex h-8 w-8 items-center justify-center rounded-full ${ring}`}>
          {icon}
        </span>
      </div>
      <p className={`mt-2 text-2xl font-semibold ${color}`}>{value}</p>
    </div>
  );
}
