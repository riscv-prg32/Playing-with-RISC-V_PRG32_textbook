python3 tools/prg32_game.py build \
  examples/games/pong/c/game.c \
  --firmware-elf build-esp32c6/PRG32.elf \
  --entry-prefix pong_c \
  --name pong-c \
  --out build-esp32c6/pong-c.prg32
