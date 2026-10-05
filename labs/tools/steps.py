#!/usr/bin/env python3
"""Generate, build, run and screenshot every tutorial step.

A *master* source holds a whole tutorial in one file.  Marker lines select the
steps in which the following lines exist:

    #@ 3        (or //@ 3)   lines below appear from step 3 onwards
    #@ 3-5                   lines below appear in steps 3, 4 and 5 only
    #@ 1                     back to "always"

For each step this tool writes a complete, buildable source file, builds it as
a portable cartridge, runs it in the PRG32-QT headless runner with scripted
input, and saves the final frame as expected/<step>.png.  The slide decks show
those files and screenshots, so what a learner types and sees is exactly what
was built and run here.

    export PRG32_HOME=~/PRG32                        # a PRG32 checkout, ESP-IDF active
    export PRG32QT_HEADLESS=~/PRG32-QT/build-core/prg32qt-headless
    python3 labs/tools/steps.py            # everything
    python3 labs/tools/steps.py breakout   # only entries whose id contains "breakout"
"""
import json, os, re, struct, subprocess, sys, tempfile, zlib
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
MANIFEST = json.loads((Path(__file__).with_name("labs.json")).read_text())
PRG32 = os.environ.get("PRG32_HOME")
HEADLESS = os.environ.get("PRG32QT_HEADLESS")
MARK = re.compile(r"^\s*(?:#|//)@\s*(\d+)(?:-(\d+))?\s*$")


def split(master: Path, step: int) -> str:
    lo, hi, out = 1, 10**6, []
    for line in master.read_text().splitlines():
        m = MARK.match(line)
        if m:
            lo, hi = int(m.group(1)), int(m.group(2)) if m.group(2) else 10**6
        elif lo <= step <= hi:
            out.append(line)
    text = "\n".join(out)
    return re.sub(r"\n{3,}", "\n\n", text).strip() + "\n"


def png(path: Path, w: int, h: int, rgb: bytes, scale: int = 2) -> None:
    rows = []
    for y in range(h):
        row = b"".join(rgb[(y * w + x) * 3:(y * w + x) * 3 + 3] * scale for x in range(w))
        rows.extend([b"\x00" + row] * scale)
    def chunk(tag, data):
        return struct.pack(">I", len(data)) + tag + data + struct.pack(">I", zlib.crc32(tag + data))
    path.write_bytes(b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", struct.pack(">IIBBBBB", w * scale, h * scale, 8, 2, 0, 0, 0))
                     + chunk(b"IDAT", zlib.compress(b"".join(rows), 9)) + chunk(b"IEND", b""))


def run(entry: dict, step: dict, src: Path, tmp: Path) -> str:
    cart = tmp / (src.stem + ".prg32")
    cmd = [sys.executable, "-m", "prg32", "cartridge", "build", str(src), "--portable",
           "--entry-prefix", step.get("prefix", entry["prefix"]), "--name", entry["id"][:24], "--out", str(cart)]
    r = subprocess.run(cmd, cwd=PRG32, capture_output=True, text=True)
    if r.returncode or not cart.exists():
        raise SystemExit(f"BUILD FAILED {src}\n{r.stdout[-1500:]}{r.stderr[-1500:]}")
    if entry.get("keep"):
        keep = ROOT / entry["keep"]
        keep.mkdir(parents=True, exist_ok=True)
        (keep / (entry.get("keep_prefix", "") + cart.name)).write_bytes(cart.read_bytes())
    size = re.search(r"code=(\d+) mem=(\d+)", r.stdout)
    info = f"code={size.group(1)} mem={size.group(2)}" if size else ""
    if HEADLESS:
        frames = step.get("frames", 60)
        args = [HEADLESS, str(cart), str(frames)]
        for a, b, mask in step.get("input", []):
            for f in range(a, b):
                args += ["--input", f"{f}:{mask}"]
        ppm = tmp / "frame.ppm"
        args += ["--dump-ppm", str(ppm)]
        r = subprocess.run(args, capture_output=True, text=True)
        if r.returncode:
            raise SystemExit(f"RUN FAILED {src}\n{r.stdout}{r.stderr}")
        data = ppm.read_bytes()
        header = data.split(b"\n", 3)
        w, h = map(int, header[1].split())
        shot = src.parent / "expected" / (src.stem + ".png")
        shot.parent.mkdir(exist_ok=True)
        png(shot, w, h, header[3])
    return info


def main() -> None:
    only = sys.argv[1] if len(sys.argv) > 1 else ""
    with tempfile.TemporaryDirectory() as t:
        tmp = Path(t)
        for entry in MANIFEST:
            if only not in entry["id"]:
                continue
            out = ROOT / entry["dir"]
            out.mkdir(parents=True, exist_ok=True)
            master = ROOT / entry["master"] if "master" in entry else None
            for step in entry["steps"]:
                src = out / step["file"]
                if master:
                    src.write_text(split(master, step["n"]))
                info = run(entry, step, src, tmp) if PRG32 else "(not built: PRG32_HOME unset)"
                print(f"{entry['id']:28s} {step['file']:34s} {info}")


if __name__ == "__main__":
    main()
