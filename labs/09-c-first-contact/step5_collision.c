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
    uint32_t input = prg32_input_read();
    if (input & PRG32_BTN_LEFT) {
        paddle_x -= 3;
    }
    if (input & PRG32_BTN_RIGHT) {
        paddle_x += 3;
    }
    if (paddle_x < 0)   { paddle_x = 0; }
    if (paddle_x > 256) { paddle_x = 256; } /* 320 - 64-wide paddle */

    ball_x += ball_dx;
    ball_y += ball_dy;
    if (ball_x < 0 || ball_x > 312) { /* 320 - 8-wide ball */
        ball_dx = -ball_dx;
    }
    if (ball_y < 0) {
        ball_dy = -ball_dy;
    }
    if (ball_y > 200) { /* missed: start the round again */
        pong_c_init();
    }

    if (prg32_sprite_hitbox(ball_x, ball_y, 8, 8,
                            paddle_x, 188, 64, 8)) {
        ball_dy = -1; /* assign, do not negate: safe to repeat */
    }
}

void pong_c_draw(void) {
    prg32_gfx_clear(PRG32_COLOR_BLACK);
    prg32_gfx_rect(paddle_x, 188, 64, 8, PRG32_COLOR_WHITE);
    prg32_gfx_rect(ball_x, ball_y, 8, 8, PRG32_COLOR_YELLOW);
}
