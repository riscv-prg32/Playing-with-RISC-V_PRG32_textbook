#!/usr/bin/env bash
# PRG32-QT advertises its device API as _prg32._tcp.local.
QT=http://prg32-host.local:8080
python3 -m prg32 runtime --url "$QT"
python3 -m prg32 esp32c6 upload-and-run build/lemon-catcher.prg32 \
  --url "$QT" --slot cart0
python3 -m prg32 debug enable --url "$QT"
python3 -m prg32 debug pause  --url "$QT"
python3 -m prg32 debug step   --url "$QT"
python3 -m prg32 debug state  --url "$QT"
python3 -m prg32 debug speed --speed 0.25 --url "$QT"
python3 -m prg32 debug resume --url "$QT"
