"use client";

import Image from "next/image";
import { FormEvent, useEffect, useState } from "react";
import { copy, localeOptions, type Locale } from "@/lib/i18n";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? (process.env.NODE_ENV === "production" ? "" : "http://localhost:4000");

type Nutrition = Record<"energyKcal" | "fat" | "saturatedFat" | "carbohydrates" | "sugars" | "protein" | "salt", number | null>;
type Product = {
  code: string; name: string; genericName: string | null; brand: string; imageUrl: string | null;
  nutritionGrade: string | null; nutrition: Nutrition | null;
};
type User = { email: string; subscriptionStatus: string; hasNutritionAccess: boolean; canManageBilling: boolean };
type RecentSearch = { id: string; term: string; locale: string };

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, init);
  const body = (await response.json()) as T & { error?: string };
  if (!response.ok) throw new Error(body.error ?? "Request failed");
  return body;
}

function SearchIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5 fill-none stroke-current stroke-2"><circle cx="11" cy="11" r="7"/><path d="m16 16 4 4"/></svg>;
}

function LeafMark() {
  return <span className="relative grid size-10 place-items-center rounded-[14px] bg-ink text-lime"><svg aria-hidden="true" viewBox="0 0 30 30" className="size-6 fill-none stroke-current stroke-[2.2]"><path d="M24 6C12 6 7 12 7 20c7 1 14-2 17-14Z"/><path d="M6 24c3-7 8-10 14-13"/></svg></span>;
}

function ProductCard({ product, locale, onSubscribe }: { product: Product; locale: Locale; onSubscribe: () => void }) {
  const t = copy[locale];
  const nutrition = product.nutrition;
  const nutritionRows: Array<[keyof Nutrition, string, string]> = [
    ["energyKcal", t.energy, "kcal"], ["fat", t.fat, "g"], ["saturatedFat", t.saturatedFat, "g"],
    ["carbohydrates", t.carbohydrates, "g"], ["sugars", t.sugars, "g"], ["protein", t.protein, "g"], ["salt", t.salt, "g"]
  ];
  const formatter = new Intl.NumberFormat(locale, { maximumFractionDigits: 1 });

  return (
    <article className="result-card overflow-hidden rounded-[28px] border border-ink/10 bg-white shadow-[0_18px_50px_rgba(23,51,45,0.08)]">
      <div className="relative aspect-[4/3] bg-[#f0eee7]">
        {product.imageUrl ? (
          <Image src={product.imageUrl} alt="" fill unoptimized sizes="(max-width: 768px) 100vw, 33vw" className="object-contain p-7" />
        ) : (
          <div className="grid h-full place-items-center text-5xl" aria-label={t.unknown}>🥣</div>
        )}
        {product.nutritionGrade ? <span className="absolute left-4 top-4 rounded-full bg-ink px-3 py-1.5 text-xs font-black text-white">NUTRI-SCORE {product.nutritionGrade}</span> : null}
      </div>
      <div className="p-6">
        <p className="mb-2 text-xs font-black uppercase tracking-[0.18em] text-citrus-dark">{product.brand}</p>
        <h3 className="text-xl font-black leading-tight text-ink">{product.name}</h3>
        {product.genericName ? <p className="mt-2 line-clamp-2 text-sm leading-6 text-ink/60">{product.genericName}</p> : null}

        <div className="mt-6 border-t border-ink/10 pt-5">
          <p className="mb-3 text-xs font-black uppercase tracking-[0.16em] text-ink/55">{t.nutrition}</p>
          {nutrition ? (
            <dl className="grid grid-cols-2 gap-x-5 gap-y-3">
              {nutritionRows.map(([key, label, unit]) => (
                <div key={key} className="flex items-baseline justify-between gap-2 border-b border-ink/7 pb-2 text-sm">
                  <dt className="truncate text-ink/60">{label}</dt>
                  <dd className="font-bold text-ink">{nutrition[key] === null ? "—" : `${formatter.format(nutrition[key])} ${unit}`}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <div className="rounded-2xl bg-mint/70 p-4">
              <div className="flex gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-white" aria-hidden="true">🔒</span>
                <div><p className="text-sm font-bold">{t.locked}</p><p className="mt-1 text-xs leading-5 text-ink/60">{t.subscribeNote}</p></div>
              </div>
              <button onClick={onSubscribe} className="mt-4 w-full rounded-xl bg-ink px-4 py-3 text-sm font-black text-white transition hover:bg-citrus-dark focus:outline-none focus:ring-4 focus:ring-citrus/25">{t.subscribe}</button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

export function ProductExplorer() {
  const [locale, setLocale] = useState<Locale>("en");
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [recent, setRecent] = useState<RecentSearch[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const t = copy[locale];

  useEffect(() => {
    Promise.all([
      api<User>("/api/user"),
      api<{ searches: RecentSearch[] }>("/api/searches/recent")
    ]).then(([nextUser, history]) => {
      setUser(nextUser);
      setRecent(history.searches);
    }).catch(() => setError(copy.en.error));
  }, []);

  async function runSearch(term: string, searchLocale: Locale = locale) {
    const clean = term.trim();
    if (clean.length < 2) return;
    setLoading(true);
    setError(null);
    setSearched(true);
    try {
      const result = await api<{ products: Product[] }>(`/api/products/search?query=${encodeURIComponent(clean)}&locale=${searchLocale}`);
      setProducts(result.products);
      setRecent((current) => [{ id: `${Date.now()}`, term: clean, locale: searchLocale }, ...current.filter((item) => item.term.toLowerCase() !== clean.toLowerCase())].slice(0, 6));
    } catch {
      setProducts([]);
      setError(copy[searchLocale].error);
    } finally {
      setLoading(false);
    }
  }

  async function startBilling(action: "checkout" | "portal") {
    setError(null);
    try {
      const { url } = await api<{ url: string }>(`/api/billing/${action}`, { method: "POST" });
      window.location.assign(url);
    } catch (billingError) {
      setError(billingError instanceof Error ? billingError.message : t.error);
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void runSearch(query);
  }

  function changeLocale(nextLocale: Locale) {
    setLocale(nextLocale);
    if (searched && query.trim().length >= 2) void runSearch(query, nextLocale);
  }

  return (
    <main className="min-h-screen overflow-hidden">
      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-5 py-6 sm:px-8 lg:px-10">
        <a href="#top" className="flex items-center gap-3" aria-label="Labelwise home"><LeafMark/><span className="text-xl font-black tracking-[-0.04em]">labelwise</span></a>
        <div className="flex items-center gap-2 sm:gap-3">
          <label className="sr-only" htmlFor="language">Language</label>
          <select id="language" value={locale} onChange={(event) => changeLocale(event.target.value as Locale)} className="rounded-full border border-ink/15 bg-white/70 px-3 py-2.5 text-xs font-black uppercase tracking-wider outline-none backdrop-blur focus:ring-4 focus:ring-citrus/20 sm:px-4">
            {localeOptions.map((option) => <option key={option.code} value={option.code}>{option.short} · {option.label}</option>)}
          </select>
          {user?.canManageBilling ? (
            <button onClick={() => void startBilling("portal")} className="hidden rounded-full bg-ink px-5 py-3 text-xs font-black text-white transition hover:-translate-y-0.5 sm:block">{t.manage}</button>
          ) : null}
        </div>
      </header>

      <section id="top" className="relative px-5 pb-16 pt-12 sm:px-8 sm:pt-20 lg:px-10">
        <div className="pointer-events-none absolute -right-28 -top-32 size-[420px] rounded-full bg-lime/60 blur-3xl" />
        <div className="pointer-events-none absolute -left-40 top-56 size-96 rounded-full bg-citrus/15 blur-3xl" />
        <div className="relative mx-auto max-w-5xl text-center">
          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-ink/10 bg-white/70 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] backdrop-blur">
            <span className={`size-2 rounded-full ${user?.hasNutritionAccess ? "bg-green-500" : "bg-citrus"}`} />
            {user?.hasNutritionAccess ? t.active : t.eyebrow}
          </div>
          <h1 className="text-balance text-5xl font-black leading-[0.92] tracking-[-0.065em] sm:text-7xl lg:text-[96px]">
            {t.headlineA}<br/><span className="text-citrus">{t.headlineB}</span>
          </h1>
          <p className="mx-auto mt-7 max-w-2xl text-pretty text-base leading-7 text-ink/65 sm:text-lg">{t.intro}</p>

          <form onSubmit={submit} className="mx-auto mt-10 flex max-w-3xl flex-col gap-3 rounded-[24px] bg-white p-2.5 shadow-[0_22px_70px_rgba(23,51,45,0.13)] sm:flex-row sm:rounded-full">
            <div className="flex min-w-0 flex-1 items-center gap-3 px-4">
              <span className="text-ink/35"><SearchIcon/></span>
              <label className="sr-only" htmlFor="search">{t.search}</label>
              <input id="search" value={query} onChange={(event) => setQuery(event.target.value)} minLength={2} maxLength={100} placeholder={t.placeholder} className="w-full bg-transparent py-3 text-sm text-ink outline-none placeholder:text-ink/35 sm:text-base" />
            </div>
            <button disabled={loading || query.trim().length < 2} className="rounded-2xl bg-citrus px-8 py-4 text-sm font-black text-white shadow-[0_8px_24px_rgba(255,122,61,0.3)] transition hover:-translate-y-0.5 hover:bg-citrus-dark disabled:cursor-not-allowed disabled:opacity-50 sm:rounded-full">{loading ? "…" : t.search}</button>
          </form>

          {recent.length > 0 ? (
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-xs"><span className="font-bold text-ink/45">{t.recent}</span>{recent.map((item) => <button key={item.id} onClick={() => { setQuery(item.term); void runSearch(item.term); }} className="rounded-full border border-ink/10 bg-white/55 px-3 py-1.5 text-ink/65 transition hover:border-citrus hover:text-citrus-dark">{item.term}</button>)}</div>
          ) : null}
          {error ? <p role="alert" className="mx-auto mt-5 max-w-xl rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error}</p> : null}
        </div>
      </section>

      <section className="relative mx-auto max-w-7xl px-5 pb-20 sm:px-8 lg:px-10">
        {loading ? (
          <div className="grid min-h-64 place-items-center"><div className="text-center"><div className="mx-auto size-10 animate-spin rounded-full border-4 border-ink/10 border-t-citrus"/><p className="mt-4 text-sm font-bold text-ink/50">{t.loading}</p></div></div>
        ) : products.length > 0 ? (
          <><div className="mb-7 flex items-end justify-between"><div><p className="text-xs font-black uppercase tracking-[0.18em] text-citrus-dark">{products.length} {t.products}</p><h2 className="mt-1 text-3xl font-black tracking-tight">{t.results}</h2></div><p className="hidden rounded-full bg-white px-4 py-2 text-xs font-bold text-ink/55 sm:block">{user?.email ?? t.member} · {user?.hasNutritionAccess ? t.active : t.free}</p></div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{products.map((product) => <ProductCard key={product.code} product={product} locale={locale} onSubscribe={() => void startBilling("checkout")}/>)}</div></>
        ) : (
          <div className="grid min-h-64 place-items-center rounded-[32px] border border-dashed border-ink/15 bg-white/35 px-6 text-center">
            <div><span className="text-5xl" aria-hidden="true">{searched ? "🌱" : "🥕"}</span><h2 className="mt-4 text-xl font-black">{searched ? t.noResults : t.emptyTitle}</h2>{!searched ? <p className="mt-2 text-sm text-ink/55">{t.emptyBody}</p> : null}</div>
          </div>
        )}
      </section>

      <footer className="border-t border-ink/10 px-5 py-7 text-center text-xs font-bold text-ink/45">{t.footer} · <a className="underline decoration-ink/25 underline-offset-4 hover:text-citrus-dark" href="https://world.openfoodfacts.org" target="_blank" rel="noreferrer">openfoodfacts.org</a></footer>
    </main>
  );
}
