"""Exporta, valida, publica y versiona los picks públicos de Picks Pro."""

from __future__ import annotations

import json
import math
import os
import shutil
import subprocess
import sys
from pathlib import Path
from typing import Any


PRIVATE_ROOT = Path(r"C:\Users\Usuario\Desktop\ligas_10")
EXPORTER = PRIVATE_ROOT / "scripts" / "export_public_picks.py"
SOURCE = PRIVATE_ROOT / "public_export" / "public_picks.json"

PROJECT_ROOT = Path(__file__).resolve().parent.parent
DESTINATION = PROJECT_ROOT / "public" / "data" / "public_picks.json"
DESTINATION_GIT_PATH = "public/data/public_picks.json"

REQUIRED_FIELDS = {
    "id",
    "fecha",
    "liga",
    "local",
    "visitante",
    "mercado",
    "seleccion",
    "cuota",
    "probabilidad",
    "ev",
    "categoria",
    "estado",
}
REQUIRED_TEXT_FIELDS = {
    "fecha",
    "liga",
    "local",
    "visitante",
    "mercado",
    "seleccion",
    "categoria",
    "estado",
}


def run(command: list[str], *, cwd: Path) -> subprocess.CompletedProcess[str]:
    """Ejecuta un comando mostrando su salida y deteniéndose si falla."""
    print(f"> {' '.join(command)}")
    return subprocess.run(command, cwd=cwd, check=True, text=True)


def executable(name: str) -> str:
    resolved = shutil.which(name)
    if resolved is None:
        raise FileNotFoundError(f"No se encontró el ejecutable requerido: {name}")
    return resolved


def exporter_python() -> str:
    private_python = PRIVATE_ROOT / ".venv" / "Scripts" / "python.exe"
    return str(private_python) if private_python.is_file() else sys.executable


def validate_pick(pick: Any, index: int) -> None:
    if not isinstance(pick, dict):
        raise ValueError(f"El pick {index} no es un objeto JSON.")

    missing_fields = REQUIRED_FIELDS - pick.keys()
    if missing_fields:
        missing = ", ".join(sorted(missing_fields))
        raise ValueError(f"El pick {index} no contiene estos campos: {missing}")

    if isinstance(pick["id"], bool) or not isinstance(pick["id"], (int, str)):
        raise ValueError(f"El pick {index} tiene un id inválido.")
    if isinstance(pick["id"], str) and not pick["id"].strip():
        raise ValueError(f"El pick {index} tiene un id vacío.")

    for field in REQUIRED_TEXT_FIELDS:
        if not isinstance(pick[field], str) or not pick[field].strip():
            raise ValueError(f"El pick {index} tiene un campo {field!r} inválido.")

    for field in ("cuota", "probabilidad", "ev"):
        value = pick[field]
        if isinstance(value, bool) or not isinstance(value, (int, float)):
            raise ValueError(f"El pick {index} tiene un campo {field!r} no numérico.")
        if not math.isfinite(float(value)):
            raise ValueError(f"El pick {index} tiene un campo {field!r} no finito.")

    if pick["cuota"] <= 0:
        raise ValueError(f"El pick {index} debe tener una cuota mayor que cero.")
    if not 0 <= pick["probabilidad"] <= 100:
        raise ValueError(f"El pick {index} tiene una probabilidad fuera de rango.")


def read_and_validate_source() -> tuple[list[dict[str, Any]], bytes]:
    if not SOURCE.is_file():
        raise FileNotFoundError(f"No existe el JSON exportado: {SOURCE}")

    source_bytes = SOURCE.read_bytes()
    source_text = source_bytes.decode("utf-8")
    picks = json.loads(source_text)

    if not isinstance(picks, list) or not picks:
        raise ValueError("El JSON exportado debe contener al menos un pick.")

    for index, pick in enumerate(picks, start=1):
        validate_pick(pick, index)

    return picks, source_bytes


def copy_atomically(source_bytes: bytes) -> None:
    DESTINATION.parent.mkdir(parents=True, exist_ok=True)
    temporary = DESTINATION.with_suffix(f"{DESTINATION.suffix}.tmp")
    try:
        temporary.write_bytes(source_bytes)
        os.replace(temporary, DESTINATION)
    finally:
        temporary.unlink(missing_ok=True)


def json_has_git_changes(git: str) -> bool:
    comparison = subprocess.run(
        [git, "diff", "--quiet", "HEAD", "--", DESTINATION_GIT_PATH],
        cwd=PROJECT_ROOT,
        check=False,
    )
    if comparison.returncode == 0:
        return False
    if comparison.returncode == 1:
        return True
    raise subprocess.CalledProcessError(comparison.returncode, comparison.args)


def print_summary(summary: dict[str, Any]) -> None:
    print("\nResumen final")
    for field in ("exported", "copied", "total_picks", "build_ok", "committed", "pushed"):
        value = summary[field]
        if isinstance(value, bool):
            value = str(value).lower()
        print(f"{field}: {value}")


def main() -> int:
    summary: dict[str, Any] = {
        "exported": False,
        "copied": False,
        "total_picks": 0,
        "build_ok": False,
        "committed": False,
        "pushed": False,
    }

    try:
        if not EXPORTER.is_file():
            raise FileNotFoundError(f"No existe el exportador privado: {EXPORTER}")

        run([exporter_python(), str(EXPORTER)], cwd=PRIVATE_ROOT)
        summary["exported"] = True

        picks, source_bytes = read_and_validate_source()
        summary["total_picks"] = len(picks)

        copy_atomically(source_bytes)
        summary["copied"] = True

        npm = executable("npm.cmd" if os.name == "nt" else "npm")
        run([npm, "run", "build"], cwd=PROJECT_ROOT)
        summary["build_ok"] = True

        git = executable("git")
        run([git, "status", "--short", "--branch"], cwd=PROJECT_ROOT)

        if not json_has_git_changes(git):
            print("El JSON público no ha cambiado; no se crea commit ni se ejecuta push.")
            return 0

        run([git, "add", DESTINATION_GIT_PATH], cwd=PROJECT_ROOT)
        run(
            [git, "commit", "-m", "Update public picks", "--", DESTINATION_GIT_PATH],
            cwd=PROJECT_ROOT,
        )
        summary["committed"] = True

        run([git, "push"], cwd=PROJECT_ROOT)
        summary["pushed"] = True
        return 0
    except (
        FileNotFoundError,
        UnicodeDecodeError,
        json.JSONDecodeError,
        ValueError,
        subprocess.CalledProcessError,
    ) as error:
        print(f"Error: {error}", file=sys.stderr)
        return 1
    finally:
        print_summary(summary)


if __name__ == "__main__":
    raise SystemExit(main())
