"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, Sparkles, Loader2, FileText } from "lucide-react";
import ReceiptScanner from "@/components/ReceiptScanner";

const SAMPLE = `COLES SUPERMARKET
Full Cream Milk 2L  3.40
White Bread Loaf  2.50
Free Range Eggs  6.50
2 x Cavendish Bananas  4.20
Chicken Breast Fillets  13.50
Spaghetti Pasta  2.20
Tasty Cheese Block  8.50
Greek Yogurt  6.50
TOTAL  47.30`;

export default function UploadPage() {
  const router = useRouter();
  const [text, setText] = useState("");
  const [postcode, setPostcode] = useState("2000");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const [unmatched, setUnmatched] = useState<string[]>([]);
  const [rawLines, setRawLines] = useState<number | null>(null);

  async function submit(useText: string, demo = false) {
    setBusy(true); setError(null); setHint(null); setUnmatched([]); setRawLines(null);
    try {
      const res = await fetch("/api/receipts", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text: useText, postcode, demo }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed");
        setHint(data.hint || null);
        setUnmatched(data.unmatched || []);
        setRawLines(typeof data.rawLines === "number" ? data.rawLines : null);
        return;
      }
      router.push(`/receipts/${data.id}`);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleTxtFile(file: File) {
    const t = await file.text();
    setText(t);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Upload a receipt</h1>
        <p className="text-ink-500 text-sm">Scan a photo or PDF, paste text, or try a sample.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <ReceiptScanner onText={(t) => setText((cur) => (cur ? cur + "\n" + t : t))} />

          <div className="card space-y-4">
            <label className="block">
              <span className="text-sm font-medium">Receipt text</span>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={14}
                placeholder={SAMPLE}
                className="input mt-1 font-mono text-xs"
              />
              <span className="text-xs text-ink-500 mt-1 block">
                After scanning, review and tweak the text — fix typos, remove noise lines — then analyse.
              </span>
            </label>

            <div
              className="border-2 border-dashed border-ink-300 rounded-xl py-4 text-center text-sm text-ink-500"
              onDragOver={(e) => e.preventDefault()}
              onDrop={async (e) => {
                e.preventDefault();
                const f = e.dataTransfer.files[0];
                if (f) handleTxtFile(f);
              }}
            >
              <FileText className="inline mr-1" size={16} /> Or drop a .txt receipt here, or
              <label className="ml-1 underline cursor-pointer text-brand-700">
                browse
                <input
                  type="file"
                  accept=".txt,text/plain"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleTxtFile(e.target.files[0])}
                />
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-sm font-medium">Your postcode</span>
                <input
                  value={postcode}
                  onChange={(e) => setPostcode(e.target.value)}
                  className="input mt-1"
                  placeholder="2000"
                />
              </label>
            </div>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm space-y-2">
                <div className="font-semibold text-red-700">{error}</div>
                {hint && <div className="text-red-700/90">{hint}</div>}
                {rawLines !== null && (
                  <div className="text-xs text-red-700/80">
                    Read {rawLines} lines from the receipt; matched 0 to our catalogue.
                  </div>
                )}
                {unmatched.length > 0 && (
                  <details className="text-xs">
                    <summary className="cursor-pointer text-red-700">
                      Show {unmatched.length} unmatched line{unmatched.length === 1 ? "" : "s"}
                    </summary>
                    <ul className="mt-1 list-disc ml-5 space-y-0.5 font-mono text-red-700/80">
                      {unmatched.slice(0, 30).map((u, i) => <li key={i}>{u}</li>)}
                    </ul>
                  </details>
                )}
                <div className="text-xs text-ink-500">
                  Our MVP catalogue covers ~20 staples (milk, bread, eggs, chicken, rice, pasta, cheese, etc.). Items outside that won&apos;t match yet — live catalogue is coming.
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => submit(text)}
                disabled={busy || !text.trim()}
                className="btn-primary disabled:opacity-50"
              >
                {busy ? <Loader2 className="animate-spin" size={16} /> : <Upload size={16} />}
                Analyse receipt
              </button>
              <button
                onClick={() => submit("", true)}
                disabled={busy}
                className="btn-ghost"
              >
                <Sparkles size={16} /> Try a sample
              </button>
              {text && (
                <button onClick={() => setText("")} disabled={busy} className="btn-ghost">
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        <aside className="card space-y-3 h-fit">
          <h3 className="font-semibold">Scanning tips</h3>
          <ul className="text-sm text-ink-700 space-y-2">
            <li>• <b>PDFs</b>: e-receipts from Coles/Woolies emails work great — text is extracted directly (no OCR needed)</li>
            <li>• <b>Photos</b>: take in good light, receipt flat, cropped to items area</li>
            <li>• If a photo scan looks poor, hit <b>Cloud OCR</b> for a higher-accuracy retry</li>
            <li>• You can <b>edit</b> extracted text before analysing</li>
          </ul>
          <div className="text-xs text-ink-500 pt-3 border-t">
            Local OCR runs in your browser. Cloud OCR sends only the photo bytes to OCR.space and returns text.
          </div>
        </aside>
      </div>
    </div>
  );
}
