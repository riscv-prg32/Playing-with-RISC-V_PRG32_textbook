#!/usr/bin/env bash
# Compila un passo del laboratorio e lo avvia.
#
#   ./prova.sh asm 3        # assembly, passo 3
#   ./prova.sh c 5          # C, passo 5
#   ./prova.sh kit 7        # C generato dal Construction Kit, passo 7
#
# Serve:  PRG32_HOME  = cartella del repository PRG32 (con ESP-IDF attivo)
# Avvio:  se PRG32_URL e' definita (una scheda PRG32 o PRG32-QT sulla rete)
#         la cartuccia viene caricata ed eseguita li'; altrimenti si usa QEMU.
set -euo pipefail
QUI="$(cd "$(dirname "$0")" && pwd)"
LINGUA="${1:?uso: ./prova.sh asm|c|kit NUMERO_PASSO}"
PASSO="${2:?uso: ./prova.sh asm|c|kit NUMERO_PASSO}"
: "${PRG32_HOME:?imposta PRG32_HOME sulla cartella del repository PRG32}"

case "$LINGUA" in
  asm) SORGENTE=$(ls "$QUI"/asm/passo"$PASSO"_*.S); PREFISSO=breakout ;;
  c)   SORGENTE=$(ls "$QUI"/c/passo"$PASSO"_*.c);   PREFISSO=breakout_c ;;
  kit) SORGENTE="$QUI/kit/passo$PASSO.c";           PREFISSO=breakout ;;
  *)   echo "primo argomento: asm, c oppure kit"; exit 2 ;;
esac

mkdir -p "$QUI/build"
CARTUCCIA="$QUI/build/breakout-$LINGUA-passo$PASSO.prg32"
cd "$PRG32_HOME"
python3 -m prg32 cartridge build "$SORGENTE" --portable \
  --entry-prefix "$PREFISSO" --name "breakout-$PASSO" --out "$CARTUCCIA"

if [ -n "${PRG32_URL:-}" ]; then
  python3 -m prg32 esp32c6 upload-and-run "$CARTUCCIA" --url "$PRG32_URL" --slot cart0
else
  python3 -m prg32 qemu upload "$CARTUCCIA"
  python3 -m prg32 qemu run
fi
