import Link from "next/link";
import { getReceipts } from "@/lib/db";
import StatCard from "@/components/StatCard";
import { aud, fmtDate } from "@/lib/utils";
import { PiggyBank, Receipt as ReceiptIcon, TrendingDown, ShoppingCart, Upload, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default function DashboardPage() {
  const receipts = getReceipts();
  const totalSpent = receipts.reduce((s, r) => s + r.total, 0);
  const totalSavings = receipts.reduce((s, r) => s + r.totalSavings, 0);
  const totalItems = receipts.reduce((s, r) => s + r.items.length, 0);
  const savingsPct = totalSpent > 0 ? totalSavings / totalSpent : 0;

  const categorySavings: Record<string, number> = {};
  for (const r of receipts) {
    for (const it of r.items) {
      categorySavings[it.cheapestStore] = (categorySavings[it.cheapestStore] || 0) + it.saving;
    }
  }
  const bestStore = Object.entries(categorySavings).sort((a, b) => b[1] - a[1])[0];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Your dashboard</h1>
          <p className="text-ink-500 text-sm">Track every dollar saved on groceries.</p>
        </div>
        <Link href="/upload" className="btn-primary">
          <Upload size={16} /> Upload receipt
        </Link>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={ReceiptIcon} label="Receipts" value={String(receipts.length)} sublabel={`${totalItems} items tracked`} />
        <StatCard icon={ShoppingCart} label="Total spent" value={aud(totalSpent)} sublabel="across all uploads" />
        <StatCard icon={PiggyBank} tone="save" label="Total savings" value={aud(totalSavings)} sublabel={`${(savingsPct * 100).toFixed(1)}% of spend`} />
        <StatCard icon={TrendingDown} tone="save" label="Cheapest store" value={bestStore ? bestStore[0] : "—"} sublabel={bestStore ? `${aud(bestStore[1])} saved here` : "Upload a receipt to see"} />
      </div>

      <section className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Recent receipts</h2>
          <Link href="/compare" className="text-sm text-brand-700 font-medium flex items-center gap-1">
            Compare prices <ArrowRight size={14} />
          </Link>
        </div>

        {receipts.length === 0 ? (
          <EmptyState />
        ) : (
          <ul className="divide-y divide-black/[0.05]">
            {receipts.map((r) => (
              <li key={r.id} className="py-3 flex items-center justify-between">
                <div>
                  <Link href={`/receipts/${r.id}`} className="font-medium hover:text-brand-700">
                    {r.store} — {fmtDate(r.date)}
                  </Link>
                  <div className="text-xs text-ink-500">
                    {r.items.length} items · paid {aud(r.total)}
                  </div>
                </div>
                <div className="text-right">
                  <div className={`badge ${r.totalSavings > 0 ? "badge-save" : "badge-neutral"}`}>
                    {r.totalSavings > 0 ? `Save ${aud(r.totalSavings)}` : "Best price"}
                  </div>
                  <div className="text-xs text-ink-500 mt-0.5">cheapest {aud(r.cheapestTotal)}</div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-12">
      <div className="w-14 h-14 mx-auto rounded-2xl bg-brand-50 grid place-items-center text-brand-700">
        <ReceiptIcon size={24} />
      </div>
      <h3 className="mt-3 font-semibold">No receipts yet</h3>
      <p className="text-sm text-ink-500 mt-1">Upload your first receipt to start saving.</p>
      <Link href="/upload" className="btn-primary mt-4 inline-flex">
        <Upload size={16} /> Upload receipt
      </Link>
    </div>
  );
}
