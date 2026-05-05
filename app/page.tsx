import Link from "next/link";
import { ShoppingBasket, ScanLine, BarChart3, MapPin, PiggyBank, Sparkles } from "lucide-react";

export default function Home() {
  return (
    <div className="space-y-16 pt-6">
      <section className="text-center space-y-6 pt-8">
        <span className="badge bg-brand-50 text-brand-700">
          <Sparkles size={14} /> Built for Aussie shoppers
        </span>
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight">
          Stop overpaying<br />
          <span className="text-brand-600">at the checkout.</span>
        </h1>
        <p className="text-lg text-ink-500 max-w-2xl mx-auto">
          Upload any Coles, Woolworths, ALDI or IGA receipt. We&apos;ll show you exactly which items
          are cheaper elsewhere — and how much you could save next shop.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link href="/upload" className="btn-primary">
            <ScanLine size={18} /> Upload a receipt
          </Link>
          <Link href="/dashboard" className="btn-ghost">
            View dashboard
          </Link>
        </div>
      </section>

      <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {features.map((f) => (
          <div key={f.title} className="card">
            <div className="w-10 h-10 rounded-xl bg-brand-50 grid place-items-center text-brand-700">
              <f.icon size={20} />
            </div>
            <h3 className="mt-3 font-semibold">{f.title}</h3>
            <p className="text-sm text-ink-500 mt-1">{f.desc}</p>
          </div>
        ))}
      </section>

      <section className="card bg-gradient-to-br from-brand-50 to-white">
        <div className="grid md:grid-cols-3 gap-6 items-center">
          <div className="md:col-span-2">
            <h2 className="text-2xl font-bold">How it works</h2>
            <ol className="mt-4 space-y-2 text-ink-700">
              <li><b>1.</b> Upload your supermarket receipt (or paste the items).</li>
              <li><b>2.</b> We match each item to live Aussie supermarket prices.</li>
              <li><b>3.</b> See your savings, build a smart shopping list, and shop cheaper next time.</li>
            </ol>
          </div>
          <div className="text-center">
            <div className="text-5xl font-extrabold text-brand-600">$23.40</div>
            <div className="text-sm text-ink-500">avg. savings per shop</div>
          </div>
        </div>
      </section>
    </div>
  );
}

const features = [
  { icon: ScanLine, title: "Smart receipt parsing", desc: "Snap or paste — we extract every item automatically." },
  { icon: BarChart3, title: "Cross-store comparison", desc: "Side-by-side prices across Coles, Woolies, ALDI, IGA." },
  { icon: PiggyBank, title: "Savings tracker", desc: "See your weekly and lifetime savings at a glance." },
  { icon: MapPin, title: "Cheapest nearby store", desc: "Postcode-aware — find the cheapest store near you." },
];
