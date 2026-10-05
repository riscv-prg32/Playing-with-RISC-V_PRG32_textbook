# ---------------------------------------------------------------------------
#  BREAKOUT in assembly RISC-V per PRG32
#  Laboratorio "PRG32: videogiochi retro' per imparare il processore europeo
#  RISC-V" - EST Napoli Innovation Festival
# ---------------------------------------------------------------------------
.option norelax

# --- Colori (RGB565: 5 bit rosso, 6 verde, 5 blu) --------------------------
.equ BLACK,  0x0000

.section .text
.global breakout_init
.global breakout_update
.global breakout_draw

# ===========================================================================
#  init: chiamata UNA volta, quando la cartuccia parte
# ===========================================================================
breakout_init:
    ret

# ===========================================================================
#  update: chiamata a OGNI fotogramma. Cambia lo stato, non disegna.
# ===========================================================================
breakout_update:
    ret

# ===========================================================================
#  draw: chiamata a OGNI fotogramma. Disegna lo stato, non lo cambia.
# ===========================================================================
breakout_draw:
    addi sp, sp, -16
    sw   ra, 12(sp)

    li   a0, BLACK
    call prg32_gfx_clear        # prima si cancella, poi si disegna
    lw   ra, 12(sp)
    addi sp, sp, 16
    ret
