"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import SearchBar from "./SearchBar";
import { AccountIcon, CloseIcon, Logo, MenuIcon, SearchIcon } from "./icons";

const NAV = [
  { label: "Home", href: "/" },
  { label: "Videos", href: "/videos" },
  { label: "Categories", href: "/categories" },
  { label: "Pornstars", href: "/pornstars" },
  { label: "Channels", href: "/channels" },
  { label: "Tags", href: "/tags" },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // lock body scroll while the mobile drawer is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const iconBtn =
    "grid h-9 w-9 place-items-center rounded-full text-mute-300 ring-1 ring-white/[0.07] transition-colors hover:bg-white/[0.07] hover:text-white";

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-ink-950/82 backdrop-blur-xl">
        {/* ================= DESKTOP ================= */}
        <div className="mx-auto hidden h-16 max-w-[1500px] items-center gap-6 px-5 md:flex">
          {/* left: logo */}
          <Link href="/" aria-label="vidubuzz home" className="shrink-0">
            <Logo />
          </Link>

          {/* center: search */}
          <div className="mx-auto w-full max-w-xl">
            <SearchBar />
          </div>

          {/* right: account + menu */}
          <div className="flex shrink-0 items-center gap-2">
            <Link href="/account" aria-label="Account" className={iconBtn}>
              <AccountIcon className="h-[19px] w-[19px]" />
            </Link>
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              aria-expanded={menuOpen}
              className={iconBtn}
            >
              <MenuIcon className="h-[19px] w-[19px]" />
            </button>
          </div>
        </div>

        {/* ================= MOBILE ================= */}
        <div className="flex h-14 items-center justify-between px-3 md:hidden">
          {/* left: menu */}
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            aria-expanded={menuOpen}
            className={iconBtn}
          >
            <MenuIcon className="h-[19px] w-[19px]" />
          </button>

          {/* center: logo */}
          <Link href="/" aria-label="vidubuzz home" className="absolute left-1/2 -translate-x-1/2">
            <Logo />
          </Link>

          {/* right: search + account */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setSearchOpen((v) => !v)}
              aria-label="Search"
              aria-expanded={searchOpen}
              className={iconBtn}
            >
              {searchOpen ? <CloseIcon className="h-[19px] w-[19px]" /> : <SearchIcon className="h-[19px] w-[19px]" />}
            </button>
            <Link href="/account" aria-label="Account" className={iconBtn}>
              <AccountIcon className="h-[19px] w-[19px]" />
            </Link>
          </div>
        </div>

        {/* mobile: expanding search row */}
        {searchOpen && (
          <div className="vb-fade-in border-t border-white/[0.06] px-3 py-2.5 md:hidden">
            <SearchBar autoFocus onDone={() => setSearchOpen(false)} />
          </div>
        )}
      </header>

      {/* ================= SLIDE-OVER MENU (both breakpoints) ================= */}
      {menuOpen && (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Site menu">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
            className="absolute inset-0 bg-black/65 backdrop-blur-sm"
          />
          <nav className="vb-fade-in absolute right-0 top-0 flex h-full w-[278px] flex-col gap-1 border-l border-white/[0.07] bg-ink-900 p-4 shadow-2xl">
            <div className="mb-3 flex items-center justify-between">
              <Logo />
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                aria-label="Close menu"
                className={iconBtn}
              >
                <CloseIcon className="h-[19px] w-[19px]" />
              </button>
            </div>
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="rounded-xl px-3 py-2.5 text-[14px] text-mute-300 transition-colors hover:bg-white/[0.06] hover:text-white"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/account"
              onClick={() => setMenuOpen(false)}
              className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-accent-500 px-3 py-2.5 text-[13.5px] font-semibold text-white transition-opacity hover:opacity-90"
            >
              <AccountIcon className="h-[17px] w-[17px]" />
              Sign in
            </Link>
          </nav>
        </div>
      )}
    </>
  );
}
