python3 tools/prg32_game.py build \
  examples/games/pong/graphics/game.S \
  --firmware-elf build-esp32c6/PRG32.elf \
  --entry-prefix pong_graphics \
  --name pong \
  --out build-esp32c6/pong.prg32