/* C Lab 1: Pong, one function at a time. */
#include <stdint.h>
#include "prg32.h"

static int paddle_x;
static int ball_x;
static int ball_y;
static int ball_dx; /* horizontal velocity, pixels per frame */
static int ball_dy; /* vertical velocity */

void pong_c_init(void) {
    paddle_x = 128;
    ball_x = 156;
    ball_y = 96;
    ball_dx = 2;
    ball_dy = 1;
}

void pong_c_update(void) {
}

void pong_c_draw(void) {
    prg32_gfx_clear(PRG32_COLOR_BLACK);
    prg32_gfx_rect(paddle_x, 188, 64, 8, PRG32_COLOR_WHITE);
    prg32_gfx_rect(ball_x, ball_y, 8, 8, PRG32_COLOR_YELLOW);
}
