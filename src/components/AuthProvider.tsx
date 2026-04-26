"use client";

import { usePathname, useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";
import { AuthUser, signOut as svcSignOut, watchAuth } from "@/services/auth.service";

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const PUBLIC_ROUTES = new Set(["/login"]);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = watchAuth((u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (loading) return;
    const isPublic = PUBLIC_ROUTES.has(pathname);
    if (!user && !isPublic) {
      router.replace("/login");
    } else if (user && isPublic) {
      router.replace("/");
    }
  }, [user, loading, pathname, router]);

  async function signOut() {
    await svcSignOut();
    router.replace("/login");
  }

  const isPublic = PUBLIC_ROUTES.has(pathname);
  const blocked = loading || (!user && !isPublic) || (user && isPublic);

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {blocked ? <FullscreenLoader /> : children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

function FullscreenLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
    </div>
  );
}
