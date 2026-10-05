/*
 * BREAKOUT in C per PRG32
 * Laboratorio "PRG32: videogiochi retro' per imparare il processore europeo
 * RISC-V" - EST Napoli Innovation Festival
 */
#include <stdint.h>
#include "prg32.h"

/* init: chiamata UNA volta, quando la cartuccia parte. */
void breakout_c_init(void) {
}

/* update: chiamata a OGNI fotogramma. Cambia lo stato, non disegna. */
void breakout_c_update(void) {
}

/* draw: chiamata a OGNI fotogramma. Disegna lo stato, non lo cambia. */
void breakout_c_draw(void) {
    prg32_gfx_clear(PRG32_COLOR_BLACK); /* prima si cancella, poi si disegna */
}
