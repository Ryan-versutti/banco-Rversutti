"use client";

import { usePathname } from "next/navigation";
import Navigation from "./Navigation";
import { useAuth } from "./AuthProvider";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const showNav = !!user && pathname !== "/login";

  return (
    <>
      {showNav && <Navigation />}
      <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
    </>
  );
}
