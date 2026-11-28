"use client";

import { useState } from "react";
import { Button } from "@moonwitness/ui/components/button";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@moonwitness/ui/components/alert";
import type { Locale } from "../lib/locale";

export function StorefrontActions({
  tier,
  locale,
}: {
  tier: string;
  locale: Locale;
}) {
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState("");
  const [error, setError] = useState(false);

  async function createIntent() {
    setBusy(true);
    setError(false);
    setResult("");
    try {
      const response = await fetch("/api/pricing/checkout-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier, currency: "IDR", paymentMethod: "QRIS" }),
      });
      const payload = (await response.json()) as {
        error?: string;
        intentId?: string;
        status?: string;
      };
      setError(!response.ok);
      setResult(
        payload.error ?? `${payload.intentId ?? ""} · ${payload.status ?? ""}`,
      );
    } catch {
      setError(true);
      setResult(
        locale === "id"
          ? "Permintaan checkout gagal."
          : "Checkout request failed.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="checkout-action">
      <Button
        type="button"
        variant="magenta"
        disabled={busy}
        onClick={() => void createIntent()}
      >
        {busy
          ? locale === "id"
            ? "Menyiapkan…"
            : "Preparing…"
          : locale === "id"
            ? "Buat QRIS"
            : "Create QRIS intent"}
      </Button>
      {result ? (
        error ? (
          <Alert variant="destructive">
            <AlertTitle>
              {locale === "id" ? "Checkout gagal" : "Checkout failed"}
            </AlertTitle>
            <AlertDescription>{result}</AlertDescription>
          </Alert>
        ) : (
          <p role="status">
            {locale === "id"
              ? "Intent pembayaran dibuat:"
              : "Payment intent created:"}{" "}
            {result}
          </p>
        )
      ) : null}
    </div>
  );
}
