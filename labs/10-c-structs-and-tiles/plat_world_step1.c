/* C Lab 2, part B: a tile world, then an actor in it. */
#include <stdint.h>
#include "prg32.h"

static const uint8_t solid[8]  = { 0xff, 0x81, 0x81, 0x81, 0x81, 0x81, 0x81, 0xff };

static void put_run(uint8_t layer, uint8_t x0, uint8_t x1, uint8_t y, uint8_t tile) {
    for (uint8_t x = x0; x <= x1 && x < PRG32_PLAYFIELD_COLS; ++x) {
        prg32_playfield_put(layer, x, y, tile);
    }
}

static void fill_world(void) {
    prg32_playfield_clear(1, 0);
    prg32_tile_define(2, solid, PRG32_COLOR_GREEN, PRG32_COLOR_BLACK);
    put_run(1, 0, 63, 22, 2);  /* the ground, whole width */
    put_run(1, 10, 19, 17, 2); /* a platform */
    put_run(1, 25, 32, 12, 2); /* a higher one */
}

void plat_init(void) {
    fill_world();
}

void plat_update(void) {
}

void plat_draw(void) {
    prg32_gfx_clear(PRG32_COLOR_BLACK);
    prg32_playfield_draw(1, 1);
}
