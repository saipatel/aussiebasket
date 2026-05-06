"use client";

// Extracts text from a PDF file using pdf.js, entirely in-browser.
// Worker loaded from CDN to avoid bundling complexity.
export async function extractPdfText(
  file: File,
  onProgress?: (pct: number, status: string) => void
): Promise<string> {
  onProgress?.(5, "loading PDF engine");
  const pdfjs: any = await import("pdfjs-dist/build/pdf");
  pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

  const buf = await file.arrayBuffer();
  onProgress?.(15, "reading document");
  const doc = await pdfjs.getDocument({ data: buf }).promise;

  const lines: string[] = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();

    // Group items by Y position to reconstruct lines
    const rows = new Map<number, Array<{ x: number; str: string }>>();
    for (const item of content.items as any[]) {
      const y = Math.round(item.transform[5]);
      const x = item.transform[4];
      if (!rows.has(y)) rows.set(y, []);
      rows.get(y)!.push({ x, str: item.str });
    }

    const sorted = [...rows.entries()].sort((a, b) => b[0] - a[0]); // top → bottom
    for (const [, items] of sorted) {
      items.sort((a, b) => a.x - b.x);
      const line = items.map((i) => i.str).join(" ").replace(/\s+/g, " ").trim();
      if (line) lines.push(line);
    }

    onProgress?.(15 + Math.round((i / doc.numPages) * 80), `page ${i}/${doc.numPages}`);
  }

  onProgress?.(100, "done");
  return lines.join("\n");
}
