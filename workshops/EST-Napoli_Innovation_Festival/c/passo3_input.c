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

/* --- Lo stato del gioco: variabili che vivono tra un fotogramma e l'altro - */
static int paddle_x = 136;

/* init: chiamata UNA volta, quando la cartuccia parte. */
void breakout_c_init(void) {
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
}

/* draw: chiamata a OGNI fotogramma. Disegna lo stato, non lo cambia. */
void breakout_c_draw(void) {
    prg32_gfx_clear(PRG32_COLOR_BLACK); /* prima si cancella, poi si disegna */

    /* racchetta: prg32_gfx_rect(x, y, larghezza, altezza, colore) */
    prg32_gfx_rect(paddle_x, PADDLE_Y, PADDLE_W, PADDLE_H, PRG32_COLOR_CYAN);
}
