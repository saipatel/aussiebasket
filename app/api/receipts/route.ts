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
  if (!text) return NextResponse.json({ error: "no text" }, { status: 400 });

  const receipt = buildReceipt(text, postcode);
  if (receipt.items.length === 0) {
    return NextResponse.json({ error: "no items recognised" }, { status: 422 });
  }
  saveReceipt(receipt);
  return NextResponse.json(receipt);
}
