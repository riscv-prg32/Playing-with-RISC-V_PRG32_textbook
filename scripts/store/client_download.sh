#!/usr/bin/env bash
# No account is needed to discover, list, or download.
python3 -m prg32 store discover
python3 -m prg32 store list --store-url "$PRG32_STORE_URL"
curl "$PRG32_STORE_URL/api/games?q=lemon&per_page=10"
GAME="$PRG32_STORE_URL/api/games/org.example.lemon-catcher"
curl -o lemon-catcher.prg32 \
  "$GAME/download?version=1.0.0&architecture=qemu"
