# Run from the PRG32 repository root after sourcing ESP-IDF.
python3 -m prg32 doctor
python3 -m prg32 qemu build
python3 -m prg32 cartridge build examples/games/pong/c/game.c \
  --portable --entry-prefix pong_c --name pong --out build-qemu/pong.prg32
python3 -m prg32 cartridge summary build-qemu/pong.prg32
python3 -m prg32 qemu upload build-qemu/pong.prg32
python3 -m prg32 qemu run
