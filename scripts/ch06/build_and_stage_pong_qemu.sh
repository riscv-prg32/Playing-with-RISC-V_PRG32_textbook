python3 tools/prg32_game.py build \
  examples/games/pong/graphics/game.S \
  --firmware-elf build-qemu/PRG32.elf \
  --entry-prefix pong_graphics \
  --name pong \
  --out build-qemu/pong.prg32
python3 tools/prg32_game.py upload-qemu build-qemu/pong.prg32 --flash build-qemu/flash_image.bin
