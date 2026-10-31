#!/usr/bin/env python3
"""Convert chapter diagrams from PNG to WebP and repoint the Markdown links.

PNG diagrams are 1-2 MB each; the same image as WebP (quality 82) is ~10x
smaller with no visible loss, which matters on mobile and in the offline cache.

    python tools/png-to-webp.py diagrams/dl16_vit_ai.png [more.png ...]
    python tools/png-to-webp.py --glob "diagrams/dl16*_ai.png"
    python tools/png-to-webp.py --glob "diagrams/dl16*_ai.png" --check

For each PNG: writes <name>.webp next to it, rewrites every
`](diagrams/<name>.png)` reference in content/*.md to `.webp`, then deletes
the PNG (pass --keep to keep it). --check only scans chapter links and
exits 1 if any reference matching the given files or glob still ends in .png.

tools/generate-diagrams.js still writes PNG; run this script on its output.
Requires Pillow (pip install pillow).
"""
import argparse
import glob
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CONTENT = os.path.join(ROOT, "content")


def chapter_files():
    return sorted(glob.glob(os.path.join(CONTENT, "*.md")))


def rewrite_refs(rel_png, rel_webp):
    changed = []
    for path in chapter_files():
        with open(path, encoding="utf-8") as f:
            text = f.read()
        new = text.replace(f"]({rel_png})", f"]({rel_webp})")
        if new != text:
            with open(path, "w", encoding="utf-8", newline="") as f:
                f.write(new)
            changed.append(os.path.basename(path))
    return changed


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("pngs", nargs="*", help="PNG files, relative to the repo root")
    ap.add_argument("--glob", help='glob for PNGs, e.g. "diagrams/dl16*_ai.png"')
    ap.add_argument("--quality", type=int, default=82)
    ap.add_argument("--keep", action="store_true", help="keep the PNG after converting")
    ap.add_argument("--check", action="store_true", help="report only; exit 1 if PNG refs remain")
    args = ap.parse_args()

    pngs = list(args.pngs)
    if args.glob:
        pngs += [os.path.relpath(p, ROOT) for p in glob.glob(os.path.join(ROOT, args.glob))]
    pngs = sorted({p.replace("\\", "/") for p in pngs})

    if args.check:
        # Check chapter links, not files on disk: after conversion the PNGs are gone.
        import fnmatch
        import re
        patterns = [args.glob] if args.glob else pngs
        remaining = []
        for path in chapter_files():
            with open(path, encoding="utf-8") as f:
                for ref in re.findall(r"\]\((diagrams/[^)]+\.png)\)", f.read()):
                    if any(fnmatch.fnmatch(ref, p.replace("\\", "/")) for p in patterns):
                        remaining.append(f"{os.path.basename(path)} -> {ref}")
        print("\n".join(remaining) if remaining else "no matching PNG references left in content/")
        sys.exit(1 if remaining else 0)

    if not pngs:
        ap.error("no PNG files given")

    from PIL import Image

    total_before = total_after = 0
    for rel_png in pngs:
        src = os.path.join(ROOT, rel_png)
        if not os.path.exists(src):
            print(f"skip (missing): {rel_png}")
            continue
        rel_webp = rel_png[:-4] + ".webp"
        dst = os.path.join(ROOT, rel_webp)
        with Image.open(src) as im:
            im.save(dst, "WEBP", quality=args.quality, method=6)
        before, after = os.path.getsize(src), os.path.getsize(dst)
        total_before += before
        total_after += after
        files = rewrite_refs(rel_png, rel_webp)
        if not args.keep:
            os.remove(src)
        print(f"{rel_png}: {before // 1024} KB -> {after // 1024} KB; links updated in {', '.join(files) or 'no chapters'}")
    if total_before:
        print(f"total {total_before / 1048576:.1f} MB -> {total_after / 1048576:.2f} MB")


if __name__ == "__main__":
    main()
