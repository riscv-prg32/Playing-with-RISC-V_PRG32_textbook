/* Event sound with the mixer API: one note per new press of A. */
#include <stdint.h>
#include "prg32.h"

static uint32_t previous_input;

void beep_c_init(void) {
    previous_input = 0;
}

void beep_c_update(void) {
    uint32_t input = prg32_input_read();
    uint32_t pressed = input & ~previous_input; /* edges, not levels */
    previous_input = input;

    if (pressed & PRG32_BTN_A) {
        /* channel, instrument, MIDI note, volume, milliseconds */
        prg32_audio_note(0, 0, 69, 255, 120);
    }
}

void beep_c_draw(void) {
    prg32_gfx_clear(PRG32_COLOR_BLACK);
    prg32_gfx_text8(96, 96, "PRESS A FOR A4", PRG32_COLOR_WHITE,
                    PRG32_COLOR_BLACK);
}
