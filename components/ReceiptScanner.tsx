"use client";
import { useRef, useState } from "react";
import { Camera, Loader2, ImageIcon } from "lucide-react";

type Props = {
  onText: (text: string) => void;
};

export default function ReceiptScanner({ onText }: Props) {
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleImage(file: File) {
    if (!file.type.startsWith("image/")) {
      setStatus("Please select an image (JPG, PNG, HEIC).");
      return;
    }
    setBusy(true);
    setProgress(0);
    setStatus("Loading OCR engine…");
    setPreview(URL.createObjectURL(file));

    try {
      const Tesseract = (await import("tesseract.js")).default;
      const { data } = await Tesseract.recognize(file, "eng", {
        logger: (m: any) => {
          if (m.status) setStatus(m.status);
          if (typeof m.progress === "number") setProgress(Math.round(m.progress * 100));
        },
      });
      const text = (data?.text || "").trim();
      if (!text) {
        setStatus("Couldn't read any text. Try a sharper photo or paste manually.");
      } else {
        setStatus(`Scanned ${text.split(/\n/).length} lines.`);
        onText(text);
      }
    } catch (e: any) {
      setStatus(`OCR failed: ${e.message || "unknown error"}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-3">
      <div
        className="border-2 border-dashed border-ink-300 rounded-xl p-5 text-center bg-gradient-to-br from-brand-50/40 to-white"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const f = e.dataTransfer.files[0];
          if (f) handleImage(f);
        }}
      >
        <div className="w-12 h-12 mx-auto rounded-2xl bg-brand-50 grid place-items-center text-brand-700 mb-2">
          <Camera size={22} />
        </div>
        <div className="font-semibold text-sm">Scan a receipt photo</div>
        <div className="text-xs text-ink-500 mt-0.5">
          Drop a JPG/PNG here, or pick one from your phone
        </div>
        <div className="mt-3 flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="btn-primary disabled:opacity-50"
          >
            {busy ? <Loader2 className="animate-spin" size={16} /> : <ImageIcon size={16} />}
            {busy ? "Scanning…" : "Choose photo"}
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
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleImage(e.target.files[0])}
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
          {preview && (
            <div className="flex items-center gap-2 pt-1">
              <img src={preview} alt="receipt preview" className="w-12 h-16 object-cover rounded border border-ink-300" />
              <span className="text-xs text-ink-500">Preview</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
