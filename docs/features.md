# Feature Documentation

Everything AussieBasket does today, plus what's planned next.

---

## ✅ Live in MVP (v0.2.0)

### 1. Receipt upload & parsing
- **Where:** `/upload`
- **Photo OCR** — drag-drop a JPG/PNG receipt, or use phone camera; Tesseract.js runs in-browser, shows live progress, and never uploads the image anywhere
- **PDF e-receipt parsing (NEW v0.4.0)** — drop a Coles/Woolies email-receipt PDF; text is extracted directly via PDF.js (no OCR loss)
- **Cloud OCR fallback (NEW v0.4.0)** — one-click "Cloud OCR" button in the scanner; auto-suggested when local OCR returns too few lines; uses OCR.space API (free tier by default, set `OCR_SPACE_KEY` for production)
- Paste receipt text, drop a `.txt` file, or generate a sample
- Parser extracts: store, line items, quantities, prices
- Skips noise lines (TOTAL, GST, EFTPOS, change, tendered)
- Quantity syntax: `2 x Eggs 6.50`
- Auto-detects store from header text
- Extracted text is editable before analysis so users can fix OCR errors

### 2. Savings dashboard
- **Where:** `/dashboard`
- 4 hero stats: receipts, total spent, total savings, cheapest store
- Recent receipts list with per-receipt savings badges
- Empty state guides first-time users to upload

### 3. Item-level comparison
- **Where:** `/receipts/[id]`
- For each item: what you paid, the cheapest price, which store, savings
- Whole-basket totals if you bought everything at Coles vs Woolies vs ALDI vs IGA
- Highlights cheapest single store for the basket

### 4. Smart shopping list (Compare)
- **Where:** `/compare`
- Searchable catalogue with side-by-side Coles / Woolies / ALDI / IGA prices
- Cheapest cell highlighted on each row
- Build a basket; sticky sidebar shows total at each store + max possible savings
- Quantity controls inline

### 5. Weekly specials (NEW v0.5.0)
- **Where:** `/specials` (top nav)
- Half-price, multi-buy (e.g. 2-for-$5), member-only, clearance — sorted by % saved
- Deal cards show: store, sale price, everyday price (struck through), per-unit savings, multi-buy detail
- **Personalised dashboard widget**: "On special — items you buy" shows current deals on products from your receipt history
- **Receipt-level integration**: each item flags whether it's currently on special elsewhere (⚡ indicator)
- Deals rotate weekly via deterministic seed — same calendar week always shows the same deals

### 6. Nearby stores
- **Where:** `/nearby`
- Postcode input → 4 stores returned with mock distance + open/closed status
- Sorted by distance

### 7. Receipt history
- All uploads persisted in `data/receipts.json`
- Aggregate stats roll up automatically

---

## 🛤️ Roadmap

### Near-term (next 1–2 sprints)
- ~~**Real OCR** for receipt photos (Tesseract.js client-side)~~ ✅ shipped in v0.3.0
- ~~**PDF parsing** for emailed e-receipts~~ ✅ shipped in v0.4.0
- ~~**Cloud OCR fallback**~~ ✅ shipped in v0.4.0 (OCR.space; Google Vision still on roadmap as a higher-accuracy paid option)
- **Live price feed** — scrape / API-integrate Coles + Woolies for fresh prices
- **Per-item alerts** — "Milk 2L just dropped to $2.99 at ALDI"

### Medium-term
- **User accounts** (NextAuth + Postgres) and multi-device sync
- **Pantry tracker** — log what's at home, expiry dates, auto-deduct from receipts
- **Weekly meal planner** → auto-generated shopping list optimised across stores
- ~~**Specials & catalogue**~~ ✅ shipped in v0.5.0 (mock data; live catalogue scraping next)
- **Loyalty card integration** (Flybuys, Everyday Rewards)

### Long-term
- **Group households** — shared baskets and savings goals
- **Price prediction** — "wait 3 days, this usually drops on Wed"
- **Mobile app** (React Native)
- **Carbon footprint per shop** as a secondary signal

---

## 🧪 Quality bars (definition of done for any feature)
- Mobile responsive
- Loading + empty + error states
- Keyboard accessible
- AUD formatting + GST awareness
- Documented in this file + CHANGELOG entry

---

## 📜 Feature update log

| Date       | Feature                          | Change                                    |
|------------|----------------------------------|-------------------------------------------|
| 2026-05-05 | Documentation                    | Initial setup                             |
| 2026-05-06 | MVP                              | All v0.2.0 features above shipped         |
| 2026-05-06 | OCR scan                         | v0.3.0 — Tesseract.js client-side scanner |
| 2026-05-06 | PDF + cloud OCR                  | v0.4.0 — pdfjs-dist for e-receipts, OCR.space fallback |
| 2026-05-06 | Weekly specials                  | v0.5.0 — catalogue, dashboard widget, receipt integration |
