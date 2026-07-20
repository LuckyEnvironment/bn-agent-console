#!/usr/bin/env python3
"""BN Agent — headless renderchecks (CI + lokaal).

Serveert de repo lokaal, rendert elke JS-gedreven pagina in headless Chrome en
controleert (a) dat kerninhoud aanwezig is en (b) dat er geen console-errors
optreden. Externe fonthosts worden geblokkeerd zodat de check hermetisch is.

Gebruik: python3 scripts/render-check.py
Omgeving: CHROME=<pad naar chrome/chromium> (anders autodetectie).
"""
import os
import shutil
import subprocess
import sys
import time

PORT = 8123
BASE = f"http://localhost:{PORT}"
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

PAGES = [
    ("/index.html", ["BN Agent", "Connectors"]),
    ("/bn-agent-registry-preview.html", ["19 van 19 agents", "Zorgtriage Agent", "Huurindexatie Agent"]),
    ("/bn-agent-connectors.html", ["11 van 11 connectors", "KVK Handelsregister API", "DigiD", "Gebruikt door"]),
    ("/bn-agent-agent-detail.html?id=bna:agent:kyc-screen-004",
     ["AGENT CARD v2.0", "Connectors — gecertificeerde systeemkoppelingen", "KVK Handelsregister API"]),
    ("/bn-agent-agent-detail.html?id=bna:agent:huurindex-063", ["GEBROKEN", "geschorst"]),
    ("/bn-agent-agent-detail.html?id=bna:agent:decl-check-042", ["geen gecertificeerde systeemconnectors"]),
    ("/bn-agent-check.html?id=bna:agent:huurindex-063", ["Certificaat ongeldig"]),
    ("/bn-agent-check.html?id=bna:agent:kyc-screen-004", ["Certificaat geldig"]),
    ("/bn-agent-audit-trail.html", ["tx-baa-2026-8838711", "ketenverificatie"]),
    ("/bn-agent-console.html", ["Dashboard", "Systeemconnectors"]),
    ("/bn-agent-console.html#/systeemconnectors", ["Connectorcatalogus (demo)", "bnc:connector:digid"]),
    ("/bn-agent-docs.html", ["Agent Card Standaard v2.0", "Connectors API", "connector.schema.json"]),
    ("/bn-agent-certificering.html", ["Agent Card Standaard v2.0"]),
    ("/bn-agent-landingpage.html",
     ["agent-card.json", "Check een agent", "agents in registry", "systeemconnectors"]),
]


def find_chrome() -> str:
    for candidate in (os.environ.get("CHROME"), "google-chrome", "chromium-browser",
                      "chromium", "/opt/pw-browsers/chromium"):
        if candidate and shutil.which(candidate):
            return candidate
        if candidate and os.path.isfile(candidate) and os.access(candidate, os.X_OK):
            return candidate
    print("FAIL: geen Chrome/Chromium gevonden (zet CHROME=<pad>)", file=sys.stderr)
    sys.exit(2)


def main() -> int:
    chrome = find_chrome()
    server = subprocess.Popen(
        [sys.executable, "-m", "http.server", str(PORT)],
        cwd=ROOT, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
    )
    time.sleep(1)
    failures = 0
    try:
        for path, needles in PAGES:
            r = subprocess.run(
                [chrome, "--headless", "--no-sandbox", "--disable-gpu",
                 "--virtual-time-budget=3500", "--enable-logging=stderr", "--dump-dom",
                 "--host-resolver-rules=MAP fonts.googleapis.com 127.0.0.1, MAP fonts.gstatic.com 127.0.0.1",
                 BASE + path],
                capture_output=True, text=True, timeout=90,
            )
            dom = r.stdout
            errors = [
                line for line in r.stderr.splitlines()
                if ":ERROR:CONSOLE" in line
                and "fonts.g" not in line and "ERR_CONNECTION_REFUSED" not in line
            ]
            missing = [n for n in needles if n not in dom]
            for n in missing:
                print(f"FAIL {path}: inhoud ontbreekt: {n!r}")
            for e in errors[:4]:
                print(f"FAIL {path}: console: {e[:200]}")
            failures += len(missing) + len(errors)
            if not missing and not errors:
                print(f"ok   {path}")
    finally:
        server.terminate()
    if failures:
        print(f"\n{failures} renderfout(en)")
        return 1
    print("\nAlle renderchecks geslaagd.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
