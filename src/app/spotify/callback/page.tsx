"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { completeAuthFlow, SpotifyAuthError } from "@/lib/spotify/auth";
import { loadClientId } from "@/lib/spotify/config";

function CallbackInner() {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const code = params.get("code");
    const state = params.get("state");
    const authError = params.get("error");
    const clientId = loadClientId();

    if (authError) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setError(`Spotify said: ${authError}`);
      return;
    }
    if (!code || !state || !clientId) {
      setError("Missing login details. Please try connecting again.");
      return;
    }

    completeAuthFlow(clientId, code, state)
      .then(() => router.replace("/spotify"))
      .catch((err) => {
        setError(err instanceof SpotifyAuthError ? err.message : "Login failed.");
      });
  }, [params, router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
      {error ? (
        <>
          <p className="text-red-400">{error}</p>
          <a href="/spotify" className="text-sm text-[var(--text-secondary)] underline underline-offset-2">
            Back to Spotify panel
          </a>
        </>
      ) : (
        <p className="text-[var(--text-secondary)]">Connecting to Spotify…</p>
      )}
    </div>
  );
}

export default function SpotifyCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-[var(--text-secondary)]">
          Connecting to Spotify…
        </div>
      }
    >
      <CallbackInner />
    </Suspense>
  );
}
