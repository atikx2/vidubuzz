"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, Search, User } from "lucide-react";

import SearchBar from "./SearchBar";
import { Logo } from "./icons";
import { Button } from "./ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";

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

  const menu = (
    <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Open menu" className="ring-1 ring-border">
          <Menu className="size-[19px]" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle asChild>
            <span>
              <Logo />
            </span>
          </SheetTitle>
          <SheetDescription className="sr-only">Site navigation</SheetDescription>
        </SheetHeader>

        <nav className="flex flex-col gap-1">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className="rounded-xl px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-white/[0.06] hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <Button asChild className="mt-3">
          <Link href="/account" onClick={() => setMenuOpen(false)}>
            <User className="size-[17px]" />
            Sign in
          </Link>
        </Button>
      </SheetContent>
    </Sheet>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/82 backdrop-blur-xl">
      {/* ======================= DESKTOP ======================= */}
      <div className="mx-auto hidden h-16 max-w-[1500px] items-center gap-6 px-5 md:flex">
        <Link href="/" aria-label="vidubuzz home" className="shrink-0">
          <Logo />
        </Link>

        <div className="mx-auto w-full max-w-xl">
          <SearchBar />
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Button
            asChild
            variant="ghost"
            size="icon"
            aria-label="Account"
            className="ring-1 ring-border"
          >
            <Link href="/account">
              <User className="size-[19px]" />
            </Link>
          </Button>
          {menu}
        </div>
      </div>

      {/* ======================= MOBILE ======================= */}
      <div className="relative flex h-14 items-center justify-between px-3 md:hidden">
        {menu}

        <Link
          href="/"
          aria-label="vidubuzz home"
          className="absolute left-1/2 -translate-x-1/2"
        >
          <Logo />
        </Link>

        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Search"
            aria-expanded={searchOpen}
            onClick={() => setSearchOpen((v) => !v)}
            className="ring-1 ring-border"
          >
            <Search className="size-[19px]" />
          </Button>
          <Button
            asChild
            variant="ghost"
            size="icon"
            aria-label="Account"
            className="ring-1 ring-border"
          >
            <Link href="/account">
              <User className="size-[19px]" />
            </Link>
          </Button>
        </div>
      </div>

      {/* mobile: expanding search row */}
      <AnimatePresence initial={false}>
        {searchOpen && (
          <motion.div
            key="mobile-search"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t border-border md:hidden"
          >
            <div className="px-3 py-2.5">
              <SearchBar autoFocus onDone={() => setSearchOpen(false)} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
