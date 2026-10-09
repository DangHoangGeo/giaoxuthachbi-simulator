import argparse, hashlib, json, shutil, subprocess, tempfile
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
from pypdf import PdfReader

p = argparse.ArgumentParser()
p.add_argument('pdf', type=Path)
p.add_argument('output', type=Path)
p.add_argument('--prefix', required=True)
p.add_argument('--index', type=Path)
p.add_argument('--pages', default='')
p.add_argument('--ids', default='')
args = p.parse_args()
before = hashlib.sha256(args.pdf.read_bytes()).hexdigest()
reader = PdfReader(args.pdf)
texts = [page.extract_text() or '' for page in reader.pages]
indices = {row['page']: row['sheet'] for row in json.loads(args.index.read_text())} if args.index else {}
ids = [v for v in args.ids.split(',') if v]
pages = {int(v) for v in args.pages.split(',') if v}
pages.update(i + 1 for i, text in enumerate(texts) if any(identifier in text for identifier in ids))
if not pages:
    pages = {1}
assert all(1 <= page <= len(reader.pages) for page in pages)
args.output.mkdir(parents=True, exist_ok=True)
render_dir = Path(tempfile.mkdtemp(prefix='thachbi-wing-pdf-review-'))
subprocess.run(['pdftoppm', '-png', '-r', '120', str(args.pdf), str(render_dir / 'page')], check=True)
page_images = sorted(render_dir.glob('page-*.png'))
assert len(page_images) == len(reader.pages)
font_path = Path('/Users/danghoang/Desktop/giaoxuthachbi_work/scripts/fonts/NotoSans-Regular.ttf')
font = ImageFont.truetype(str(font_path), 18)
thumb_w, thumb_h, label_h, margin, columns, per_sheet = 640, 453, 34, 16, 3, 9
contacts = []
for start in range(0, len(page_images), per_sheet):
    subset = page_images[start:start + per_sheet]
    rows = (len(subset) + columns - 1) // columns
    canvas = Image.new('RGB', (columns * (thumb_w + margin) + margin, rows * (thumb_h + label_h + margin) + margin), 'white')
    draw = ImageDraw.Draw(canvas)
    for slot, image_path in enumerate(subset):
        page_num = start + slot + 1
        x = margin + (slot % columns) * (thumb_w + margin)
        y = margin + (slot // columns) * (thumb_h + label_h + margin)
        source = Image.open(image_path).convert('RGB')
        source.thumbnail((thumb_w, thumb_h), Image.Resampling.LANCZOS)
        canvas.paste(source, (x, y))
        draw.text((x, y + thumb_h + 4), f'{args.prefix} page {page_num}  {indices.get(page_num, "")}', font=font, fill='#203c38')
    target = args.output / f'{args.prefix}-contact-{start // per_sheet + 1:02}.png'
    canvas.save(target)
    contacts.append(str(target))
selected = []
for page in sorted(pages):
    sheet = indices.get(page, f'p{page:02}')
    target = args.output / f'{args.prefix}-{sheet}.png'
    shutil.copy2(page_images[page - 1], target)
    selected.append({'page':page,'sheet':sheet,'path':str(target),'matchingIds':[v for v in ids if v in texts[page - 1]]})
assert before == hashlib.sha256(args.pdf.read_bytes()).hexdigest(), 'Renderer changed source PDF.'
result = {'pdf':str(args.pdf),'sha256':before,'pageCount':len(reader.pages),'allPageRenders':str(render_dir),'contactSheets':contacts,'selectedPages':selected,'status':'All pages rendered; source PDF byte-for-byte unchanged.'}
(args.output / f'{args.prefix}-render-index.json').write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n')
print(json.dumps(result, ensure_ascii=False, indent=2))
