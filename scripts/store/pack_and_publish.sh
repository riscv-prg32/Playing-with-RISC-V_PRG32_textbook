#!/usr/bin/env bash
# manifest.json and icon.png sit beside the two .prg32 files.
python3 -m prg32 store pack-bundle \
  --manifest build/store-lemon/manifest.json \
  --out build/lemon-catcher-1.0.0.zip
# The token comes from the Store's Tokens page; keep it out of Git.
python3 -m prg32 store publish-bundle build/lemon-catcher-1.0.0.zip \
  --store-url "$PRG32_STORE_URL" --token "$PRG32_STORE_TOKEN"
