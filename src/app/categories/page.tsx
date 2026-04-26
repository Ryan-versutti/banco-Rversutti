"use client";

import { FormEvent, useEffect, useState } from "react";
import { IconPlus, IconTrash } from "@/components/Icons";
import {
  createCategory,
  deleteCategory,
  listCategories,
} from "@/services/categories.service";
import { Category } from "@/types/category";

export default function CategoriesPage() {
  const [items, setItems] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setItems(await listCategories());
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      await createCategory({ name: name.trim() });
      setName("");
      await load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(id: string) {
    if (!confirm("Excluir esta categoria? Despesas existentes mantêm o nome registrado.")) return;
    await deleteCategory(id);
    await load();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Categorias</h1>

      <form onSubmit={onSubmit} className="card flex gap-2 p-4">
        <input
          required
          placeholder="Nome da categoria (ex: Alimentação)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="input flex-1"
        />
        <button type="submit" disabled={saving} className="btn-primary">
          <IconPlus />
          {saving ? "Salvando..." : "Adicionar"}
        </button>
      </form>

      {error && (
        <p className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
          {error}
        </p>
      )}

      <ul className="card divide-y divide-neutral-200 dark:divide-neutral-800">
        {items.map((c) => (
          <li key={c.id} className="flex items-center justify-between px-4 py-3 text-sm">
            <div>
              <p className="font-medium">{c.name}</p>
              <p className="text-xs muted">{c.slug}</p>
            </div>
            <button
              onClick={() => onDelete(c.id)}
              aria-label="Excluir"
              title="Excluir"
              className="btn-danger px-2 py-1.5"
            >
              <IconTrash />
            </button>
          </li>
        ))}
        {!loading && items.length === 0 && (
          <li className="px-4 py-3 text-sm muted">Nenhuma categoria cadastrada.</li>
        )}
      </ul>
    </div>
  );
}
