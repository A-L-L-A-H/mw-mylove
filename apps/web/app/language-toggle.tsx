"use client";

import { useRouter } from "next/navigation";
import { Button } from "@moonwitness/ui/components/button";
import type { Locale } from "./lib/locale";

export function LanguageToggle({ locale }: { locale: Locale }) {
  const router = useRouter();

  function setLocale(nextLocale: Locale) {
    document.cookie = `mw_locale=${nextLocale}; Path=/; Max-Age=31536000; SameSite=Lax`;
    router.refresh();
  }

  const nextLocale = locale === "en" ? "id" : "en";

  return (
    <div className="language-toggle" aria-label="Choose language">
      <Button
        type="button"
        variant="ghost"
        size="xs"
        aria-label={`Switch language to ${nextLocale === "en" ? "English" : "Indonesian"}`}
        onClick={() => setLocale(nextLocale)}
      >
        {locale.toUpperCase()} <span aria-hidden="true">⌄</span>
      </Button>
    </div>
  );
}
