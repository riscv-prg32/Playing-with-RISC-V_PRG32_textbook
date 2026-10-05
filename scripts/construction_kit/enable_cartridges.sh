#!/usr/bin/env bash
# Optional: let "Compile Cartridge" produce real .prg32 files.
. "$HOME/esp-idf/export.sh"
export PYTHONPATH="$HOME/PRG32"            # where the prg32 module lives
python3 -m prg32 cartridge build --help    # must work in this shell
export PRG32_STORE_URL="http://127.0.0.1:5080"
python app.py
