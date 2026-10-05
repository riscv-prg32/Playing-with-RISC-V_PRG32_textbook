#!/usr/bin/env bash
# Build one workshop step and run it.
#
#   ./run.sh 1 2      # Part 1, step 2
#   ./run.sh 3 1      # Part 3, step 1
#
# Needs:  PRG32_HOME = your PRG32 checkout, with ESP-IDF active.
# Runs on the PRG32 kit (or PRG32-QT) at PRG32_URL when it is set,
# for example  export PRG32_URL=http://192.168.4.1 ; otherwise in QEMU.
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
PART="${1:?usage: ./run.sh PART STEP}"
STEP="${2:?usage: ./run.sh PART STEP}"
: "${PRG32_HOME:?set PRG32_HOME to your PRG32 checkout}"

SOURCE=$(ls "$HERE"/part"$PART"/step"$STEP"_*)
case "$PART" in
  1) PREFIX=hello_world ;;
  2) PREFIX=pong ;;
  3) PREFIX=mixed ;;
  *) echo "PART must be 1, 2 or 3"; exit 2 ;;
esac

mkdir -p "$HERE/build"
CART="$HERE/build/part$PART-step$STEP.prg32"
cd "$PRG32_HOME"
python3 -m prg32 cartridge build "$SOURCE" --portable \
  --entry-prefix "$PREFIX" --name "p$PART-s$STEP" --out "$CART"
python3 -m prg32 cartridge summary "$CART" | grep -E '"(code_size|mem_size|import_model)"'

if [ -n "${PRG32_URL:-}" ]; then
  python3 -m prg32 esp32c6 upload-and-run "$CART" --url "$PRG32_URL" --slot cart0
else
  python3 -m prg32 qemu upload "$CART"
  python3 -m prg32 qemu run
fi
