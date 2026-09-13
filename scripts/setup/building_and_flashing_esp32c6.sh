#!/usr/bin/env bash
# Run from the PRG32 repository root after sourcing ESP-IDF.
python3 -m prg32 esp32c6 build
python3 -m prg32 esp32c6 flash
