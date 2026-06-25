from __future__ import annotations

import argparse
import json
import sys
import time
from pathlib import Path


def configure_paths(ocr_site_arg: str | None) -> None:
    script_dir = Path(__file__).resolve().parent
    project_root = script_dir.parent.parent

    candidates = []
    if ocr_site_arg:
        candidates.append(Path(ocr_site_arg))
    candidates.append(project_root / ".tools" / "ocr-site")

    for candidate in candidates:
        if candidate and candidate.exists():
            sys.path.insert(0, str(candidate.resolve()))


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--pdf", required=True)
    parser.add_argument("--out", required=True)
    parser.add_argument("--ocr-site")
    parser.add_argument("--scale", type=float, default=1.0)
    parser.add_argument("--max-pages", type=int, default=0)
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    configure_paths(args.ocr_site)

    import numpy as np
    import pypdfium2 as pdfium
    from rapidocr_onnxruntime import RapidOCR

    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")

    pdf_path = Path(args.pdf)
    out_path = Path(args.out)
    out_path.parent.mkdir(parents=True, exist_ok=True)

    pdf = pdfium.PdfDocument(str(pdf_path))
    total_pages = len(pdf)
    page_limit = total_pages if args.max_pages <= 0 else min(total_pages, args.max_pages)
    ocr = RapidOCR()

    parts: list[str] = []
    nonempty_pages = 0
    started_at = time.time()

    for page_index in range(page_limit):
        page = pdf[page_index]
        bitmap = page.render(scale=args.scale)
        image = bitmap.to_pil()
        result, _ = ocr(np.array(image))

        page_lines = []
        for item in result or []:
            if len(item) < 2:
                continue
            text = str(item[1]).strip()
            if text:
                page_lines.append(text)

        page_text = "\n".join(page_lines).strip()
        if page_text:
            nonempty_pages += 1
            parts.append(f"[[PDF OCR Page: {page_index + 1}]]\n\n{page_text}")

        if page_index > 0 and page_index % 25 == 0:
            elapsed = round(time.time() - started_at, 1)
            print(f"Processed {page_index + 1}/{page_limit} pages in {elapsed}s", file=sys.stderr, flush=True)

    output_text = "\n\n".join(parts).strip()
    if output_text:
        out_path.write_text(f"{output_text}\n", encoding="utf-8")
    else:
        out_path.write_text("", encoding="utf-8")

    summary = {
        "pdf": str(pdf_path),
        "out": str(out_path),
        "pageCount": total_pages,
        "processedPages": page_limit,
        "nonemptyPages": nonempty_pages,
        "scale": args.scale,
        "charCount": len(output_text),
        "elapsedSeconds": round(time.time() - started_at, 2),
    }
    print(json.dumps(summary, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
