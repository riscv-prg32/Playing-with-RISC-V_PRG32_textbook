#!/usr/bin/env bash
# Optional: embed metadata, icon, and colophon inside each .prg32 file.
python3 -m prg32 store attach-metadata \
  build/store-lemon/lemon-catcher-esp32c6.prg32 \
  --metadata metadata.json --icon icon.png --colophon colophon.json \
  --architecture esp32c6 \
  --out build/store-lemon/lemon-catcher-esp32c6.prg32
python3 -m prg32 store inspect-metadata \
  build/store-lemon/lemon-catcher-esp32c6.prg32
