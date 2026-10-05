//@ 1
/* C Lab 1: Pong, one function at a time. */
#include <stdint.h>
#include "prg32.h"
//@ 2

static int paddle_x;
static int ball_x;
static int ball_y;
static int ball_dx; /* horizontal velocity, pixels per frame */
static int ball_dy; /* vertical velocity */
//@ 6
static int score;
//@ 1

void pong_c_init(void) {
//@ 2
    paddle_x = 128;
    ball_x = 156;
    ball_y = 96;
    ball_dx = 2;
    ball_dy = 1;
//@ 6
    score = 0;
//@ 1
}

void pong_c_update(void) {
//@ 3
    uint32_t input = prg32_input_read();
    if (input & PRG32_BTN_LEFT) {
        paddle_x -= 3;
    }
    if (input & PRG32_BTN_RIGHT) {
        paddle_x += 3;
    }
    if (paddle_x < 0)   { paddle_x = 0; }
    if (paddle_x > 256) { paddle_x = 256; } /* 320 - 64-wide paddle */
//@ 4

    ball_x += ball_dx;
    ball_y += ball_dy;
    if (ball_x < 0 || ball_x > 312) { /* 320 - 8-wide ball */
        ball_dx = -ball_dx;
    }
//@ 4-4
    if (ball_y < 0 || ball_y > 192) { /* 200 - 8-high ball */
        ball_dy = -ball_dy;
    }
//@ 5
    if (ball_y < 0) {
        ball_dy = -ball_dy;
    }
    if (ball_y > 200) { /* missed: start the round again */
        pong_c_init();
    }

    if (prg32_sprite_hitbox(ball_x, ball_y, 8, 8,
                            paddle_x, 188, 64, 8)) {
//@ 6
        if (ball_dy > 0) {
            score += 1; /* count only while moving down: once per hit */
        }
//@ 5
        ball_dy = -1; /* assign, do not negate: safe to repeat */
    }
//@ 1
}

void pong_c_draw(void) {
//@ 2
    prg32_gfx_clear(PRG32_COLOR_BLACK);
    prg32_gfx_rect(paddle_x, 188, 64, 8, PRG32_COLOR_WHITE);
    prg32_gfx_rect(ball_x, ball_y, 8, 8, PRG32_COLOR_YELLOW);
//@ 6
    prg32_gfx_text8(8, 96, "PONG C", PRG32_COLOR_GREEN, PRG32_COLOR_BLACK);
    prg32_gfx_rect(4, 4, score * 4, 6, PRG32_COLOR_GREEN);
//@ 1
}
