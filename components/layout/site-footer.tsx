"use client";

import Link from "next/link";
import Image from "next/image";

export function SiteFooter() {
  return (
    <footer className="border-t border-zinc-200 bg-white/50 dark:border-zinc-800 dark:bg-zinc-950/30">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-8 text-sm text-zinc-600 dark:text-zinc-400 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-4">
          <Image src="/icon.svg" alt="TOON converter logo" width={24} height={24} />
          <div>
            <p className="text-base font-bold text-zinc-900 dark:text-zinc-50">TOON Converter</p>
            <p className="text-xs font-medium uppercase tracking-wider">All in-browser · Privacy-first</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-10">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
              Quick links
            </p>
            <div className="mt-2 flex flex-col gap-2 text-sm">
              <Link href="/" className="hover:underline">
                JSON to TOON
              </Link>
              <Link href="/toon-to-json" className="hover:underline">
                TOON to JSON
              </Link>
              <Link href="/xml-to-toon" className="hover:underline">
                XML to TOON
              </Link>
              <Link href="/#faq" className="hover:underline">
                FAQ
              </Link>
            </div>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
              Resources
            </p>
            <div className="mt-2 flex flex-col gap-2 text-sm">
              <a href="https://github.com/toon-format/toon" target="_blank" rel="noreferrer" className="hover:underline">
                TOON Spec
              </a>
              <a href="https://github.com/niieani/gpt-tokenizer" target="_blank" rel="noreferrer" className="hover:underline">
                GPT Tokenizer
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
