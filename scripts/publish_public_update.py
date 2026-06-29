"""Exporta, valida, publica y versiona los datos publicos de Picks Pro."""

from __future__ import annotations

import argparse
import json
import math
import os
import shutil
import stat
import subprocess
import sys
import tempfile
import time
import traceback
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
STALE_TEMP_SECONDS = 5 * 60
COPY_ATTEMPTS = 3
COPY_RETRY_SECONDS = 1


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


def print_traceback() -> None:
    print("Traceback completo:", file=sys.stderr)
    traceback.print_exc()


def executable(name: str) -> str:
    resolved = shutil.which(name)
    if resolved is None:
        raise FileNotFoundError(f"No se encontro el ejecutable requerido: {name}")
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
        raise ValueError(f"{label} tiene un id invalido.")
    if isinstance(record["id"], str) and not record["id"].strip():
        raise ValueError(f"{label} tiene un id vacio.")

    for field in REQUIRED_TEXT_FIELDS:
        if not isinstance(record[field], str) or not record[field].strip():
            raise ValueError(f"{label} tiene un campo {field!r} invalido.")

    normalized_status = record["estado"].strip().lower()
    if normalized_status not in dataset.allowed_statuses:
        raise ValueError(f"{label} tiene un estado no permitido: {record['estado']!r}")

    for field in ("cuota", "probabilidad", "ev"):
        value = record[field]
        if isinstance(value, bool) or not isinstance(value, (int, float)):
            raise ValueError(f"{label} tiene un campo {field!r} no numerico.")
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


def safe_temp_root() -> Path:
    root = PRIVATE_ROOT / "public_export" / "publish_tmp"
    root.mkdir(parents=True, exist_ok=True)
    return root


def temporary_path(dataset: PublicDataset) -> Path:
    return safe_temp_root() / f"{dataset.destination.name}.{os.getpid()}.tmp"


def clear_readonly(path: Path) -> None:
    if not path.exists():
        return
    try:
        current_mode = path.stat().st_mode
        os.chmod(path, current_mode | stat.S_IWRITE | stat.S_IREAD)
        print(f"Read-only desactivado si aplicaba: {path}")
        return
    except PermissionError as error:
        print(f"No se pudo usar chmod para quitar read-only: {path}", file=sys.stderr)
        print(f"Causa del sistema: {error}", file=sys.stderr)

    if os.name == "nt":
        try:
            subprocess.run(["attrib", "-R", str(path)], check=False, capture_output=True, text=True)
            print(f"Read-only desactivado con attrib si aplicaba: {path}")
        except OSError as error:
            print(f"No se pudo ejecutar attrib -R sobre: {path}", file=sys.stderr)
            print(f"Causa del sistema: {error}", file=sys.stderr)


def report_permission_error(dataset: PublicDataset, blocked_path: Path, temporary: Path, attempt: int, error: PermissionError) -> None:
    print(f"Intento {attempt}/{COPY_ATTEMPTS}: permiso denegado.", file=sys.stderr)
    print(f"  dataset: {dataset.name}", file=sys.stderr)
    print(f"  archivo bloqueado: {blocked_path.name}", file=sys.stderr)
    print(f"  ruta exacta: {blocked_path}", file=sys.stderr)
    print(f"  destino existe: {dataset.destination.exists()}", file=sys.stderr)
    print(f"  temporal seguro: {temporary}", file=sys.stderr)
    print(f"  temporal existe: {temporary.exists()}", file=sys.stderr)
    print(f"  causa del sistema: {error}", file=sys.stderr)
    if getattr(error, "winerror", None) is not None:
        print(f"  WinError: {error.winerror}", file=sys.stderr)


def remove_stale_temporary(dataset: PublicDataset) -> bool:
    temporary = temporary_path(dataset)
    if not temporary.exists():
        print(f"Temporal {temporary.name}: no existe.")
        return False

    age_seconds = max(0, time.time() - temporary.stat().st_mtime)
    if age_seconds <= STALE_TEMP_SECONDS:
        print(f"Temporal {temporary.name}: existe y tiene {age_seconds:.0f}s; no se elimina por ser reciente.")
        return False

    try:
        temporary.unlink()
        print(f"Correccion aplicada: eliminado temporal antiguo ({age_seconds:.0f}s): {temporary}")
        return True
    except PermissionError as error:
        print(f"No se pudo eliminar el temporal antiguo bloqueado: {temporary}", file=sys.stderr)
        print(f"Causa del sistema: {error}", file=sys.stderr)
        return False


def cleanup_stale_temporaries() -> None:
    print("Comprobando archivos temporales de publicacion...")
    for dataset in DATASETS:
        remove_stale_temporary(dataset)


def check_directory_writable(directory: Path) -> bool:
    try:
        directory.mkdir(parents=True, exist_ok=True)
    except PermissionError as error:
        print(f"La carpeta publica no se pudo crear o abrir para escritura: {directory}", file=sys.stderr)
        print(f"Causa del sistema: {error}", file=sys.stderr)
        return False

    temp_root = safe_temp_root()
    try:
        with tempfile.NamedTemporaryFile(prefix="publish_write_probe_", suffix=".tmp", dir=temp_root, delete=False) as probe:
            probe_path = Path(probe.name)
            probe.write(b"PicksProAI write test")
        probe_path.unlink(missing_ok=True)
    except PermissionError as error:
        print(f"No se puede escribir en la carpeta temporal segura: {temp_root}", file=sys.stderr)
        print(f"Causa del sistema: {error}", file=sys.stderr)
        raise

    destination_probe = directory / f"publish_write_probe_{os.getpid()}.tmp"
    try:
        destination_probe.write_bytes(b"PicksProAI write test")
        destination_probe.unlink(missing_ok=True)
        print(f"Permisos de escritura destino: OK ({directory})")
        return True
    except PermissionError as error:
        print(f"Diagnostico: la carpeta publica no permite crear archivos nuevos: {directory}", file=sys.stderr)
        print(f"Archivo de prueba bloqueado: {destination_probe}", file=sys.stderr)
        print(f"Causa del sistema: {error}", file=sys.stderr)
        print("Se intentara igualmente reemplazar los JSON existentes usando temporal seguro externo.", file=sys.stderr)
        return False


def copy_atomically(dataset: PublicDataset, source_bytes: bytes) -> None:
    dataset.destination.parent.mkdir(parents=True, exist_ok=True)
    temporary = temporary_path(dataset)
    last_error: PermissionError | None = None

    for attempt in range(1, COPY_ATTEMPTS + 1):
        print(f"Intento {attempt}/{COPY_ATTEMPTS}: copiando {dataset.name}...")
        try:
            temporary.write_bytes(source_bytes)
            clear_readonly(dataset.destination)
            shutil.copyfile(temporary, dataset.destination)
            print(f"Intento {attempt}/{COPY_ATTEMPTS}: copia completada: {dataset.destination}")
            return
        except PermissionError as error:
            report_permission_error(dataset, dataset.destination, temporary, attempt, error)
            last_error = error
            if attempt < COPY_ATTEMPTS:
                print(f"Reintento automatico en {COPY_RETRY_SECONDS} segundo...")
                time.sleep(COPY_RETRY_SECONDS)
        finally:
            try:
                temporary.unlink(missing_ok=True)
            except PermissionError as cleanup_error:
                print(f"El temporal continua bloqueado: {temporary}", file=sys.stderr)
                print(f"Causa del sistema: {cleanup_error}", file=sys.stderr)

    if last_error is not None:
        raise last_error
    raise PermissionError(f"No se pudo copiar {dataset.name}: {dataset.destination}")


def run_copy_diagnostics() -> int:
    """Prueba la copia robusta sin modificar los JSON publicos."""
    data_directory = PROJECT_ROOT / "public" / "data"
    print("Diagnostico seguro de copia (sin export, build, commit ni push).")
    cleanup_stale_temporaries()
    check_directory_writable(data_directory)

    diagnostic_destination = data_directory / f"publish_copy_diagnostic_{os.getpid()}.json"
    diagnostic_dataset = PublicDataset("diagnostic", Path(), Path(), diagnostic_destination, "", set())
    try:
        copy_atomically(diagnostic_dataset, b"{}\n")
        print("Causa exacta del bloqueo actual: no se detecta bloqueo en este momento.")
        print("Correccion aplicada: limpieza preventiva, temporales externos y reintentos habilitados.")
        return 0
    finally:
        for path in (diagnostic_destination, temporary_path(diagnostic_dataset)):
            try:
                clear_readonly(path)
                path.unlink(missing_ok=True)
            except PermissionError as error:
                print(f"No se pudo limpiar el diagnostico: {path}", file=sys.stderr)
                print(f"Causa del sistema: {error}", file=sys.stderr)


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
    parser.add_argument("--no-git", action="store_true", help="valida export, copia y build sin crear commit ni ejecutar push")
    parser.add_argument("--copy-diagnostics", action="store_true", help="diagnostica permisos y copia sin modificar los JSON publicos")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    if args.copy_diagnostics:
        try:
            return run_copy_diagnostics()
        except (OSError, ValueError) as error:
            print(f"Diagnostico fallido: {error}", file=sys.stderr)
            print_traceback()
            return 1

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

        cleanup_stale_temporaries()
        check_directory_writable(PROJECT_ROOT / "public" / "data")

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
            print("Los JSON publicos no han cambiado; no se crea commit ni se ejecuta push.")
            return 0

        run([git, "add", *changed_paths], cwd=PROJECT_ROOT)
        run([git, "commit", "-m", "Update public picks and results", "--", *changed_paths], cwd=PROJECT_ROOT)
        summary["committed"] = True
        run([git, "push"], cwd=PROJECT_ROOT)
        summary["pushed"] = True
        return 0
    except (
        OSError, UnicodeDecodeError, json.JSONDecodeError, ValueError,
        subprocess.CalledProcessError,
    ) as error:
        print(f"Error: {error}", file=sys.stderr)
        print_traceback()
        return 1
    finally:
        print_summary(summary)


if __name__ == "__main__":
    raise SystemExit(main())
