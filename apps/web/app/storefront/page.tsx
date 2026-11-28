import type { Metadata } from "next";
import Link from "next/link";
import { Card } from "@moonwitness/ui/components/card";
import { PageHeader } from "@moonwitness/ui/components/page-header";
import { Button } from "@moonwitness/ui/components/button";
import { dispatchPortalRequest } from "../lib/portal-handler";
import { getLocale } from "../lib/locale";
import { StorefrontActions } from "./storefront-actions";

export const metadata: Metadata = { title: "Storefront" };
export const dynamic = "force-dynamic";

interface PricingPayload {
  currency: "USD" | "IDR";
  fxRateIdrPerUsd: number;
  tiers: Array<{
    tier: string;
    name: string;
    summary: string;
    displayPrice: string;
  }>;
  paymentMethods: string[];
  compliance: string[];
}

interface CatalogPayload {
  status: string;
  templates: Array<{
    id: string;
    name: string;
    category: string;
    description: string;
    minPlan: string;
  }>;
  message?: string;
}

async function getJson<T>(path: string): Promise<T | null> {
  try {
    const response = await dispatchPortalRequest(
      new Request(`http://localhost${path}`),
    );
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

export default async function StorefrontPage({
  searchParams,
}: {
  searchParams: Promise<{ currency?: string }>;
}) {
  const [locale, params] = await Promise.all([getLocale(), searchParams]);
  const currency = params.currency === "IDR" ? "IDR" : "USD";
  const [pricing, catalog] = await Promise.all([
    getJson<PricingPayload>(`/pricing?currency=${currency}`),
    getJson<CatalogPayload>("/paas/catalog"),
  ]);
  const id = locale === "id";
  return (
    <main id="main" className="page-shell content-page">
      <PageHeader
        className="content-page-header"
        title={id ? "Storefront MoonWitness" : "MoonWitness Storefront"}
        description={
          id
            ? "Harga dan katalog layanan mengikuti data yang tersedia dari backend."
            : "Pricing and catalog entries reflect the data available from the backend."
        }
        headingLevel={1}
        actions={
          <Button asChild variant="outline">
            <Link href="/system-status">
              {id ? "Status layanan" : "Service status"}
            </Link>
          </Button>
        }
      />
      <section aria-labelledby="plans-title">
        <div className="section-heading-row">
          <h2 className="section-title" id="plans-title">
            {id ? "Paket bulanan" : "Monthly plans"}
          </h2>
          <div className="field-actions">
            <Link
              className="section-link"
              href="/storefront?currency=USD"
              aria-current={currency === "USD" ? "page" : undefined}
            >
              USD ($)
            </Link>
            <Link
              className="section-link"
              href="/storefront?currency=IDR"
              aria-current={currency === "IDR" ? "page" : undefined}
            >
              IDR (Rp)
            </Link>
          </div>
        </div>
        {pricing ? (
          <div className="price-grid">
            {pricing.tiers.map((tier) => (
              <Card
                key={tier.tier}
                className="content-panel price-card"
                padding="md"
              >
                <h3>{tier.name}</h3>
                <p className="price-value">
                  {tier.displayPrice}
                  <span> / {id ? "bln" : "mo"}</span>
                </p>
                <p>{tier.summary}</p>
                {tier.tier === "free" ? null : (
                  <StorefrontActions tier={tier.tier} locale={locale} />
                )}
              </Card>
            ))}
          </div>
        ) : (
          <p role="status">
            {id ? "Data harga belum tersedia." : "Pricing data is unavailable."}
          </p>
        )}
      </section>
      <section className="storefront-catalog" aria-labelledby="catalog-title">
        <div className="section-heading-row">
          <h2 className="section-title" id="catalog-title">
            {id ? "Katalog PaaS" : "PaaS catalog"}
          </h2>
          <Link className="section-link" href="/paas/catalog">
            {id ? "Buka data katalog" : "Open catalog data"}
          </Link>
        </div>
        {catalog?.templates?.length ? (
          <ul className="catalog-list">
            {catalog.templates.map((template) => (
              <li className="catalog-row" key={template.id}>
                <div>
                  <strong>{template.name}</strong>
                  <p>{template.description}</p>
                </div>
                <span>
                  {template.category} · {template.minPlan}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p role="status">
            {id
              ? "Katalog belum tersedia dari upstream."
              : "Catalog data is unavailable from the upstream service."}
          </p>
        )}
      </section>
    </main>
  );
}
