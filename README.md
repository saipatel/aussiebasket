# AussieBasket 🛒

Stop overpaying at the supermarket. Upload your **Coles / Woolworths / ALDI / IGA** receipt and AussieBasket shows you exactly how much you could save by buying the same items elsewhere — plus a smart comparison engine for your next shop.

> Built for Aussie shoppers. MVP, fast, focused.

---

## ✨ MVP Features

| Feature | What it does |
|---|---|
| **📷 Photo OCR** | Snap or drop a receipt photo — Tesseract.js extracts text **in your browser** (privacy-safe) |
| **Smart receipt parsing** | Paste or drop a receipt, we extract every item and the store automatically |
| **Savings dashboard** | Total spent, total savings, savings %, and your cheapest store at a glance |
| **Item-by-item comparison** | See where each product is cheapest, and how much you'd save |
| **Whole-basket comparison** | "If I bought this whole shop at Coles vs ALDI..." — instant totals |
| **Smart shopping list (Compare)** | Search the catalogue, build a basket, see which store wins |
| **Nearby stores** | Postcode-based lookup of the closest Coles, Woolies, ALDI, IGA |
| **Receipt history** | Every upload saved to your dashboard with running savings totals |

See [docs/features.md](docs/features.md) for the full feature spec and roadmap.

---

## 🏗️ Tech stack

- **Next.js 14** (App Router) + TypeScript
- **Tailwind CSS** with a custom brand palette
- **Lucide** icons
- **File-based JSON** storage for receipts (MVP — easy to swap for Postgres later)
- **Mock supermarket price database** of 20 staple Aussie groceries

See [docs/implementation.md](docs/implementation.md) for architecture details.

---

## 🚀 Getting started

```bash
git clone https://github.com/saipatel/aussiebasket.git
cd aussiebasket
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Try it without typing

1. Go to `/upload`
2. Click **Try a sample** — a fake Coles receipt is generated and analysed
3. View your savings on the dashboard

### Try with your own receipt

Paste lines like:

```
COLES SUPERMARKET
Full Cream Milk 2L  3.40
2 x Cavendish Bananas  4.20
Free Range Eggs  6.50
TOTAL  14.10
```

We auto-detect the store, parse each item, match against the price database, and compute savings.

---

## 📂 Project structure

```
aussiebasket/
├── app/
│   ├── page.tsx                  # Landing
│   ├── dashboard/page.tsx        # Savings overview
│   ├── upload/page.tsx           # Receipt upload
│   ├── receipts/[id]/page.tsx    # Receipt detail + comparison
│   ├── compare/page.tsx          # Catalogue + smart basket
│   ├── nearby/page.tsx           # Stores near postcode
│   └── api/                      # REST endpoints
├── components/                   # Navbar, StatCard, etc.
├── lib/
│   ├── products.ts               # Mock supermarket price DB
│   ├── parser.ts                 # Receipt text → structured items
│   ├── db.ts                     # JSON-file receipt storage
│   ├── nearby.ts                 # Postcode-based store lookup
│   ├── utils.ts                  # cn(), aud(), date helpers
│   └── types.ts
├── data/receipts.json            # Receipts (gitignored)
└── docs/                         # Feature & implementation docs
```

---

## 🗺️ Roadmap (next)

- ~~Real OCR for receipt photos~~ ✅ shipped — PDF parsing & cloud OCR fallback next
- Live price scraping (Coles / Woolworths public APIs)
- User auth & multi-device sync
- Push alerts when staple items drop in price
- Pantry tracker — what you have at home + expiry reminders
- Weekly meal plan → optimised shopping list

---

## 📝 Documentation

- [Features](docs/features.md) — current capabilities + roadmap
- [Implementation](docs/implementation.md) — architecture, data model, decisions
- [Changelog](CHANGELOG.md) — every release

---

## License

MIT
