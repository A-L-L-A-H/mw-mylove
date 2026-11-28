"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useState } from "react";
import { Button } from "@moonwitness/ui/components/button";
import { CloseIcon } from "@moonwitness/ui/icons/close";
import { MenuIcon } from "@moonwitness/ui/icons/menu";
import { SearchIcon } from "@moonwitness/ui/icons/search";
import { TrophyCrownIcon } from "@moonwitness/ui/icons/trophy-crown";
import { HomeIcon } from "@moonwitness/ui/icons/home";
import { GridIcon } from "@moonwitness/ui/icons/grid";
import { GlobeIcon } from "@moonwitness/ui/icons/globe";
import { BookOpenIcon } from "@moonwitness/ui/icons/book-open";
import { UsersIcon } from "@moonwitness/ui/icons/users";
import { InfoIcon } from "@moonwitness/ui/icons/info";
import { Input } from "@moonwitness/ui/components/input";
import { LanguageToggle } from "./language-toggle";
import type { Locale } from "./lib/locale";

const LABELS = {
  en: {
    home: "Home",
    worlds: "Nine Worlds",
    explore: "Explore",
    docs: "Docs",
    community: "Community",
    about: "About",
    search: "Search the Empire",
  },
  id: {
    home: "Beranda",
    worlds: "Sembilan Dunia",
    explore: "Jelajahi",
    docs: "Dokumentasi",
    community: "Komunitas",
    about: "Tentang",
    search: "Cari di Ekosistem",
  },
} as const;

export function SiteNavigation({ locale }: { locale: Locale }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const labels = LABELS[locale];
  const navItems = [
    { key: "home", href: "/", Icon: HomeIcon },
    { key: "worlds", href: "/worlds", Icon: GridIcon },
    { key: "explore", href: "/explore", Icon: GlobeIcon },
    { key: "docs", href: "/docs", Icon: BookOpenIcon },
    { key: "community", href: "/community", Icon: UsersIcon },
    { key: "about", href: "/about", Icon: InfoIcon },
  ] as const;

  return (
    <header
      className="site-header"
      onKeyDown={(event) => {
        if (event.key === "Escape" && menuOpen) {
          setMenuOpen(false);
          menuButtonRef.current?.focus();
        }
      }}
    >
      <a className="skip-link" href="#main">
        {locale === "en" ? "Skip to content" : "Lewati ke konten"}
      </a>
      <div className="site-header-inner">
        <Link className="site-brand" href="/" aria-label="A-L-L-A-H.COM home">
          <TrophyCrownIcon
            className="site-brand-crown"
            aria-hidden="true"
            size={28}
          />
          <span>
            A-L-L-A-H<span className="site-brand-dot">.COM</span>
          </span>
        </Link>
        <Button
          ref={menuButtonRef}
          className="mobile-menu-button"
          type="button"
          variant="outline"
          size="icon"
          aria-label={
            menuOpen
              ? locale === "en"
                ? "Close navigation"
                : "Tutup navigasi"
              : locale === "en"
                ? "Open navigation"
                : "Buka navigasi"
          }
          aria-expanded={menuOpen}
          aria-controls="primary-navigation"
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? (
            <CloseIcon aria-hidden="true" size={20} />
          ) : (
            <MenuIcon aria-hidden="true" size={20} />
          )}
        </Button>
        <nav
          id="primary-navigation"
          className={`primary-navigation${menuOpen ? " is-open" : ""}`}
          aria-label={locale === "en" ? "Primary navigation" : "Navigasi utama"}
        >
          {navItems.map(({ key, href, Icon }) => (
            <Link
              key={key}
              href={href}
              className={
                (
                  key === "home"
                    ? pathname === "/"
                    : key === "worlds"
                      ? pathname.startsWith("/worlds")
                      : pathname.startsWith(href)
                )
                  ? "is-active"
                  : undefined
              }
              aria-current={
                (
                  key === "home"
                    ? pathname === "/"
                    : key === "worlds"
                      ? pathname.startsWith("/worlds")
                      : pathname.startsWith(href)
                )
                  ? "page"
                  : undefined
              }
              onClick={() => setMenuOpen(false)}
            >
              <Icon aria-hidden="true" size={19} />
              <span>{labels[key]}</span>
            </Link>
          ))}
        </nav>
        <form action="/explore" className="nav-search">
          <label className="sr-only" htmlFor="nav-search-query">
            {labels.search}
          </label>
          <Input
            id="nav-search-query"
            name="q"
            type="search"
            placeholder={`${labels.search}…`}
          />
          <Button
            type="submit"
            variant="ghost"
            size="icon"
            aria-label={locale === "en" ? "Search" : "Cari"}
          >
            <SearchIcon aria-hidden="true" size={18} />
          </Button>
        </form>
        <div className="language-control">
          <GlobeIcon aria-hidden="true" size={21} />
          <LanguageToggle locale={locale} />
        </div>
      </div>
    </header>
  );
}
