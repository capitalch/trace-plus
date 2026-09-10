#!/usr/bin/env python3
"""Manual settings check for trace-server — verifies every configuration key.

Every key is derived from the Settings model, so this script has no list of its
own to keep in sync. Adding a field to app/config.py is enough for it to be
checked here.

    python scripts/check_settings.py                          # check every key
    python scripts/check_settings.py --compare-old <path>     # parity vs the old config.py

Secret values are never printed: a secret reports as set/missing and by length
only, and the parity mode prints MATCH or DIFFERS with no values either side.

Exit codes: 0 all checks passed, 1 one or more failed, 2 settings could not be
imported at all — usually a missing .env or a required key with no value.

Needs no test framework and no third-party import beyond the app's own settings.
Runs from any working directory.
"""

from __future__ import annotations

import argparse
import ast
import sys
from pathlib import Path
from pydantic import SecretStr, ValidationError

SERVER_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(SERVER_DIR))

GREEN, RED, DIM, RESET = "\033[32m", "\033[31m", "\033[2m", "\033[0m"
if not sys.stdout.isatty():
    GREEN = RED = DIM = RESET = ""

_failures: list[str] = []
_passes = 0


def check(ok: bool, label: str, detail: str = "") -> None:
    global _passes
    if ok:
        _passes += 1
        print(f"  {GREEN}PASS{RESET}  {label:36} {DIM}{detail}{RESET}")
    else:
        _failures.append(f"{label}: {detail}")
        print(f"  {RED}FAIL{RESET}  {label:36} {detail}")


def section(title: str) -> None:
    print(f"\n{title}\n" + "-" * len(title))


def is_secret(field) -> bool:
    return field.annotation is SecretStr


def load_settings():
    try:
        from app.config import Settings, settings  # noqa: PLC0415

        return Settings, settings
    except ValidationError as exc:
        # Never print the exception itself: for a missing field pydantic reports
        # input_value= the whole parsed .env dict, i.e. every other secret in it.
        # Only field names and messages are safe to show.
        print(f"\n{RED}Settings failed to validate{RESET}")
        for err in exc.errors(include_url=False):
            field = ".".join(str(part) for part in err["loc"]) or "(model)"
            print(f"  {RED}{field}{RESET}: {err['msg']}")
        _explain_env()
        sys.exit(2)
    except Exception as exc:
        print(f"\n{RED}Could not import app.config{RESET}\n  {type(exc).__name__}: {exc}")
        _explain_env()
        sys.exit(2)


def _explain_env() -> None:
    env = SERVER_DIR / ".env"
    print(
        f"\nExpected .env at {env} ({'present' if env.exists() else 'NOT FOUND'})."
        "\nUsual causes: .env missing, a REQUIRED key absent, or a key still set to"
        " the .env.example placeholder."
    )


def check_files() -> None:
    section("Files")
    for name in (".env", ".env.example"):
        path = SERVER_DIR / name
        check(path.exists(), f"{name} present", str(path) if path.exists() else "not found")


def check_keys(Settings, settings) -> None:
    """pydantic has already enforced types and required-ness by the time we get here.
    What it cannot know is whether a value is blank, so that is what this checks."""
    section(f"Keys ({len(Settings.model_fields)})")
    for name, field in Settings.model_fields.items():
        value = getattr(settings, name, None)
        secret = is_secret(field)
        raw = value.get_secret_value() if isinstance(value, SecretStr) else value

        if value is None:
            check(False, name, "is None")
        elif isinstance(raw, str) and not raw.strip():
            check(False, name, "empty")
        elif secret:
            check(True, name, f"secret set ({len(raw)} chars)")
        else:
            check(True, name, f"{type(raw).__name__} = {raw!r}")


def check_template(Settings) -> None:
    section(".env.example parity")
    example = SERVER_DIR / ".env.example"
    if not example.exists():
        check(False, ".env.example", "not found — run scripts/gen_env_example.py")
        return

    documented = {
        line.split("=", 1)[0].strip().lower()
        for line in example.read_text(encoding="utf-8").splitlines()
        if line.strip() and not line.lstrip().startswith("#") and "=" in line
    }
    defined = set(Settings.model_fields)

    missing = sorted(defined - documented)
    stale = sorted(documented - defined)
    hint = " — run scripts/gen_env_example.py"

    check(not missing, "every key documented", (", ".join(missing) + hint) if missing else f"{len(defined)} keys")
    check(not stale, "no stale keys", (", ".join(stale) + hint) if stale else "")


def compare_old(path: Path, Settings, settings) -> None:
    """Parity against the pre-migration config.py. Prints MATCH/DIFFERS, never values."""
    section(f"Parity with {path.name}")
    if not path.exists():
        check(False, "old config", f"not found at {path}")
        return

    old: dict[str, object] = {}
    for node in ast.walk(ast.parse(path.read_text(encoding="utf-8"))):
        targets = node.targets if isinstance(node, ast.Assign) else (
            [node.target] if isinstance(node, ast.AnnAssign) else []
        )
        if targets and isinstance(getattr(node, "value", None), ast.Constant):
            name = getattr(targets[0], "id", "")
            if name.isupper():
                old[name.lower()] = node.value.value

    if not old:
        check(False, "old config", "no upper-case constants found")
        return

    for name, field in Settings.model_fields.items():
        if name not in old:
            print(f"        {DIM}{name}: new key, not in the old file{RESET}")
            continue
        # the old file stored some numbers as strings; compare on string form
        current = getattr(settings, name, None)
        if isinstance(current, SecretStr):
            current = current.get_secret_value()
        same = str(old[name]) == str(current)
        check(same, name, "MATCH" if same else "DIFFERS")

    dropped = sorted(set(old) - set(Settings.model_fields))
    if dropped:
        print(f"        {DIM}in old file, not migrated: {', '.join(dropped)}{RESET}")


def main() -> int:
    parser = argparse.ArgumentParser(description="Check every trace-server settings key.")
    parser.add_argument("--compare-old", metavar="PATH", help="pre-migration config.py to compare against")
    args = parser.parse_args()

    print(f"trace-server settings check\nserver dir: {SERVER_DIR}")

    check_files()
    Settings, settings = load_settings()
    check_keys(Settings, settings)
    check_template(Settings)
    if args.compare_old:
        compare_old(Path(args.compare_old).resolve(), Settings, settings)

    section("Summary")
    if _failures:
        print(f"  {RED}{len(_failures)} failed{RESET}, {_passes} passed")
        for f in _failures:
            print(f"    - {f}")
        return 1
    print(f"  {GREEN}all {_passes} checks passed{RESET}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
