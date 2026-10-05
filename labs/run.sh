#!/usr/bin/env bash
# Build one tutorial step and run it.
#
#   labs/run.sh 07-asm-graphics-game/step3_move.S pong
#   labs/run.sh 09-c-first-contact/step4_ball.c pong_c
#
# Arguments: the step file (relative to labs/) and its entry-point prefix.
# Needs:  PRG32_HOME = your PRG32 checkout, with ESP-IDF active.
# Runs on the device at PRG32_URL (a PRG32 board or PRG32-QT) when it is set,
# otherwise in QEMU.
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
STEP="${1:?usage: labs/run.sh STEP_FILE ENTRY_PREFIX}"
PREFIX="${2:?usage: labs/run.sh STEP_FILE ENTRY_PREFIX}"
: "${PRG32_HOME:?set PRG32_HOME to your PRG32 checkout}"

SOURCE="$HERE/$STEP"
NAME="$(basename "${STEP%.*}")"
mkdir -p "$HERE/build"
CART="$HERE/build/$NAME.prg32"
cd "$PRG32_HOME"
python3 -m prg32 cartridge build "$SOURCE" --portable \
  --entry-prefix "$PREFIX" --name "$NAME" --out "$CART"

if [ -n "${PRG32_URL:-}" ]; then
  python3 -m prg32 esp32c6 upload-and-run "$CART" --url "$PRG32_URL" --slot cart0
else
  python3 -m prg32 qemu upload "$CART"
  python3 -m prg32 qemu run
fi
