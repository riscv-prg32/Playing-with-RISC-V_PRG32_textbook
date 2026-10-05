# ---------------------------------------------------------------------------
#  BREAKOUT in assembly RISC-V per PRG32
#  Laboratorio "PRG32: videogiochi retro' per imparare il processore europeo
#  RISC-V" - EST Napoli Innovation Festival
# ---------------------------------------------------------------------------
.option norelax

# --- Colori (RGB565: 5 bit rosso, 6 verde, 5 blu) --------------------------
.equ BLACK,  0x0000
.equ CYAN,   0x07ff

# --- Racchetta --------------------------------------------------------------
.equ PADDLE_W, 48
.equ PADDLE_H, 6
.equ PADDLE_Y, 188

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

    # --- racchetta: prg32_gfx_rect(x, y, w, h, colore) --------------------------
    la   t0, paddle_x
    lw   a0, 0(t0)              # a0 = x, letta dalla memoria
    li   a1, PADDLE_Y           # a1 = y
    li   a2, PADDLE_W           # a2 = larghezza
    li   a3, PADDLE_H           # a3 = altezza
    li   a4, CYAN               # a4 = colore
    call prg32_gfx_rect
    lw   ra, 12(sp)
    addi sp, sp, 16
    ret

# ===========================================================================
#  Lo stato del gioco: numeri in memoria, ognuno con un nome
# ===========================================================================
.section .data
paddle_x: .word 136
