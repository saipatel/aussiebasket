import { NextRequest, NextResponse } from "next/server";
import { getReceipts, saveReceipt } from "@/lib/db";
import { buildReceipt, sampleReceiptText } from "@/lib/parser";
import { Store } from "@/lib/types";

export async function GET() {
  return NextResponse.json(getReceipts());
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  let text: string = body.text ?? "";
  const postcode: string | undefined = body.postcode;
  const store: Store | undefined = body.store;

  if (!text && body.demo) text = sampleReceiptText(store ?? "Coles");
  if (!text || !text.trim()) return NextResponse.json({ error: "Receipt text is empty." }, { status: 400 });

  const built = buildReceipt(text, postcode);

  // Strip diagnostics off the saved record but include them in the response
  const { unmatched, rawLines, ...receipt } = built as any;

  if (receipt.items.length === 0) {
    return NextResponse.json(
      {
        error: "We couldn't recognise any products on this receipt.",
        hint: "The OCR text is in the textarea — try editing item names to be clearer (e.g. 'Milk 2L 3.40') and resubmit.",
        rawLines,
        unmatched,
      },
      { status: 422 }
    );
  }

  saveReceipt(receipt);
  return NextResponse.json({ ...receipt, unmatched, rawLines });
}
