"""Exporta, valida, publica y versiona los datos públicos de Picks Pro."""

from __future__ import annotations

import argparse
import json
import math
import os
import shutil
import subprocess
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Any


PRIVATE_ROOT = Path(r"C:\Users\Usuario\Desktop\ligas_10")
PROJECT_ROOT = Path(__file__).resolve().parent.parent
REQUIRED_FIELDS = {
    "id", "fecha", "liga", "local", "visitante", "mercado", "seleccion",
    "cuota", "probabilidad", "ev", "categoria", "estado",
}
REQUIRED_TEXT_FIELDS = {
    "fecha", "liga", "local", "visitante", "mercado", "seleccion", "categoria", "estado",
}
ACTIVE_STATUSES = {"pending", "pendiente", "active"}
RESULT_STATUSES = {"won", "lost", "push", "void", "canceled"}


@dataclass(frozen=True)
class PublicDataset:
    name: str
    exporter: Path
    source: Path
    destination: Path
    git_path: str
    allowed_statuses: set[str]


DATASETS = (
    PublicDataset(
        "picks",
        PRIVATE_ROOT / "scripts" / "export_public_picks.py",
        PRIVATE_ROOT / "public_export" / "public_picks.json",
        PROJECT_ROOT / "public" / "data" / "public_picks.json",
        "public/data/public_picks.json",
        ACTIVE_STATUSES,
    ),
    PublicDataset(
        "results",
        PRIVATE_ROOT / "scripts" / "export_public_results.py",
        PRIVATE_ROOT / "public_export" / "public_results.json",
        PROJECT_ROOT / "public" / "data" / "public_results.json",
        "public/data/public_results.json",
        RESULT_STATUSES,
    ),
)


def run(command: list[str], *, cwd: Path) -> subprocess.CompletedProcess[str]:
    print(f"> {' '.join(command)}", flush=True)
    return subprocess.run(command, cwd=cwd, check=True, text=True)


def executable(name: str) -> str:
    resolved = shutil.which(name)
    if resolved is None:
        raise FileNotFoundError(f"No se encontró el ejecutable requerido: {name}")
    return resolved


def exporter_python() -> str:
    private_python = PRIVATE_ROOT / ".venv" / "Scripts" / "python.exe"
    return str(private_python) if private_python.is_file() else sys.executable


def validate_record(record: Any, index: int, dataset: PublicDataset) -> None:
    label = f"{dataset.name}[{index}]"
    if not isinstance(record, dict):
        raise ValueError(f"{label} no es un objeto JSON.")

    missing = REQUIRED_FIELDS - record.keys()
    if missing:
        raise ValueError(f"{label} no contiene estos campos: {', '.join(sorted(missing))}")

    if isinstance(record["id"], bool) or not isinstance(record["id"], (int, str)):
        raise ValueError(f"{label} tiene un id inválido.")
    if isinstance(record["id"], str) and not record["id"].strip():
        raise ValueError(f"{label} tiene un id vacío.")

    for field in REQUIRED_TEXT_FIELDS:
        if not isinstance(record[field], str) or not record[field].strip():
            raise ValueError(f"{label} tiene un campo {field!r} inválido.")

    normalized_status = record["estado"].strip().lower()
    if normalized_status not in dataset.allowed_statuses:
        raise ValueError(f"{label} tiene un estado no permitido: {record['estado']!r}")

    for field in ("cuota", "probabilidad", "ev"):
        value = record[field]
        if isinstance(value, bool) or not isinstance(value, (int, float)):
            raise ValueError(f"{label} tiene un campo {field!r} no numérico.")
        if not math.isfinite(float(value)):
            raise ValueError(f"{label} tiene un campo {field!r} no finito.")

    if record["cuota"] <= 0:
        raise ValueError(f"{label} debe tener una cuota mayor que cero.")
    if not 0 <= record["probabilidad"] <= 100:
        raise ValueError(f"{label} tiene una probabilidad fuera de rango.")


def read_and_validate(dataset: PublicDataset) -> tuple[list[dict[str, Any]], bytes]:
    if not dataset.source.is_file():
        raise FileNotFoundError(f"No existe el JSON exportado: {dataset.source}")

    source_bytes = dataset.source.read_bytes()
    records = json.loads(source_bytes.decode("utf-8"))
    if not isinstance(records, list) or not records:
        raise ValueError(f"El JSON {dataset.name} debe contener al menos un registro.")

    for index, record in enumerate(records, start=1):
        validate_record(record, index, dataset)
    return records, source_bytes


def copy_atomically(dataset: PublicDataset, source_bytes: bytes) -> None:
    dataset.destination.parent.mkdir(parents=True, exist_ok=True)
    temporary = dataset.destination.with_suffix(f"{dataset.destination.suffix}.tmp")
    try:
        temporary.write_bytes(source_bytes)
        os.replace(temporary, dataset.destination)
    finally:
        temporary.unlink(missing_ok=True)


def changed_git_paths(git: str) -> list[str]:
    paths = [dataset.git_path for dataset in DATASETS]
    status = subprocess.run(
        [git, "status", "--porcelain", "--", *paths],
        cwd=PROJECT_ROOT,
        check=True,
        capture_output=True,
        text=True,
    )
    changed: list[str] = []
    for line in status.stdout.splitlines():
        path = line[3:].strip().strip('"')
        if path in paths:
            changed.append(path)
    return changed


def print_summary(summary: dict[str, Any]) -> None:
    print("\nResumen final")
    fields = (
        "exported", "copied", "total_picks", "total_results", "build_ok",
        "committed", "pushed", "git_skipped",
    )
    for field in fields:
        value = summary[field]
        if isinstance(value, bool):
            value = str(value).lower()
        print(f"{field}: {value}")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--no-git",
        action="store_true",
        help="valida export, copia y build sin crear commit ni ejecutar push",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    summary: dict[str, Any] = {
        "exported": False,
        "copied": False,
        "total_picks": 0,
        "total_results": 0,
        "build_ok": False,
        "committed": False,
        "pushed": False,
        "git_skipped": args.no_git,
    }

    try:
        for dataset in DATASETS:
            if not dataset.exporter.is_file():
                raise FileNotFoundError(f"No existe el exportador privado: {dataset.exporter}")
            run([exporter_python(), str(dataset.exporter)], cwd=PRIVATE_ROOT)
        summary["exported"] = True

        for dataset in DATASETS:
            records, source_bytes = read_and_validate(dataset)
            summary[f"total_{dataset.name}"] = len(records)
            copy_atomically(dataset, source_bytes)
        summary["copied"] = True

        npm = executable("npm.cmd" if os.name == "nt" else "npm")
        run([npm, "run", "build"], cwd=PROJECT_ROOT)
        summary["build_ok"] = True

        git = executable("git")
        run([git, "status", "--short", "--branch"], cwd=PROJECT_ROOT)
        changed_paths = changed_git_paths(git)

        if args.no_git:
            print("Modo --no-git: no se crea commit ni se ejecuta push.")
            return 0
        if not changed_paths:
            print("Los JSON públicos no han cambiado; no se crea commit ni se ejecuta push.")
            return 0

        run([git, "add", *changed_paths], cwd=PROJECT_ROOT)
        run([git, "commit", "-m", "Update public picks and results", "--", *changed_paths], cwd=PROJECT_ROOT)
        summary["committed"] = True
        run([git, "push"], cwd=PROJECT_ROOT)
        summary["pushed"] = True
        return 0
    except (
        FileNotFoundError, UnicodeDecodeError, json.JSONDecodeError, ValueError,
        subprocess.CalledProcessError,
    ) as error:
        print(f"Error: {error}", file=sys.stderr)
        return 1
    finally:
        print_summary(summary)


if __name__ == "__main__":
    raise SystemExit(main())
