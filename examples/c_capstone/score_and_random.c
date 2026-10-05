/* Fragment: random spawn, a score, and the persistent scoreboard. */
#include <stdint.h>
#include "prg32.h"

static uint32_t score;
static int target_x;

static void spawn_target(void) {
    /* inclusive range: 0 .. 304 keeps a 16-pixel target on screen */
    target_x = (int)prg32_random_number(0, PRG32_GAME_W - 16);
}

static void round_over(void) {
    /* stores the score under the player name saved in Setup;
       a configured Cartridge Store receives it on the next sync */
    prg32_score_submit_current_player("my-game", score);
    prg32_scoreboard_show("my-game", "HIGH SCORES");
}
