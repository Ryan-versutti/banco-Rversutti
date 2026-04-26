"use client";

import Image from "next/image";
import { useState } from "react";
import { GoogleIcon } from "@/components/GoogleIcon";
import { signInWithGoogle } from "@/services/auth.service";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onGoogleLogin() {
    setLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
    } catch (e) {
      const code = (e as { code?: string }).code;
      if (code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request") {
        setError(null);
      } else {
        setError((e as Error).message ?? "Erro ao entrar");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="card w-full max-w-md p-8 text-center">
        <div className="mb-6 flex justify-center">
          <Image
            src="/logo-rversutti.png"
            alt="Banco do Rversutti"
            width={72}
            height={72}
            priority
          />
        </div>
        <h1 className="text-2xl font-semibold">Banco do Rversutti</h1>
        <p className="mt-2 text-sm muted">Entre com sua conta Google para continuar.</p>

        <button
          onClick={onGoogleLogin}
          disabled={loading}
          className="btn-secondary mt-6 w-full"
        >
          <GoogleIcon />
          {loading ? "Entrando..." : "Entrar com Google"}
        </button>

        {error && (
          <p className="mt-4 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
