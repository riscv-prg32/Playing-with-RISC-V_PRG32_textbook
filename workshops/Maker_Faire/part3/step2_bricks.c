/*
 * Maker Faire workshop, Part 3: from assembly to C.
 * The game logic moves to C; the ball physics stays in hand-written RISC-V
 * assembly, in the same cartridge.  C and assembly meet at the calling
 * convention: arguments in a0, a1, a2..., result in a0.
 */
#include <stdint.h>
#include "prg32.h"

#define PADDLE_W 64
#define PADDLE_H 8
#define PADDLE_Y 188
#define BALL_SIZE 8
#define BRICKS 16
#define BRICK_COLS 8

/* ---- The assembly module -------------------------------------------------
 * int ball_step_asm(int *position, int *velocity, int max);
 *   position += velocity; bounce (clamp and negate) at 0 and at max.
 *   Returns 1 if the ball bounced, 0 otherwise.
 * The cartridge builder takes one source file, so the module is embedded
 * here as a top-level assembly block; it is ordinary assembly all the same.
 */
int ball_step_asm(int *position, int *velocity, int max);
__asm__(
"    .text\n"
"    .globl ball_step_asm\n"
"ball_step_asm:\n"
"    lw   t0, 0(a0)\n"        /* t0 = *position      (a0 = 1st argument) */
"    lw   t1, 0(a1)\n"        /* t1 = *velocity      (a1 = 2nd argument) */
"    add  t0, t0, t1\n"       /* position += velocity                    */
"    li   t2, 0\n"            /* t2 = bounced? no                        */
"    bgez t0, 1f\n"
"    li   t0, 0\n"            /* below 0: clamp...                       */
"    neg  t1, t1\n"           /* ...and reverse                          */
"    li   t2, 1\n"
"1:  ble  t0, a2, 2f\n"       /* a2 = max            (3rd argument)      */
"    mv   t0, a2\n"
"    neg  t1, t1\n"
"    li   t2, 1\n"
"2:  sw   t0, 0(a0)\n"
"    sw   t1, 0(a1)\n"
"    mv   a0, t2\n"           /* return value goes back in a0            */
"    ret\n"
);

/* ---- The C module ---------------------------------------------------------- */
static int paddle_x, ball_x, ball_y, ball_dx, ball_dy;
static uint8_t bricks[BRICKS]; /* 1 = present, 0 = destroyed */

static int brick_x(int i) { return 2 + (i % BRICK_COLS) * 40; }
static int brick_y(int i) { return 24 + (i / BRICK_COLS) * 14; }

void mixed_init(void) {
    paddle_x = (PRG32_GAME_W - PADDLE_W) / 2;
    ball_x = 156;
    ball_y = 120;
    ball_dx = 2;
    ball_dy = -2;
    for (int i = 0; i < BRICKS; i++) {
        bricks[i] = 1;
    }
}

void mixed_update(void) {
    uint32_t input = prg32_input_read();
    if (input & PRG32_BTN_LEFT)  { paddle_x -= 4; }
    if (input & PRG32_BTN_RIGHT) { paddle_x += 4; }
    if (paddle_x < 0) { paddle_x = 0; }
    if (paddle_x > PRG32_GAME_W - PADDLE_W) { paddle_x = PRG32_GAME_W - PADDLE_W; }

    /* C calls assembly: pass two addresses and a limit */
    ball_step_asm(&ball_x, &ball_dx, PRG32_GAME_W - BALL_SIZE);
    ball_step_asm(&ball_y, &ball_dy, 100000); /* no floor: the ball can be lost */
    if (ball_y >= PRG32_GAME_H) {
        ball_x = 156;
        ball_y = 120;
        ball_dy = -2;
    }

    if (ball_dy > 0 &&
        prg32_sprite_hitbox(ball_x, ball_y, BALL_SIZE, BALL_SIZE,
                            paddle_x, PADDLE_Y, PADDLE_W, PADDLE_H)) {
        ball_dy = -ball_dy;
    }

    /* in C a loop over an array is three lines */
    for (int i = 0; i < BRICKS; i++) {
        if (bricks[i] &&
            prg32_sprite_hitbox(ball_x, ball_y, BALL_SIZE, BALL_SIZE,
                                brick_x(i), brick_y(i), 36, 10)) {
            bricks[i] = 0;
            ball_dy = -ball_dy;
            break;
        }
    }
}

void mixed_draw(void) {
    prg32_gfx_clear(PRG32_COLOR_BLACK);
    for (int i = 0; i < BRICKS; i++) {
        if (bricks[i]) {
            prg32_gfx_rect(brick_x(i), brick_y(i), 36, 10,
                           i < BRICK_COLS ? PRG32_COLOR_RED : PRG32_COLOR_YELLOW);
        }
    }
    prg32_gfx_rect(paddle_x, PADDLE_Y, PADDLE_W, PADDLE_H, PRG32_COLOR_WHITE);
    prg32_gfx_rect(ball_x, ball_y, BALL_SIZE, BALL_SIZE, PRG32_COLOR_YELLOW);
}
