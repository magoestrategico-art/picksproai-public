"""Actualiza el JSON público local desde el export de Picks Pro."""

from __future__ import annotations

import json
import sys
from pathlib import Path


SOURCE = Path(r"C:\Users\Usuario\Desktop\ligas_10\public_export\public_picks.json")
PROJECT_ROOT = Path(__file__).resolve().parent.parent
DESTINATION = PROJECT_ROOT / "public" / "data" / "public_picks.json"


def update_public_data() -> int:
    if not SOURCE.is_file():
        raise FileNotFoundError(f"No existe el JSON de origen: {SOURCE}")

    with SOURCE.open("r", encoding="utf-8") as source_file:
        picks = json.load(source_file)

    if not isinstance(picks, list):
        raise ValueError("El JSON de origen debe contener una lista de picks.")

    DESTINATION.parent.mkdir(parents=True, exist_ok=True)
    with DESTINATION.open("w", encoding="utf-8", newline="\n") as destination_file:
        json.dump(picks, destination_file, ensure_ascii=False, indent=2)
        destination_file.write("\n")

    print(f"total_picks: {len(picks)}")
    print(f"origen: {SOURCE}")
    print(f"destino: {DESTINATION}")
    return len(picks)


if __name__ == "__main__":
    try:
        update_public_data()
    except (FileNotFoundError, UnicodeDecodeError, json.JSONDecodeError, ValueError) as error:
        print(f"Error: {error}", file=sys.stderr)
        raise SystemExit(1) from error
