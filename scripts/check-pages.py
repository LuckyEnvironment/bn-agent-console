#!/usr/bin/env python3
"""BN Agent — pagina-checks zonder browser (CI + lokaal).

1. `node --check` op alle asset-JS en alle inline <script>-blokken.
2. Interne links: elke href/src die naar een lokaal bestand wijst moet bestaan
   (JS-template-expressies zoals ${...} worden overgeslagen).

Gebruik: python3 scripts/check-pages.py
"""
import glob
import pathlib
import re
import subprocess
import sys
import tempfile

ROOT = pathlib.Path(__file__).resolve().parent.parent


def main() -> int:
    failures = 0
    tmp = pathlib.Path(tempfile.mkdtemp(prefix="bn-inline-"))

    for js in sorted(glob.glob(str(ROOT / "assets/*.js"))):
        r = subprocess.run(["node", "--check", js], capture_output=True, text=True)
        if r.returncode:
            print(f"FAIL {js}: {r.stderr[:200]}")
            failures += 1
        else:
            print(f"ok   {pathlib.Path(js).relative_to(ROOT)}")

    for html in sorted(glob.glob(str(ROOT / "*.html"))):
        text = pathlib.Path(html).read_text()
        name = pathlib.Path(html).name
        for i, m in enumerate(re.finditer(r"<script(?![^>]*src=)[^>]*>(.*?)</script>", text, re.S)):
            body = m.group(1).strip()
            if not body:
                continue
            snippet = tmp / f"{name}.{i}.js"
            snippet.write_text(body)
            r = subprocess.run(["node", "--check", str(snippet)], capture_output=True, text=True)
            if r.returncode:
                print(f"FAIL {name} inline#{i}: {r.stderr[:300]}")
                failures += 1
            else:
                print(f"ok   {name} inline#{i}")

    known = {
        str(pathlib.Path(p).relative_to(ROOT))
        for pattern in ("*.html", "*.pdf", "assets/*", "schemas/*", "schemas/examples/*")
        for p in glob.glob(str(ROOT / pattern))
    }
    for html in sorted(glob.glob(str(ROOT / "*.html"))):
        text = pathlib.Path(html).read_text()
        name = pathlib.Path(html).name
        for href in re.findall(r'(?:href|src)="([^"]+)"', text):
            if href.startswith(("http", "data:", "#", "mailto:")) or "${" in href:
                continue
            base = href.split("?")[0].split("#")[0]
            if base and base not in known:
                print(f"FAIL {name} -> dode link {href}")
                failures += 1
    print("ok   interne links gescand")

    if failures:
        print(f"\n{failures} paginafout(en)")
        return 1
    print("\nAlle pagina-checks geslaagd.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
