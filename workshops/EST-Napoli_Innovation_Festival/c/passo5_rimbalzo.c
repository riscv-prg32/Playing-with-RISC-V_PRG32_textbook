/*
 * BREAKOUT in C per PRG32
 * Laboratorio "PRG32: videogiochi retro' per imparare il processore europeo
 * RISC-V" - EST Napoli Innovation Festival
 */
#include <stdint.h>
#include "prg32.h"

/* --- Racchetta ----------------------------------------------------------- */
#define PADDLE_W 48
#define PADDLE_H 6
#define PADDLE_Y 188
#define PADDLE_SPEED 4

/* --- Pallina ------------------------------------------------------------- */
#define BALL_SIZE 6

/* --- Lo stato del gioco: variabili che vivono tra un fotogramma e l'altro - */
static int paddle_x = 136;
static int ball_x, ball_y;   /* posizione */
static int ball_dx, ball_dy; /* velocita': pixel per fotogramma, con segno */

/* Rimette la pallina al centro, diretta verso l'alto. */
static void reset_ball(void) {
    ball_x = 157;
    ball_y = 120;
    ball_dx = 2;
    ball_dy = -2;
}

/* init: chiamata UNA volta, quando la cartuccia parte. */
void breakout_c_init(void) {
    reset_ball();
}

/* update: chiamata a OGNI fotogramma. Cambia lo stato, non disegna. */
void breakout_c_update(void) {
    /* racchetta: leggi i pulsanti, muovi, resta nello schermo */
    uint32_t input = prg32_input_read();
    if (input & PRG32_BTN_LEFT) {
        paddle_x -= PADDLE_SPEED;
    }
    if (input & PRG32_BTN_RIGHT) {
        paddle_x += PADDLE_SPEED;
    }
    if (paddle_x < 0) {
        paddle_x = 0;
    }
    if (paddle_x > PRG32_GAME_W - PADDLE_W) {
        paddle_x = PRG32_GAME_W - PADDLE_W;
    }

    /* pallina: posizione = posizione + velocita' */
    ball_x += ball_dx;
    ball_y += ball_dy;
    if (ball_x < 0) { /* muro sinistro */
        ball_x = 0;
        ball_dx = -ball_dx;
    }
    if (ball_x > PRG32_GAME_W - BALL_SIZE) { /* muro destro */
        ball_x = PRG32_GAME_W - BALL_SIZE;
        ball_dx = -ball_dx;
    }
    if (ball_y < 0) { /* soffitto */
        ball_y = 0;
        ball_dy = -ball_dy;
    }
    if (ball_y >= PRG32_GAME_H) { /* persa: si ricomincia dal centro */
        reset_ball();
    }

    /* la pallina tocca la racchetta? Rimbalza solo se sta scendendo. */
    if (ball_dy > 0 &&
        prg32_sprite_hitbox(ball_x, ball_y, BALL_SIZE, BALL_SIZE,
                            paddle_x, PADDLE_Y, PADDLE_W, PADDLE_H)) {
        ball_dy = -ball_dy;
    }
}

/* draw: chiamata a OGNI fotogramma. Disegna lo stato, non lo cambia. */
void breakout_c_draw(void) {
    prg32_gfx_clear(PRG32_COLOR_BLACK); /* prima si cancella, poi si disegna */

    /* racchetta: prg32_gfx_rect(x, y, larghezza, altezza, colore) */
    prg32_gfx_rect(paddle_x, PADDLE_Y, PADDLE_W, PADDLE_H, PRG32_COLOR_CYAN);

    /* pallina */
    prg32_gfx_rect(ball_x, ball_y, BALL_SIZE, BALL_SIZE, PRG32_COLOR_WHITE);
}
