"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "./ThemeProvider";
import {
  IconArrowDown,
  IconArrowUp,
  IconHome,
  IconMoon,
  IconSun,
  IconTag,
} from "./Icons";

const links = [
  { href: "/", label: "Resumo", icon: IconHome },
  { href: "/incomes", label: "Receitas", icon: IconArrowUp },
  { href: "/expenses", label: "Despesas", icon: IconArrowDown },
  { href: "/categories", label: "Categorias", icon: IconTag },
];

export default function Navigation() {
  const pathname = usePathname();
  const { theme, toggle } = useTheme();

  return (
    <nav className="sticky top-0 z-30 border-b border-neutral-200 bg-white/80 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/80">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-6 px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo-rversutti.png"
            alt="Banco do Rversutti"
            width={36}
            height={36}
            priority
          />
          <span className="font-semibold tracking-tight">Banco do Rversutti</span>
        </Link>

        <ul className="hidden gap-1 text-sm sm:flex">
          {links.map((l) => {
            const active = pathname === l.href;
            const Icon = l.icon;
            return (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 transition ${
                    active
                      ? "bg-brand-600 text-white shadow-sm dark:bg-brand-500"
                      : "text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
                  }`}
                >
                  <Icon />
                  {l.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <button
          onClick={toggle}
          aria-label={theme === "dark" ? "Mudar para tema claro" : "Mudar para tema escuro"}
          title={theme === "dark" ? "Tema claro" : "Tema escuro"}
          className="icon-btn"
        >
          {theme === "dark" ? <IconSun /> : <IconMoon />}
        </button>
      </div>

      <ul className="flex gap-1 border-t border-neutral-200 px-4 py-2 text-sm dark:border-neutral-800 sm:hidden">
        {links.map((l) => {
          const active = pathname === l.href;
          const Icon = l.icon;
          return (
            <li key={l.href} className="flex-1">
              <Link
                href={l.href}
                className={`flex flex-col items-center gap-0.5 rounded-lg px-2 py-1.5 text-xs transition ${
                  active
                    ? "bg-brand-600 text-white dark:bg-brand-500"
                    : "text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
                }`}
              >
                <Icon />
                {l.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
