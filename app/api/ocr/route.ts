import { NextRequest, NextResponse } from "next/server";

// Cloud OCR fallback via OCR.space — useful for blurry photos where
// the in-browser Tesseract.js pipeline returns poor text.
// Set OCR_SPACE_KEY in .env for higher rate limits; defaults to the
// public "helloworld" demo key (works but rate-limited).
//
// Body: { imageBase64: string, mime?: string }
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const imageBase64: string | undefined = body.imageBase64;
  const mime: string = body.mime || "image/jpeg";
  if (!imageBase64) return NextResponse.json({ error: "imageBase64 required" }, { status: 400 });

  const key = process.env.OCR_SPACE_KEY || "helloworld";
  const form = new FormData();
  form.append("base64Image", `data:${mime};base64,${imageBase64}`);
  form.append("language", "eng");
  form.append("isTable", "true");
  form.append("scale", "true");
  form.append("OCREngine", "2");

  try {
    const r = await fetch("https://api.ocr.space/parse/image", {
      method: "POST",
      headers: { apikey: key },
      body: form,
    });
    const data = await r.json();
    if (data?.IsErroredOnProcessing) {
      return NextResponse.json(
        { error: data?.ErrorMessage?.[0] || "Cloud OCR failed" },
        { status: 502 }
      );
    }
    const text = (data?.ParsedResults || [])
      .map((p: any) => p?.ParsedText || "")
      .join("\n")
      .trim();
    if (!text) return NextResponse.json({ error: "no text recognised" }, { status: 422 });
    return NextResponse.json({ text });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "fetch failed" }, { status: 500 });
  }
}
