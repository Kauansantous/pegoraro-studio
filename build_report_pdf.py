from pathlib import Path
from PIL import Image

root = Path(__file__).parent
pages_dir = root / "assets" / "reports" / "pages"
out = root / "assets" / "reports" / "property-performance-report.pdf"
files = sorted(pages_dir.glob("page-*.png"))
images = [Image.open(path).convert("RGB") for path in files]
if not images:
    raise SystemExit("Nenhuma página exportada encontrada.")
images[0].save(out, "PDF", resolution=150.0, save_all=True, append_images=images[1:])
for image in images:
    image.close()
print(out)
print(f"{len(files)} páginas")
