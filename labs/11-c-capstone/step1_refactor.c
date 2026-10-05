/* C Lab 3: refactor, refine, ship.  Starts where C Lab 1 ended. */
#include <stdint.h>
#include "prg32.h"

#define PADDLE_W 64
#define PADDLE_H 8
#define PADDLE_Y 188
#define PADDLE_SPEED 3
#define BALL_SIZE 8

static int paddle_x;
static int ball_x, ball_y, ball_dx, ball_dy;
static int score;

static int clamp(int value, int low, int high) {
    if (value < low)  { return low; }
    if (value > high) { return high; }
    return value;
}

void refine_c_init(void) {
    paddle_x = (PRG32_GAME_W - PADDLE_W) / 2;
    ball_x = 156;
    ball_y = 96;
    ball_dx = 2;
    ball_dy = 1;
    score = 0;
}

void refine_c_update(void) {
    uint32_t input = prg32_input_read();
    if (input & PRG32_BTN_LEFT)  { paddle_x -= PADDLE_SPEED; }
    if (input & PRG32_BTN_RIGHT) { paddle_x += PADDLE_SPEED; }
    paddle_x = clamp(paddle_x, 0, PRG32_GAME_W - PADDLE_W);

    ball_x += ball_dx;
    ball_y += ball_dy;
    if (ball_x < 0 || ball_x > PRG32_GAME_W - BALL_SIZE) { ball_dx = -ball_dx; }
    if (ball_y < 0)            { ball_dy = -ball_dy; }
    if (ball_y > PRG32_GAME_H) { refine_c_init(); }
    if (prg32_sprite_hitbox(ball_x, ball_y, BALL_SIZE, BALL_SIZE,
                            paddle_x, PADDLE_Y, PADDLE_W, PADDLE_H)) {
        if (ball_dy > 0) { score += 1; }
        ball_dy = -1;
    }
}

void refine_c_draw(void) {
    prg32_gfx_clear(PRG32_COLOR_BLACK);
    prg32_gfx_rect(4, 4, score * 4, 6, PRG32_COLOR_GREEN);
    prg32_gfx_rect(paddle_x, PADDLE_Y, PADDLE_W, PADDLE_H, PRG32_COLOR_WHITE);
    prg32_gfx_rect(ball_x, ball_y, BALL_SIZE, BALL_SIZE, PRG32_COLOR_YELLOW);
}
