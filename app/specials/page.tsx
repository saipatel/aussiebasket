import Link from "next/link";
import { getCurrentSpecials } from "@/lib/specials";
import { PRODUCTS } from "@/lib/products";
import { aud, fmtDate } from "@/lib/utils";
import { Sparkles, Tag, ShoppingCart } from "lucide-react";

export const dynamic = "force-dynamic";

export default function SpecialsPage() {
  const specials = getCurrentSpecials();
  const enriched = specials.map((s) => {
    const p = PRODUCTS.find((x) => x.id === s.productId)!;
    const everyday = Math.min(...Object.values(p.prices));
    return {
      ...s,
      product: p,
      everydayPrice: everyday,
      saving: round2(everyday - s.salePrice),
      savingPct: Math.max(0, Math.round(((everyday - s.salePrice) / everyday) * 100)),
    };
  }).sort((a, b) => b.savingPct - a.savingPct);

  const week = enriched[0] ? `${fmtDate(enriched[0].startDate)} – ${fmtDate(enriched[0].endDate)}` : "";
  const totalIfYouBoughtAll = enriched.reduce((s, x) => s + x.saving, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="text-brand-600" size={22} /> This week&apos;s specials
          </h1>
          <p className="text-ink-500 text-sm">{week}</p>
        </div>
        <div className="card !p-3">
          <div className="text-xs text-ink-500">Save up to</div>
          <div className="text-xl font-extrabold text-brand-700">{aud(totalIfYouBoughtAll)}</div>
          <div className="text-[11px] text-ink-500">across {enriched.length} deals</div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {enriched.map((s) => (
          <article key={s.id} className="card relative overflow-hidden">
            <span className={`badge ${kindClass(s.kind)} absolute top-3 right-3`}>
              <Tag size={12} /> {s.label}
            </span>
            <div className="text-xs text-ink-500">{s.store}</div>
            <h3 className="font-semibold mt-1 pr-16">{s.product.name}</h3>
            <div className="text-xs text-ink-500">{s.product.size} · {s.product.category}</div>

            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-brand-700">{aud(s.salePrice)}</span>
              <span className="text-sm text-ink-500 line-through">{aud(s.everydayPrice)}</span>
              <span className="badge-save badge ml-auto">−{s.savingPct}%</span>
            </div>

            {s.multiBuy && (
              <div className="mt-2 text-xs text-ink-500">
                Buy {s.multiBuy.qty} for {aud(s.multiBuy.total)}
              </div>
            )}

            <div className="mt-3 pt-3 border-t border-black/[0.06] flex items-center justify-between">
              <span className="text-xs text-ink-500">Save {aud(s.saving)} per unit</span>
              <Link href="/compare" className="text-brand-700 text-xs font-medium flex items-center gap-1">
                <ShoppingCart size={12} /> Add to basket
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function kindClass(k: string) {
  if (k === "half-price") return "badge-save";
  if (k === "clearance") return "badge-warn";
  if (k === "member") return "bg-blue-50 text-blue-700";
  return "badge-neutral";
}

function round2(n: number) { return Math.round(n * 100) / 100; }
