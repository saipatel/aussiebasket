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

  async function submit(useText: string, demo = false) {
    setBusy(true); setError(null);
    try {
      const res = await fetch("/api/receipts", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text: useText, postcode, demo }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
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
        <p className="text-ink-500 text-sm">Scan a photo, paste text, or try a sample.</p>
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

            {error && <div className="text-sm text-red-600">{error}</div>}

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
          <h3 className="font-semibold">Tips for best OCR results</h3>
          <ul className="text-sm text-ink-700 space-y-2">
            <li>• Take the photo in good light, receipt flat</li>
            <li>• Crop to just the items + prices area</li>
            <li>• Re-scan if the preview looks blurry</li>
            <li>• You can <b>edit</b> the extracted text before analysing</li>
          </ul>
          <div className="text-xs text-ink-500 pt-3 border-t">
            OCR runs entirely in your browser — your photo never leaves your device.
          </div>
        </aside>
      </div>
    </div>
  );
}
