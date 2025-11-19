import Link from "next/link";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 text-zinc-900 dark:bg-black dark:text-zinc-50">
      <SiteHeader />
      <main className="flex flex-1 items-center justify-center px-4 py-16">
        <div className="mx-auto max-w-xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
            404
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">Page not found</h1>
          <p className="mt-4 text-base text-zinc-600 dark:text-zinc-300">
            The page you&apos;re looking for doesn&apos;t exist or has been moved. Head back to the homepage to continue converting your data with TOON.
          </p>
          <div className="mt-8">
            <Link
              href="/"
              className="inline-flex items-center rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-600/30 transition hover:-translate-y-0.5 hover:bg-emerald-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
            >
              Go back home
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
