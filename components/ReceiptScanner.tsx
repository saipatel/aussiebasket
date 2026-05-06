"use client";
import { useRef, useState } from "react";
import { Camera, Loader2, ImageIcon, FileText, Cloud, RefreshCw } from "lucide-react";

type Props = {
  onText: (text: string) => void;
};

export default function ReceiptScanner({ onText }: Props) {
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [lastFile, setLastFile] = useState<File | null>(null);
  const [lastResultLines, setLastResultLines] = useState<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);

  function reset() {
    setProgress(0);
    setLastResultLines(0);
  }

  async function handleFile(file: File) {
    setLastFile(file);
    reset();
    if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
      return runPdf(file);
    }
    if (file.type.startsWith("image/")) {
      setPreview(URL.createObjectURL(file));
      return runTesseract(file);
    }
    setStatus("Unsupported file. Use a JPG, PNG, or PDF.");
  }

  async function runTesseract(file: File) {
    setBusy(true);
    setStatus("Loading OCR engine…");
    try {
      const Tesseract = (await import("tesseract.js")).default;
      const { data } = await Tesseract.recognize(file, "eng", {
        logger: (m: any) => {
          if (m.status) setStatus(m.status);
          if (typeof m.progress === "number") setProgress(Math.round(m.progress * 100));
        },
      });
      const text = (data?.text || "").trim();
      finish(text);
    } catch (e: any) {
      setStatus(`OCR failed: ${e.message || "unknown error"}`);
    } finally {
      setBusy(false);
    }
  }

  async function runPdf(file: File) {
    setBusy(true);
    setStatus("Reading PDF…");
    try {
      const { extractPdfText } = await import("@/lib/pdf");
      const text = await extractPdfText(file, (pct, s) => {
        setProgress(pct);
        setStatus(s);
      });
      finish(text);
    } catch (e: any) {
      setStatus(`PDF read failed: ${e.message || "unknown error"}`);
    } finally {
      setBusy(false);
    }
  }

  async function runCloudOcr() {
    if (!lastFile || !lastFile.type.startsWith("image/")) return;
    setBusy(true);
    setProgress(20);
    setStatus("Sending to cloud OCR…");
    try {
      const b64 = await fileToBase64(lastFile);
      setProgress(60);
      const r = await fetch("/api/ocr", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ imageBase64: b64, mime: lastFile.type }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "cloud OCR failed");
      setProgress(100);
      finish(data.text || "");
    } catch (e: any) {
      setStatus(`Cloud OCR failed: ${e.message}`);
    } finally {
      setBusy(false);
    }
  }

  function finish(text: string) {
    if (!text) {
      setStatus("Couldn't read any text. Try cloud OCR or a sharper photo.");
      setLastResultLines(0);
      return;
    }
    const lines = text.split(/\n/).filter((l) => l.trim()).length;
    setLastResultLines(lines);
    setStatus(`Scanned ${lines} lines.`);
    onText(text);
  }

  return (
    <div className="space-y-3">
      <div
        className="border-2 border-dashed border-ink-300 rounded-xl p-5 text-center bg-gradient-to-br from-brand-50/40 to-white"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const f = e.dataTransfer.files[0];
          if (f) handleFile(f);
        }}
      >
        <div className="w-12 h-12 mx-auto rounded-2xl bg-brand-50 grid place-items-center text-brand-700 mb-2">
          <Camera size={22} />
        </div>
        <div className="font-semibold text-sm">Scan a receipt</div>
        <div className="text-xs text-ink-500 mt-0.5">
          Photo (JPG/PNG) or e-receipt (PDF) — drop here, or pick from your device
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="btn-primary disabled:opacity-50"
          >
            {busy ? <Loader2 className="animate-spin" size={16} /> : <ImageIcon size={16} />}
            {busy ? "Scanning…" : "Choose file"}
          </button>
          <button
            type="button"
            onClick={() => {
              const el = inputRef.current!;
              el.setAttribute("capture", "environment");
              el.click();
              setTimeout(() => el.removeAttribute("capture"), 0);
            }}
            disabled={busy}
            className="btn-ghost disabled:opacity-50"
          >
            <Camera size={16} /> Use camera
          </button>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*,application/pdf,.pdf"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />
      </div>

      {(busy || status) && (
        <div className="card !p-3 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-ink-700 font-medium capitalize">{status || "Idle"}</span>
            {busy && <span className="text-ink-500">{progress}%</span>}
          </div>
          {busy && (
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-600 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
          <div className="flex items-center justify-between gap-2">
            {preview ? (
              <div className="flex items-center gap-2">
                <img src={preview} alt="receipt preview" className="w-12 h-16 object-cover rounded border border-ink-300" />
                <span className="text-xs text-ink-500">
                  {lastFile?.type.startsWith("image/") ? "Photo" : "PDF"} preview
                </span>
              </div>
            ) : lastFile?.type === "application/pdf" ? (
              <div className="flex items-center gap-2 text-xs text-ink-500">
                <FileText size={14} /> {lastFile.name}
              </div>
            ) : <span />}

            {!busy && lastFile?.type.startsWith("image/") && (
              <div className="flex items-center gap-2">
                {lastResultLines > 0 && lastResultLines < 4 && (
                  <span className="text-xs text-amber-700">Few lines — try cloud OCR?</span>
                )}
                <button
                  type="button"
                  onClick={runCloudOcr}
                  className="btn-ghost !py-1 !px-2 text-xs"
                  title="Send the image to a cloud OCR for better accuracy"
                >
                  <Cloud size={14} /> Cloud OCR
                </button>
                <button
                  type="button"
                  onClick={() => lastFile && runTesseract(lastFile)}
                  className="btn-ghost !py-1 !px-2 text-xs"
                  title="Re-scan locally"
                >
                  <RefreshCw size={14} /> Re-scan
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => {
      const s = String(r.result || "");
      const i = s.indexOf(",");
      resolve(i >= 0 ? s.slice(i + 1) : s);
    };
    r.onerror = () => reject(r.error);
    r.readAsDataURL(file);
  });
}
