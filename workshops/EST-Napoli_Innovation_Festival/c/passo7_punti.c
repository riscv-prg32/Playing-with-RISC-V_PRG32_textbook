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

/* --- Mattoncini: 2 righe da 8 -------------------------------------------- */
#define BRICK_COLS 8
#define BRICK_COUNT 16
#define BRICK_W 36
#define BRICK_H 10
#define BRICK_PITCH_X 40 /* distanza tra due mattoncini vicini */
#define BRICK_PITCH_Y 14
#define BRICK_TOP 24

/* --- Lo stato del gioco: variabili che vivono tra un fotogramma e l'altro - */
static int paddle_x = 136;
static int ball_x, ball_y;   /* posizione */
static int ball_dx, ball_dy; /* velocita': pixel per fotogramma, con segno */
static uint8_t bricks[BRICK_COUNT]; /* 1 = presente, 0 = distrutto */
static int score;

/* Dove si trova il mattoncino numero i? */
static int brick_x(int i) { return 2 + (i % BRICK_COLS) * BRICK_PITCH_X; }
static int brick_y(int i) { return BRICK_TOP + (i / BRICK_COLS) * BRICK_PITCH_Y; }

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
    for (int i = 0; i < BRICK_COUNT; i++) {
        bricks[i] = 1;
    }
    score = 0;
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
        prg32_audio_note(0, 0, 60, 255, 40); /* nota MIDI 60 = Do */
    }

    /* la pallina tocca un mattoncino? */
    for (int i = 0; i < BRICK_COUNT; i++) {
        if (bricks[i] &&
            prg32_sprite_hitbox(ball_x, ball_y, BALL_SIZE, BALL_SIZE,
                                brick_x(i), brick_y(i), BRICK_W, BRICK_H)) {
            bricks[i] = 0;       /* il mattoncino sparisce */
            ball_dy = -ball_dy;  /* la pallina torna indietro */
            score += 1;
            prg32_audio_note(0, 0, 76, 255, 40); /* Mi acuto */
            break;               /* al massimo uno per fotogramma */
        }
    }
}

/* draw: chiamata a OGNI fotogramma. Disegna lo stato, non lo cambia. */
void breakout_c_draw(void) {
    prg32_gfx_clear(PRG32_COLOR_BLACK); /* prima si cancella, poi si disegna */

    for (int i = 0; i < BRICK_COUNT; i++) {
        if (bricks[i]) {
            uint16_t color = (i < BRICK_COLS) ? PRG32_COLOR_RED : PRG32_COLOR_YELLOW;
            prg32_gfx_rect(brick_x(i), brick_y(i), BRICK_W, BRICK_H, color);
        }
    }

    /* punteggio: una barra verde lunga 8 pixel per punto */
    prg32_gfx_rect(2, 6, score * 8, 6, PRG32_COLOR_GREEN);

    /* racchetta: prg32_gfx_rect(x, y, larghezza, altezza, colore) */
    prg32_gfx_rect(paddle_x, PADDLE_Y, PADDLE_W, PADDLE_H, PRG32_COLOR_CYAN);

    /* pallina */
    prg32_gfx_rect(ball_x, ball_y, BALL_SIZE, BALL_SIZE, PRG32_COLOR_WHITE);
}
