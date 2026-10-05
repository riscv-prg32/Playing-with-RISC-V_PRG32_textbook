/* C Lab 2, part A: Pong gains a row of bricks. */
#include <stdint.h>
#include "prg32.h"

#define BRICKS 10

static int paddle_x, ball_x, ball_y, ball_dx, ball_dy;
static uint8_t bricks[BRICKS]; /* bricks[i] == 1 means brick i is intact */

static void reset_bricks(void) {
    for (int i = 0; i < BRICKS; ++i) {
        bricks[i] = 1;
    }
}

void bricks_c_init(void) {
    paddle_x = 128;
    ball_x = 156;
    ball_y = 96;
    ball_dx = 2;
    ball_dy = -2;
    reset_bricks();
}

void bricks_c_update(void) {
    uint32_t input = prg32_input_read();
    if (input & PRG32_BTN_LEFT)  { paddle_x -= 4; }
    if (input & PRG32_BTN_RIGHT) { paddle_x += 4; }
    if (paddle_x < 0)   { paddle_x = 0; }
    if (paddle_x > 256) { paddle_x = 256; }

    ball_x += ball_dx;
    ball_y += ball_dy;
    if (ball_x < 0 || ball_x > 312) { ball_dx = -ball_dx; }
    if (ball_y < 0)                 { ball_dy = -ball_dy; }
    if (ball_y > 200)               { ball_x = 156; ball_y = 96; ball_dy = -2; }
    if (prg32_sprite_hitbox(ball_x, ball_y, 8, 8, paddle_x, 188, 64, 8)) {
        ball_dy = -2;
    }
}

void bricks_c_draw(void) {
    prg32_gfx_clear(PRG32_COLOR_BLACK);
    for (int i = 0; i < BRICKS; ++i) {
        if (bricks[i]) {
            prg32_gfx_rect(i * 32 + 2, 24, 28, 8, PRG32_COLOR_CYAN);
        }
    }
    prg32_gfx_rect(paddle_x, 188, 64, 8, PRG32_COLOR_WHITE);
    prg32_gfx_rect(ball_x, ball_y, 8, 8, PRG32_COLOR_YELLOW);
}
