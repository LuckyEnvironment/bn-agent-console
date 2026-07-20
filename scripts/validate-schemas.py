#!/usr/bin/env python3
"""BN Agent — schemavalidatie (CI + lokaal).

Valideert de drie JSON-schema's (draft 2020-12), hun voorbeelden en de volledige
voorbeelddatasets. De datasets worden aangeleverd als JSON-dumps van
`node scripts/verify-data.mjs --export <dir>`.

Gebruik: python3 scripts/validate-schemas.py <export-dir>
"""
import json
import sys
from pathlib import Path

from jsonschema import Draft202012Validator

ROOT = Path(__file__).resolve().parent.parent


def load(path: Path):
    return json.loads(path.read_text())


def main() -> int:
    if len(sys.argv) != 2:
        print("gebruik: validate-schemas.py <export-dir>", file=sys.stderr)
        return 2
    export_dir = Path(sys.argv[1])
    failures = 0

    def check(validator: Draft202012Validator, data, label: str):
        nonlocal failures
        errors = list(validator.iter_errors(data))
        for e in errors[:5]:
            print(f"FAIL {label}: {'/'.join(map(str, e.path))}: {e.message[:140]}")
        failures += len(errors)
        if not errors:
            print(f"ok   {label}")

    schemas = {}
    for name in ("audit-log-entry", "agent-manifest", "connector"):
        schema = load(ROOT / "schemas" / f"{name}.schema.json")
        Draft202012Validator.check_schema(schema)
        schemas[name] = Draft202012Validator(schema)
    print("ok   drie schema's zijn geldig draft 2020-12")

    check(schemas["audit-log-entry"], load(ROOT / "schemas/examples/audit-log-entry.example.json"), "audit-log-entry.example.json")
    check(schemas["agent-manifest"], load(ROOT / "schemas/examples/agent-manifest.example.json"), "agent-manifest.example.json")
    check(schemas["connector"], load(ROOT / "schemas/examples/connector.example.json"), "connector.example.json")

    for i, entry in enumerate(load(export_dir / "audit.json")):
        check(schemas["audit-log-entry"], entry, f"audit-data entry {i} ({entry['log_header']['transaction_id']})")
    for connector in load(export_dir / "connectors.json"):
        check(schemas["connector"], connector, f"connectors-data {connector['connectorId']}")

    if failures:
        print(f"\n{failures} schemafout(en)")
        return 1
    print("\nAlle schemavalidaties geslaagd.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
