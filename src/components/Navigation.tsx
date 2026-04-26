"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "./AuthProvider";
import { useTheme } from "./ThemeProvider";
import {
  IconArrowDown,
  IconArrowUp,
  IconHome,
  IconLogout,
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
  const { user, signOut } = useAuth();

  return (
    <nav className="sticky top-0 z-30 border-b border-neutral-200 bg-white/80 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/80">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo-rversutti.png"
            alt="Banco do Rversutti"
            width={36}
            height={36}
            priority
          />
          <span className="hidden font-semibold tracking-tight sm:inline">
            Banco do Rversutti
          </span>
        </Link>

        <ul className="hidden gap-1 text-sm md:flex">
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

        <div className="flex items-center gap-2">
          {user && (
            <div className="hidden items-center gap-2 sm:flex">
              {user.photoURL ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.photoURL}
                  alt={user.name ?? "Usuário"}
                  className="h-8 w-8 rounded-full border border-neutral-200 dark:border-neutral-700"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700 dark:bg-brand-900 dark:text-brand-300">
                  {(user.name ?? user.email ?? "?").charAt(0).toUpperCase()}
                </div>
              )}
              <span className="max-w-[140px] truncate text-sm muted" title={user.email ?? ""}>
                {user.name ?? user.email}
              </span>
            </div>
          )}

          <button
            onClick={toggle}
            aria-label={theme === "dark" ? "Tema claro" : "Tema escuro"}
            title={theme === "dark" ? "Tema claro" : "Tema escuro"}
            className="icon-btn"
          >
            {theme === "dark" ? <IconSun /> : <IconMoon />}
          </button>

          {user && (
            <button
              onClick={signOut}
              aria-label="Sair"
              title="Sair"
              className="icon-btn"
            >
              <IconLogout />
            </button>
          )}
        </div>
      </div>

      <ul className="flex gap-1 border-t border-neutral-200 px-4 py-2 text-sm dark:border-neutral-800 md:hidden">
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
