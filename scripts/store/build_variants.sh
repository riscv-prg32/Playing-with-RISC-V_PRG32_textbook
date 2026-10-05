#!/usr/bin/env bash
# Run from the PRG32 repository root after sourcing ESP-IDF.
# Builds one portable cartridge per Store architecture.
mkdir -p build/store-lemon
for ARCH in esp32c6 qemu; do
  python3 -m prg32 cartridge build work/lemon_catcher_c_game.c \
    --portable --architecture "$ARCH" \
    --entry-prefix lemon_catcher_c --name lemon-catcher \
    --out "build/store-lemon/lemon-catcher-$ARCH.prg32"
done
python3 -m prg32 cartridge summary build/store-lemon/lemon-catcher-esp32c6.prg32
