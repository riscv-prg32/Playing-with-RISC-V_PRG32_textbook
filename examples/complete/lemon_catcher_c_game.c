/*
 * Lemon Catcher in hand-written C.
 *
 * The same game the Young Makers track builds with blocks in the
 * PRG32 Construction Kit, rewritten the way a C programmer would write it:
 * named constants, a helper function, a real score printed as digits, and a
 * score submitted to the scoreboard when the round ends.
 *
 * Build (from a PRG32 checkout, ESP-IDF active):
 *   python3 -m prg32 cartridge build lemon_catcher_c_game.c --portable \
 *     --entry-prefix lemon_catcher_c --name lemon-catcher \
 *     --out lemon-catcher.prg32
 */
#include <stdint.h>
#include "prg32.h"

#define BASKET_W 32
#define BASKET_H 8
#define BASKET_Y 180
#define BASKET_SPEED 4
#define LEMON_SIZE 10
#define FLOOR_Y 196
#define MAX_MISSES 5
#define NOTE_CATCH 81 /* MIDI A5 */
#define NOTE_MISS 57  /* MIDI A3 */

static int basket_x;
static int lemon_x;
static int lemon_y;
static int lemon_speed;
static uint32_t score;
static int misses;
static int game_over;

/* Put a new lemon at the top, at a random column. */
static void lemon_reset(void) {
    lemon_x = (int)prg32_random_number(0, PRG32_GAME_W - LEMON_SIZE);
    lemon_y = 0;
}

/* Write an unsigned number as decimal digits; returns the string. */
static const char *to_decimal(uint32_t value, char *buffer, int size) {
    int i = size - 1;
    buffer[i] = '\0';
    do {
        buffer[--i] = (char)('0' + value % 10u);
        value /= 10u;
    } while (value != 0u && i > 0);
    return &buffer[i];
}

void lemon_catcher_c_init(void) {
    basket_x = (PRG32_GAME_W - BASKET_W) / 2;
    lemon_speed = 2;
    score = 0;
    misses = 0;
    game_over = 0;
    lemon_reset();
}

void lemon_catcher_c_update(void) {
    uint32_t input = prg32_input_read();

    if (game_over) {
        if (input & PRG32_BTN_A) {
            lemon_catcher_c_init();
        }
        return;
    }

    if (input & PRG32_BTN_LEFT) {
        basket_x -= BASKET_SPEED;
    }
    if (input & PRG32_BTN_RIGHT) {
        basket_x += BASKET_SPEED;
    }
    if (basket_x < 0) {
        basket_x = 0;
    }
    if (basket_x > PRG32_GAME_W - BASKET_W) {
        basket_x = PRG32_GAME_W - BASKET_W;
    }

    lemon_y += lemon_speed;

    if (prg32_sprite_hitbox(lemon_x, lemon_y, LEMON_SIZE, LEMON_SIZE,
                            basket_x, BASKET_Y, BASKET_W, BASKET_H)) {
        score += 1;
        prg32_audio_note(0, 0, NOTE_CATCH, 255, 80);
        if (score % 10u == 0u && lemon_speed < 6) {
            lemon_speed += 1; /* every ten lemons the game gets harder */
        }
        lemon_reset();
    } else if (lemon_y + LEMON_SIZE >= FLOOR_Y) {
        misses += 1;
        prg32_audio_note(0, 0, NOTE_MISS, 255, 150);
        lemon_reset();
        if (misses >= MAX_MISSES) {
            game_over = 1;
            prg32_score_submit_current_player("lemon-catcher", score);
        }
    }
}

void lemon_catcher_c_draw(void) {
    char digits[12];
    int i;

    prg32_gfx_clear(PRG32_COLOR_BLACK);
    prg32_gfx_text8(8, 4, "SCORE", PRG32_COLOR_GREEN, PRG32_COLOR_BLACK);
    prg32_gfx_text8(56, 4, to_decimal(score, digits, (int)sizeof digits),
                    PRG32_COLOR_WHITE, PRG32_COLOR_BLACK);
    for (i = 0; i < MAX_MISSES - misses; i++) {
        prg32_gfx_rect(PRG32_GAME_W - 12 - i * 12, 4, 8, 8, PRG32_COLOR_YELLOW);
    }

    prg32_gfx_rect(lemon_x, lemon_y, LEMON_SIZE, LEMON_SIZE,
                   PRG32_COLOR_YELLOW);
    prg32_gfx_rect(basket_x, BASKET_Y, BASKET_W, BASKET_H, 0xFD20);
    prg32_gfx_rect(0, FLOOR_Y, PRG32_GAME_W, 4, PRG32_COLOR_BLUE);

    if (game_over) {
        prg32_gfx_text8(124, 92, "GAME OVER", PRG32_COLOR_RED,
                        PRG32_COLOR_BLACK);
        prg32_gfx_text8(92, 108, "PRESS A TO RESTART", PRG32_COLOR_WHITE,
                        PRG32_COLOR_BLACK);
    }
}
