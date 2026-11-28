export type PricingTierId = "free" | "starter" | "pro" | "enterprise";

export interface PricingTierQuotaLimits {
  readonly maxApps: number;
  readonly maxRamMb: number;
  readonly maxCustomDomains: number;
  readonly allowDedicatedMesh: boolean;
}

export interface PricingTierIncludedUsage {
  readonly containerHours: number;
  readonly ramGbHours: number;
  readonly storageGb: number;
  readonly egressGb: number;
}

export interface PricingTierOverageRatesCents {
  readonly containerHour: number;
  readonly ramGbHour: number;
  readonly storageGb: number;
  readonly egressGb: number;
}

export interface PricingTier {
  readonly tier: PricingTierId;
  readonly name: string;
  readonly summary: string;
  readonly monthlyUsd: number;
  readonly monthlyBaseCents: number;
  readonly included: PricingTierIncludedUsage;
  readonly overageCents: PricingTierOverageRatesCents;
  readonly quotaLimits: PricingTierQuotaLimits;
}

export interface PaasCatalogTemplate {
  readonly id: string;
  readonly name: string;
  readonly category: string;
  readonly description: string;
  readonly image: string;
  readonly minPlan: PricingTierId;
  readonly ports: readonly number[];
  readonly tags: readonly string[];
}
