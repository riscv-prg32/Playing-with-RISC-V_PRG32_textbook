//@ 1
/* C Lab 2, part B: a tile world, then an actor in it. */
#include <stdint.h>
#include "prg32.h"

static const uint8_t solid[8]  = { 0xff, 0x81, 0x81, 0x81, 0x81, 0x81, 0x81, 0xff };
//@ 3
static const uint8_t spikes[8] = { 0x00, 0x00, 0x24, 0x24, 0x5a, 0x5a, 0xff, 0xff };
//@ 2
static prg32_platform_actor_t player;
//@ 1

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
//@ 3
    prg32_tile_define(5, spikes, PRG32_COLOR_RED, PRG32_COLOR_BLACK);
    put_run(1, 22, 23, 21, 5); /* two spike tiles standing on the ground */
//@ 1
}

void plat_init(void) {
    fill_world();
//@ 2
    prg32_platform_tile_flags(2, PRG32_TILE_FLAG_SOLID);
//@ 3
    prg32_platform_tile_flags(5, PRG32_TILE_FLAG_HAZARD);
//@ 2
    prg32_platform_actor_init(&player, 1, 32, 120, 8, 8);
//@ 1
}

void plat_update(void) {
//@ 2
    uint32_t input = prg32_input_read();
    /* move_speed, jump_speed, gravity, max_fall */
    uint16_t state = prg32_platform_actor_step(&player, input, 2, -7, 1, 5);
//@ 2-2
    (void)state;
//@ 3
    if (state & PRG32_PLATFORM_HAZARD) {
        prg32_audio_note(0, 0, 48, 255, 80);
        prg32_platform_actor_init(&player, 1, 32, 120, 8, 8); /* back to start */
    }
//@ 2
    prg32_platform_camera_follow(&player, 64, 48);
//@ 1
}

void plat_draw(void) {
    prg32_gfx_clear(PRG32_COLOR_BLACK);
    prg32_playfield_draw(1, 1);
//@ 2
    prg32_gfx_rect(player.x - prg32_playfield_camera_x(),
                   player.y - prg32_playfield_camera_y(), 8, 8, PRG32_COLOR_YELLOW);
//@ 1
}
