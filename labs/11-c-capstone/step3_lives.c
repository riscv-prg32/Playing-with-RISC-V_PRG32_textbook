/* C Lab 3: refactor, refine, ship.  Starts where C Lab 1 ended. */
#include <stdint.h>
#include "prg32.h"

#define PADDLE_W 64
#define PADDLE_H 8
#define PADDLE_Y 188
#define PADDLE_SPEED 3
#define BALL_SIZE 8
#define Q 256 /* fixed-point scale: 8 fractional bits */
#define LIVES 3

static int paddle_x;
static int ball_xq, ball_yq;   /* position, times 256 */
static int ball_dxq, ball_dyq; /* velocity, times 256 */
static int score;
static int lives, game_over;
static uint32_t previous_input;

static int clamp(int value, int low, int high) {
    if (value < low)  { return low; }
    if (value > high) { return high; }
    return value;
}

static void serve(void) {
    ball_xq = 156 * Q;
    ball_yq = 96 * Q;
    ball_dxq = 3 * Q / 2; /* 1.5 pixels per frame: multiply before dividing */
    ball_dyq = 1 * Q;
}

void refine_c_init(void) {
    paddle_x = (PRG32_GAME_W - PADDLE_W) / 2;
    serve();
    lives = LIVES;
    game_over = 0;
    score = 0;
}

void refine_c_update(void) {
    uint32_t input = prg32_input_read();
    uint32_t pressed = input & ~previous_input; /* edges, not levels */
    previous_input = input;

    if (game_over) {
        if (pressed & PRG32_BTN_A) {
            refine_c_init();
        }
        return;
    }
    if (input & PRG32_BTN_LEFT)  { paddle_x -= PADDLE_SPEED; }
    if (input & PRG32_BTN_RIGHT) { paddle_x += PADDLE_SPEED; }
    paddle_x = clamp(paddle_x, 0, PRG32_GAME_W - PADDLE_W);

    ball_xq += ball_dxq;
    ball_yq += ball_dyq;
    if (ball_xq < 0 || ball_xq > (PRG32_GAME_W - BALL_SIZE) * Q) { ball_dxq = -ball_dxq; }
    if (ball_yq < 0) { ball_dyq = -ball_dyq; }
    if (ball_yq > PRG32_GAME_H * Q) { /* missed */
        prg32_audio_note(0, 0, 48, 255, 150);
        lives -= 1;
        serve();
        if (lives == 0) {
            game_over = 1;
        }
    }
    if (ball_dyq > 0 &&
        prg32_sprite_hitbox(ball_xq / Q, ball_yq / Q, BALL_SIZE, BALL_SIZE,
                            paddle_x, PADDLE_Y, PADDLE_W, PADDLE_H)) {
        score += 1;
        ball_dyq = -(ball_dyq * 21 / 20); /* up, and 5% faster */
        if (ball_dyq < -4 * Q) { ball_dyq = -4 * Q; }
        prg32_audio_note(0, 0, 72, 255, 60);
    }
}

void refine_c_draw(void) {
    prg32_gfx_clear(PRG32_COLOR_BLACK);
    prg32_gfx_rect(4, 4, score * 4, 6, PRG32_COLOR_GREEN);
    for (int i = 0; i < lives; i++) {
        prg32_gfx_rect(PRG32_GAME_W - 12 - i * 12, 4, 8, 8, PRG32_COLOR_YELLOW);
    }
    prg32_gfx_rect(paddle_x, PADDLE_Y, PADDLE_W, PADDLE_H, PRG32_COLOR_WHITE);
    prg32_gfx_rect(ball_xq / Q, ball_yq / Q, BALL_SIZE, BALL_SIZE, PRG32_COLOR_YELLOW);
    if (game_over) {
        prg32_gfx_text8(124, 92, "GAME OVER", PRG32_COLOR_RED, PRG32_COLOR_BLACK);
        prg32_gfx_text8(92, 108, "PRESS A TO RESTART", PRG32_COLOR_WHITE, PRG32_COLOR_BLACK);
    }
}
