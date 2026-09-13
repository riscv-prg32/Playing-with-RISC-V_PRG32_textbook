#!/usr/bin/env bash
# Run from the PRG32 repository root after sourcing ESP-IDF.
python3 -m prg32 qemu build
python3 -m prg32 qemu run
