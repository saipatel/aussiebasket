# Implementation Documentation

Architecture, data flow, and engineering decisions for AussieBasket.

---

## Stack (current)

| Layer | Tech |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS + custom brand palette |
| Icons | lucide-react |
| OCR (local) | tesseract.js (client-side, dynamic import) |
| OCR (cloud fallback) | OCR.space API via `/api/ocr` |
| PDF text | pdfjs-dist 3.x (client-side, worker from CDN) |
| Storage | File-based JSON (`data/receipts.json`) — MVP |
| Server | Next.js API routes (Node runtime) |

Future targets: Postgres + Drizzle, NextAuth, Tesseract for OCR, real price feeds.

---

## Architecture

```
┌─────────────────────────┐
│  Browser (React/Next)   │
│  /, /dashboard, /upload │
│  /receipts/:id, /compare│
│  /nearby                │
└─────────┬───────────────┘
          │ fetch
          ▼
┌─────────────────────────┐
│  Next.js API routes     │
│  /api/receipts          │
│  /api/receipts/[id]     │
│  /api/compare           │
│  /api/nearby            │
└─────────┬───────────────┘
          │
          ▼
┌─────────────────────────┐
│  lib/                   │
│  parser → products → db │
│  nearby                 │
└─────────────────────────┘
```

---

## Data model

### `Product` (static, from `lib/products.ts`)
```ts
{
  id: string;
  name: string;
  category: string;
  size: string;
  prices: { Coles: number; Woolworths: number; ALDI: number; IGA: number; }
}
```

### `Receipt`
```ts
{
  id: string;          // r_<ts>_<rand>
  store: Store;        // detected from receipt header
  date: string;        // ISO
  total: number;       // sum of pricePaid
  cheapestTotal: number; // sum of cheapest equivalents
  totalSavings: number;  // total - cheapestTotal
  items: ReceiptItem[];
  postcode?: string;
}
```

### `ReceiptItem`
```ts
{
  productId: string;
  name: string;        // canonical product name (post-match)
  qty: number;
  pricePaid: number;
  cheapestStore: Store;
  cheapestPrice: number; // per unit
  saving: number;        // pricePaid − cheapestPrice * qty
}
```

---

## OCR / PDF pipeline (v0.3.0 + v0.4.0)

`components/ReceiptScanner.tsx` accepts JPG/PNG **and** PDF in one dropzone, then routes:

### Image → Tesseract.js (local)
1. User drops/picks an image, or uses phone camera (`capture="environment"`).
2. `await import("tesseract.js")` — keeps the ~2 MB worker bundle out of the main JS chunk.
3. `Tesseract.recognize(file, "eng", { logger })` runs the WASM worker in the browser; logger drives a progress bar + status string.
4. Result is appended to the editable textarea so users can correct OCR errors.

**Privacy:** images never hit the server. **Cost:** first scan downloads the eng traineddata (~10 MB, cached forever).

### Image → Cloud OCR (fallback)
- "Cloud OCR" button surfaces after a local scan; auto-suggested when local OCR returns < 4 lines.
- Client base64-encodes the image and POSTs to `/api/ocr`.
- Server route forwards to **OCR.space** (`api.ocr.space/parse/image`) using `OCR_SPACE_KEY` env var (falls back to public `helloworld` demo key).
- Returns `{ text }` or `{ error }`. Text is appended to the textarea.
- Trade-off: only the photo bytes leave the device, but accuracy on tricky receipts is meaningfully better than local Tesseract.

### PDF → pdfjs-dist (no OCR)
1. `lib/pdf.ts` dynamically imports `pdfjs-dist/build/pdf` and points `GlobalWorkerOptions.workerSrc` at the CDN.
2. For each page, `getTextContent()` returns text items with `transform` matrices.
3. We bucket items by Y-position (rounded), sort buckets top-to-bottom, sort items in each bucket left-to-right, and join — reconstructing receipt-shaped lines so item names stay aligned with prices.
4. Result is appended to the textarea, ready for the standard parser.

**Why not OCR PDFs:** emailed e-receipts already contain real text — OCR'ing them would lose accuracy and add latency.

---

## Receipt parsing pipeline

`lib/parser.ts → parseReceiptText`

1. Detect store via header keyword match (`coles | woolies | aldi | iga`).
2. Split into lines, strip blank.
3. Drop header/footer noise (`TOTAL`, `GST`, `EFTPOS`, `CHANGE`, `TENDERED`, `CASH`).
4. For each remaining line, regex `^(\d+ x )?<name> $?<dd.dd>$`.
5. Fuzzy-match the name against `PRODUCTS` via `findProduct`:
   - Exact match → score 100
   - Substring either direction → 60
   - Token overlap → 10 per matching token
   - Threshold ≥ 10 to accept
6. Look up cheapest store/price for matched product.
7. Compute saving = `pricePaid − cheapestPrice × qty` (clamped ≥ 0).

Unmatched items are silently dropped in MVP. Future: surface them for manual mapping.

---

## Price comparison engine

`POST /api/compare` accepts `{ items: [{ name, qty }] }`:
- Matches each via `findProduct`.
- Sums per-store totals.
- Returns `cheapestStore`, `cheapestTotal`, `maxSaving` (cheapest vs dearest).

The `/compare` page calls `GET /api/compare` once for the catalogue, then computes basket totals client-side for instant UX.

---

## Weekly specials engine (`lib/specials.ts`)

- **Window**: `currentWeekWindow()` returns the Mon–Sun bracket covering today.
- **Determinism**: `weekSeed(date)` returns the absolute ISO-week number → fed into a small LCG RNG. Same week → same draws, no DB needed.
- **Picking**: 12 unique products per week from the catalogue.
- **Store assignment**: weighted (Coles 32%, Woolies 32%, ALDI 18%, IGA 18%) so the bigger chains run more deals (matches reality).
- **Deal kind**:
  - 50% half-price (`base × 0.5`)
  - 25% multi-buy (`2 × base × 0.7`, displayed as `2 for $X`)
  - 15% member offer (`base × 0.75`)
  - 10% clearance (`base × 0.6`)
- **`specialFor(productId)`** is called by the receipt parser; if `salePrice × qty < cheapestEverydayPrice × qty`, the receipt item records `specialStore`, `specialPrice`, `specialLabel`, `specialSaving` and the receipt detail page shows a ⚡ row hint.

When live catalogue scraping lands, `getCurrentSpecials()` will be the swap point — same shape, real data.

---

## Nearby store lookup

`lib/nearby.ts` — deterministic mock based on postcode hash. Returns 4 stores (one per chain) with synthetic distance and open/closed status. Sorted ascending by distance. Replaces with real geo provider (Mapbox / Google Places) post-MVP.

---

## Storage

`lib/db.ts` reads/writes a single JSON file at `data/receipts.json`:
- `getReceipts()` — list (newest first; new uploads `unshift`)
- `getReceipt(id)`
- `saveReceipt(r)`
- `deleteReceipt(id)`

The file is **gitignored**; created lazily on first write. Trade-off: simple, zero-deps, but single-process only. Swap for Postgres + Drizzle when we add auth.

---

## UI conventions

- All pages live under `app/` using server components by default; client components are marked `"use client"` only where state/interaction requires.
- Reusable primitives in `components/` (Navbar, StatCard).
- Tailwind utility classes + a small set of `@layer components` shorthand: `.btn`, `.btn-primary`, `.btn-ghost`, `.card`, `.stat-card`, `.badge`, `.input`.
- Brand palette: emerald-based, `brand-50 → brand-900`.
- Currency formatted via `aud(n)` (always `$x.xx`).
- Dates via `fmtDate(iso)` in `en-AU` locale.

---

## Environment variables

Currently optional:

```
OCR_SPACE_KEY=    # Cloud OCR fallback. Defaults to public "helloworld" key (rate-limited).
```

Future:

```
DATABASE_URL=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
COLES_API_KEY=
WOOLIES_API_KEY=
```

---

## Key decisions

| Decision | Why |
|---|---|
| File-based JSON storage | Zero infra for MVP; swap-in path is isolated to `lib/db.ts`. |
| Mock price DB | Live scraping has legal/operational complexity; mock proves UX first. |
| Server components by default | Faster TTFB, less JS. Client components only for interactive pages (`/upload`, `/compare`, `/nearby`). |
| Fuzzy product matching | Receipts have inconsistent naming ("MILK 2L" vs "Full Cream Milk 2L"). |
| Tailwind + custom palette | Fast iteration; consistent theme without a heavy UI lib. |

---

## Update log

| Date       | Section             | Change                                              |
|------------|---------------------|-----------------------------------------------------|
| 2026-05-05 | All                 | Initial documentation created                       |
| 2026-05-06 | All                 | Rewritten to reflect MVP architecture & data model  |
| 2026-05-06 | OCR pipeline        | Added Tesseract.js client-side scanner              |
| 2026-05-06 | PDF + cloud OCR     | Added pdfjs-dist parsing and OCR.space fallback     |
| 2026-05-06 | Specials engine     | Weekly seeded catalogue + receipt integration       |
