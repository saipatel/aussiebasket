"use client";
import { useEffect, useMemo, useState } from "react";
import { Search, Plus, Trash2, ShoppingCart } from "lucide-react";
import { aud } from "@/lib/utils";

type Product = {
  id: string; name: string; category: string; size: string;
  prices: Record<"Coles" | "Woolworths" | "ALDI" | "IGA", number>;
};

const STORES = ["Coles", "Woolworths", "ALDI", "IGA"] as const;

export default function ComparePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [q, setQ] = useState("");
  const [basket, setBasket] = useState<Array<{ id: string; qty: number }>>([]);

  useEffect(() => {
    fetch("/api/compare").then((r) => r.json()).then(setProducts);
  }, []);

  const filtered = useMemo(() => {
    const s = q.toLowerCase();
    return products.filter((p) => p.name.toLowerCase().includes(s) || p.category.toLowerCase().includes(s));
  }, [products, q]);

  const totals = useMemo(() => {
    const t: Record<string, number> = { Coles: 0, Woolworths: 0, ALDI: 0, IGA: 0 };
    for (const b of basket) {
      const p = products.find((x) => x.id === b.id);
      if (!p) continue;
      for (const s of STORES) t[s] += p.prices[s] * b.qty;
    }
    return t;
  }, [basket, products]);

  const cheapest = STORES.reduce((a, b) => (totals[a] < totals[b] ? a : b));

  function add(id: string) {
    setBasket((b) => {
      const x = b.find((i) => i.id === id);
      if (x) return b.map((i) => (i.id === id ? { ...i, qty: i.qty + 1 } : i));
      return [...b, { id, qty: 1 }];
    });
  }

  function setQty(id: string, qty: number) {
    if (qty <= 0) return setBasket((b) => b.filter((i) => i.id !== id));
    setBasket((b) => b.map((i) => (i.id === id ? { ...i, qty } : i)));
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Compare prices</h1>
        <p className="text-ink-500 text-sm">Build a basket and find the cheapest store for your shop.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <div className="card">
            <div className="flex items-center gap-2">
              <Search size={18} className="text-ink-500" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search milk, bread, chicken..."
                className="input"
              />
            </div>
          </div>

          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-ink-500">
                <tr className="border-b border-black/[0.06]">
                  <th className="py-2">Product</th>
                  {STORES.map((s) => (<th key={s} className="py-2">{s}</th>))}
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => {
                  const min = Math.min(...STORES.map((s) => p.prices[s]));
                  return (
                    <tr key={p.id} className="border-b border-black/[0.04]">
                      <td className="py-2">
                        <div className="font-medium">{p.name}</div>
                        <div className="text-xs text-ink-500">{p.size} · {p.category}</div>
                      </td>
                      {STORES.map((s) => (
                        <td key={s} className={`py-2 ${p.prices[s] === min ? "text-brand-700 font-semibold" : ""}`}>
                          {aud(p.prices[s])}
                        </td>
                      ))}
                      <td className="py-2 text-right">
                        <button onClick={() => add(p.id)} className="btn-ghost !py-1 !px-2 text-xs">
                          <Plus size={14} /> Add
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <aside className="card h-fit sticky top-20 space-y-3">
          <h3 className="font-semibold flex items-center gap-2">
            <ShoppingCart size={16} /> Your basket
          </h3>
          {basket.length === 0 ? (
            <p className="text-sm text-ink-500">Add products to see which store is cheapest.</p>
          ) : (
            <ul className="divide-y divide-black/[0.05]">
              {basket.map((b) => {
                const p = products.find((x) => x.id === b.id);
                if (!p) return null;
                return (
                  <li key={b.id} className="py-2 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">{p.name}</div>
                      <div className="text-xs text-ink-500">{p.size}</div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => setQty(b.id, b.qty - 1)} className="w-6 h-6 rounded border border-ink-300">−</button>
                      <span className="w-6 text-center text-sm">{b.qty}</span>
                      <button onClick={() => setQty(b.id, b.qty + 1)} className="w-6 h-6 rounded border border-ink-300">+</button>
                      <button onClick={() => setQty(b.id, 0)} className="ml-1 text-ink-500 hover:text-red-600">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          {basket.length > 0 && (
            <div className="pt-3 border-t border-black/[0.06] space-y-2">
              {STORES.map((s) => (
                <div key={s} className={`flex items-center justify-between text-sm ${s === cheapest ? "font-semibold text-brand-700" : ""}`}>
                  <span>{s}</span>
                  <span>{aud(totals[s])}</span>
                </div>
              ))}
              <div className="pt-2 mt-2 border-t border-black/[0.06] text-sm">
                <div className="badge-save badge">Cheapest: {cheapest} · {aud(totals[cheapest])}</div>
                <div className="text-xs text-ink-500 mt-1">
                  Save up to {aud(Math.max(...STORES.map((s) => totals[s])) - totals[cheapest])} vs the dearest store.
                </div>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
