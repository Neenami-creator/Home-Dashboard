"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock } from "lucide-react";

function UnlockForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error ?? "Wrong PIN.");
      }
      router.replace(params.get("next") || "/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wrong PIN.");
      setPin("");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[var(--border)] text-[var(--text-secondary)]">
        <Lock size={22} />
      </div>
      <div className="text-center">
        <h1 className="font-display text-2xl font-semibold">Home Dashboard</h1>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">Enter the PIN to continue</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col items-center gap-4">
        <input
          type="password"
          inputMode="numeric"
          autoFocus
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          className="w-48 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-center text-2xl tracking-[0.3em] text-[var(--foreground)]"
        />
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={submitting || pin.length === 0}
          className="w-48 rounded-xl bg-[var(--foreground)] py-2.5 font-medium text-[var(--background)] transition disabled:opacity-40"
        >
          {submitting ? "Checking…" : "Unlock"}
        </button>
      </form>
    </div>
  );
}

export default function UnlockPage() {
  return (
    <Suspense fallback={null}>
      <UnlockForm />
    </Suspense>
  );
}
