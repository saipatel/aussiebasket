# Changelog

All notable changes to AussieBasket will be documented here.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [0.5.1] — 2026-05-06

### Fixed
- **Receipt parser much more forgiving** for real-world OCR output:
  - Strips leading SKU/barcode digits (5+ digits) and shelf-tag prefixes
  - Handles abbreviated names (FC MILK, WW BREAD, CHKN BRST, SPAG, OJ, TP, etc.) via abbreviation map + product keyword index
  - Handles `2 X` / `2 *` quantity syntax
  - Tolerates `EA` / `EACH` / `KG` trailing tokens
  - Tolerates comma decimal separators (`$2,50`)
  - Lowered fuzzy match threshold; added per-product keyword boost so partial matches succeed
- **Better upload errors**: when no items match, the UI now shows the number of lines read, the unmatched lines, and a hint to edit the textarea — instead of a bare "no items recognised"

---

## [0.5.0] — 2026-05-06

### Added
- **Weekly specials catalogue** (`lib/specials.ts`)
  - Deterministic seed-based weekly rotation (same week → same deals, rotates each week)
  - 4 deal types: half-price, multi-buy (2-for-X), member offer, clearance
  - Mon–Sun window with start/end dates per special
- **`/specials` page** — browse this week's deals across all 4 chains, sorted by % saved, with kind badges, multi-buy detail, and per-unit savings
- **`GET /api/specials`** — listing endpoint with `?store=` and `?kind=` filters
- **Receipt-level integration** — every uploaded receipt item now records the best matching weekly special (if it beats everyday cheapest); shown inline on the receipt detail with a "⚡" indicator
- **Dashboard widgets**:
  - "On special — items you buy" personalised feed when the user has receipts
  - "Top deals this week" fallback for new users
- Specials added to navbar

### Changed
- `ReceiptItem` type extended with `specialStore`, `specialPrice`, `specialLabel`, `specialSaving`
- README, features.md, implementation.md updated for specials engine

---

## [0.4.0] — 2026-05-06

### Added
- **PDF e-receipt parsing** via `pdfjs-dist` (client-side)
  - Extracts text directly from emailed PDF receipts (Coles/Woolies digital receipts)
  - Reconstructs lines by Y-position so prices stay aligned with item names
  - Per-page progress indicator
  - Worker loaded from CDN (no bundle bloat)
- **Cloud OCR fallback** via OCR.space API
  - New `POST /api/ocr` server route (uses `OCR_SPACE_KEY` env var, falls back to public demo key)
  - "Cloud OCR" button surfaces in the scanner card after a local scan
  - Auto-suggested when local Tesseract returns very few lines
  - Re-scan button to retry locally
- `.env.example` documenting `OCR_SPACE_KEY`

### Changed
- `ReceiptScanner` accepts JPG/PNG **and** PDF in one dropzone
- Upload page tips updated for PDF + cloud fallback workflow

---

## [0.3.0] — 2026-05-06

### Added
- **In-browser receipt OCR** powered by `tesseract.js`
  - New `ReceiptScanner` component on `/upload`
  - Drag-drop, file picker, and "Use camera" (mobile) entry points
  - Live progress bar + status indicator while scanning
  - Image preview thumbnail
  - Extracted text appended to the editable textarea so users can fix mistakes before analysing
  - Runs entirely client-side — photos never leave the device

### Changed
- `/upload` page restructured with OCR-first UX (scan → review → analyse)
- Tips sidebar updated for OCR best practices
- README, features.md, implementation.md updated for OCR

---

## [0.2.0] — 2026-05-06 — MVP

### Added
- Next.js 14 App Router scaffolding (TypeScript + Tailwind)
- Mock Aussie supermarket price database with 20 staple products across Coles, Woolworths, ALDI, IGA
- Receipt parser (`lib/parser.ts`) — extracts items, qty, price from pasted text; auto-detects store
- File-based JSON storage for receipts (`lib/db.ts`)
- API routes:
  - `POST /api/receipts` — upload + parse + save
  - `GET /api/receipts` — list
  - `GET /api/receipts/[id]` — detail
  - `DELETE /api/receipts/[id]` — remove
  - `GET /api/compare` — search products
  - `POST /api/compare` — basket → cheapest store
  - `GET /api/nearby?postcode=` — nearby store lookup
- Pages:
  - `/` — landing with value prop
  - `/dashboard` — savings stats + receipt history
  - `/upload` — paste / drop / sample receipt
  - `/receipts/[id]` — item-by-item comparison + whole-basket per-store totals
  - `/compare` — catalogue search + smart basket builder
  - `/nearby` — postcode-based store finder
- Brand-themed UI with Tailwind, custom palette, reusable card/stat/badge components

### Changed
- README rewritten with MVP feature list, quickstart, structure, roadmap
- features.md and implementation.md updated to reflect MVP

---

## [0.1.0] — 2026-05-05

### Added
- Repository initialised
- README, CHANGELOG, feature docs, and implementation docs created
