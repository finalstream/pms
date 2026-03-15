from __future__ import annotations

import hashlib
from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "deliverables" / "pms-html-mvp.zip"


def build_zip() -> str:
    OUT.parent.mkdir(parents=True, exist_ok=True)
    if OUT.exists():
        OUT.unlink()

    files = [
        ROOT / "docs" / "one-manager-mvp-plan-ja.md",
    ]
    files.extend(
        p
        for p in (ROOT / "app").rglob("*")
        if p.is_file() and "__pycache__" not in p.parts
    )

    with ZipFile(OUT, "w", compression=ZIP_DEFLATED) as zf:
        for file in files:
            zf.write(file, file.relative_to(ROOT))

    digest = hashlib.sha256(OUT.read_bytes()).hexdigest()
    return digest


if __name__ == "__main__":
    sha256 = build_zip()
    print(f"Built: {OUT.relative_to(ROOT)}")
    print(f"SHA-256: {sha256}")
