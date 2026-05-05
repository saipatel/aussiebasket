import Link from "next/link";
import { notFound } from "next/navigation";
import { getReceipt } from "@/lib/db";
import { PRODUCTS, STORES } from "@/lib/products";
import { aud, fmtDate } from "@/lib/utils";
import { ArrowLeft, PiggyBank, ShoppingCart, TrendingDown } from "lucide-react";
import StatCard from "@/components/StatCard";

export const dynamic = "force-dynamic";

export default function ReceiptPage({ params }: { params: { id: string } }) {
  const r = getReceipt(params.id);
  if (!r) notFound();

  const storeTotals: Record<string, number> = { Coles: 0, Woolworths: 0, ALDI: 0, IGA: 0 };
  for (const it of r.items) {
    const p = PRODUCTS.find((x) => x.id === it.productId);
    if (!p) continue;
    for (const s of STORES) storeTotals[s] += p.prices[s] * it.qty;
  }

  return (
    <div className="space-y-6">
      <Link href="/dashboard" className="text-sm text-ink-500 inline-flex items-center gap-1 hover:text-ink-900">
        <ArrowLeft size={14} /> Back to dashboard
      </Link>

      <div>
        <h1 className="text-2xl font-bold">{r.store} receipt</h1>
        <p className="text-ink-500 text-sm">{fmtDate(r.date)} · {r.items.length} items</p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <StatCard icon={ShoppingCart} label="You paid" value={aud(r.total)} sublabel={r.store} />
        <StatCard icon={TrendingDown} tone="save" label="Cheapest possible" value={aud(r.cheapestTotal)} sublabel="if you bought each item at its cheapest store" />
        <StatCard icon={PiggyBank} tone="save" label="Potential savings" value={aud(r.totalSavings)} sublabel={`${((r.totalSavings / Math.max(r.total, 0.01)) * 100).toFixed(1)}% saved`} />
      </div>

      <section className="card">
        <h2 className="font-semibold mb-3">If you bought this whole basket at one store</h2>
        <div className="grid sm:grid-cols-4 gap-3">
          {STORES.map((s) => {
            const t = storeTotals[s];
            const isMin = t === Math.min(...Object.values(storeTotals));
            return (
              <div key={s} className={`rounded-xl border p-3 ${isMin ? "border-brand-500 bg-brand-50" : "border-ink-300"}`}>
                <div className="text-xs text-ink-500">{s}</div>
                <div className="text-xl font-bold">{aud(t)}</div>
                {isMin && <div className="text-xs text-brand-700 font-medium mt-1">Cheapest</div>}
              </div>
            );
          })}
        </div>
      </section>

      <section className="card">
        <h2 className="font-semibold mb-3">Item-by-item</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-ink-500">
              <tr className="border-b border-black/[0.06]">
                <th className="py-2">Item</th>
                <th className="py-2">Qty</th>
                <th className="py-2">You paid</th>
                <th className="py-2">Cheapest</th>
                <th className="py-2">Where</th>
                <th className="py-2 text-right">Save</th>
              </tr>
            </thead>
            <tbody>
              {r.items.map((it) => (
                <tr key={it.productId} className="border-b border-black/[0.04]">
                  <td className="py-2 font-medium">{it.name}</td>
                  <td className="py-2">{it.qty}</td>
                  <td className="py-2">{aud(it.pricePaid)}</td>
                  <td className="py-2">{aud(it.cheapestPrice * it.qty)}</td>
                  <td className="py-2">
                    <span className="badge-neutral badge">{it.cheapestStore}</span>
                  </td>
                  <td className="py-2 text-right">
                    {it.saving > 0 ? <span className="badge-save badge">+{aud(it.saving)}</span> : <span className="text-ink-500">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
