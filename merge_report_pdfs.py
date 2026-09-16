from pathlib import Path
from pypdf import PdfReader, PdfWriter

root = Path(__file__).parent
parts = sorted((root / "assets" / "reports" / "source-pdfs").glob("part-*.pdf"))
writer = PdfWriter()
for part in parts:
    reader = PdfReader(str(part))
    for page in reader.pages:
        writer.add_page(page)
out = root / "assets" / "reports" / "property-performance-report.pdf"
with out.open("wb") as fh:
    writer.write(fh)
print(f"{len(parts)} PDFs mesclados em {out}")
