import type { Metadata } from "next";
import "@moonwitness/ui/styles/tokens.css";
import "@moonwitness/ui/components.css";
import "@moonwitness/ui/styles/visual-universe.css";
import "@moonwitness/assets/fonts.css";
import "./globals.css";
import "./hero.css";
import "./content.css";
import "./responsive.css";
import "./navigation.css";
import "./front-page.css";
import "./front-worlds.css";
import "./front-page-responsive.css";
import "./worlds-atlas.css";
import "./world-detail.css";
import "./destinations.css";
import { getLocale } from "./lib/locale";
import { SiteNavigation } from "./site-navigation";

export const metadata: Metadata = {
  title: {
    default: "A-L-L-A-H.COM | Empire of Light",
    template: "%s | A-L-L-A-H.COM",
  },
  description:
    "A universe of knowledge, stories, and shared discovery across the MoonWitness ecosystem.",
  metadataBase: new URL(
    process.env.MW_PUBLIC_ORIGIN ?? "https://a-l-l-a-h.com",
  ),
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const locale = await getLocale();

  return (
    <html lang={locale} data-theme="dark" data-skin="moonwitness-riot">
      <body>
        <SiteNavigation locale={locale} />
        {children}
        <footer className="site-footer">
          <div className="site-footer-inner">
            <span className="footer-brand">A-L-L-A-H.COM</span>
            <span>
              {locale === "en" ? "Empire of Light" : "Kekaisaran Cahaya"}
            </span>
            <span className="footer-compliance">CAN-0011..0014 · ADR-0005</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
