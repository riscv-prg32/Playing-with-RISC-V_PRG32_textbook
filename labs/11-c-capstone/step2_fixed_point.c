/* C Lab 3: refactor, refine, ship.  Starts where C Lab 1 ended. */
#include <stdint.h>
#include "prg32.h"

#define PADDLE_W 64
#define PADDLE_H 8
#define PADDLE_Y 188
#define PADDLE_SPEED 3
#define BALL_SIZE 8
#define Q 256 /* fixed-point scale: 8 fractional bits */

static int paddle_x;
static int ball_xq, ball_yq;   /* position, times 256 */
static int ball_dxq, ball_dyq; /* velocity, times 256 */
static int score;

static int clamp(int value, int low, int high) {
    if (value < low)  { return low; }
    if (value > high) { return high; }
    return value;
}

void refine_c_init(void) {
    paddle_x = (PRG32_GAME_W - PADDLE_W) / 2;
    ball_xq = 156 * Q;
    ball_yq = 96 * Q;
    ball_dxq = 3 * Q / 2; /* 1.5 pixels per frame: multiply before dividing */
    ball_dyq = 1 * Q;
    score = 0;
}

void refine_c_update(void) {
    uint32_t input = prg32_input_read();
    if (input & PRG32_BTN_LEFT)  { paddle_x -= PADDLE_SPEED; }
    if (input & PRG32_BTN_RIGHT) { paddle_x += PADDLE_SPEED; }
    paddle_x = clamp(paddle_x, 0, PRG32_GAME_W - PADDLE_W);

    ball_xq += ball_dxq;
    ball_yq += ball_dyq;
    if (ball_xq < 0 || ball_xq > (PRG32_GAME_W - BALL_SIZE) * Q) { ball_dxq = -ball_dxq; }
    if (ball_yq < 0) { ball_dyq = -ball_dyq; }
    if (ball_yq > PRG32_GAME_H * Q) { refine_c_init(); }
    if (ball_dyq > 0 &&
        prg32_sprite_hitbox(ball_xq / Q, ball_yq / Q, BALL_SIZE, BALL_SIZE,
                            paddle_x, PADDLE_Y, PADDLE_W, PADDLE_H)) {
        score += 1;
        ball_dyq = -(ball_dyq * 21 / 20); /* up, and 5% faster */
        if (ball_dyq < -4 * Q) { ball_dyq = -4 * Q; }
    }
}

void refine_c_draw(void) {
    prg32_gfx_clear(PRG32_COLOR_BLACK);
    prg32_gfx_rect(4, 4, score * 4, 6, PRG32_COLOR_GREEN);
    prg32_gfx_rect(paddle_x, PADDLE_Y, PADDLE_W, PADDLE_H, PRG32_COLOR_WHITE);
    prg32_gfx_rect(ball_xq / Q, ball_yq / Q, BALL_SIZE, BALL_SIZE, PRG32_COLOR_YELLOW);
}
