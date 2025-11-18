"use client";

import Link from "next/link";
import Image from "next/image";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-10 w-full border-b border-zinc-200 bg-white/80 backdrop-blur-xl dark:border-zinc-800 dark:bg-black/50">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <div className="flex items-center gap-3">
          <Image src="/icon.svg" alt="TOON converter logo" width={28} height={28} priority />
          <span className="text-base font-semibold tracking-tight">TOON Converter</span>
        </div>
        <nav className="flex items-center gap-6 text-sm" aria-label="Main navigation">
          <Link href="/" className="font-medium transition-colors hover:text-zinc-600 dark:hover:text-zinc-300">
            JSON to TOON
          </Link>
          <Link href="/toon-to-json" className="font-medium transition-colors hover:text-zinc-600 dark:hover:text-zinc-300">
            TOON to JSON
          </Link>
          <Link href="/#faq" className="font-medium transition-colors hover:text-zinc-600 dark:hover:text-zinc-300">
            FAQ
          </Link>
        </nav>
      </div>
    </header>
  );
}
