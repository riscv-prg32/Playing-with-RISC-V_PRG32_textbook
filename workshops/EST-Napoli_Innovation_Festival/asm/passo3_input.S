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
.equ PADDLE_SPEED, 4
.equ PADDLE_MAX, 272            # 320 - PADDLE_W: ultima x valida
.equ BTN_LEFT, 1                # bit 0 della maschera dei pulsanti
.equ BTN_RIGHT, 2               # bit 1

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
    addi sp, sp, -16
    sw   ra, 12(sp)

    # --- racchetta: leggi i pulsanti, muovi, resta nello schermo -------------
    call prg32_input_read       # a0 = maschera dei pulsanti premuti
    la   t1, paddle_x
    lw   t2, 0(t1)              # t2 = paddle_x (carica)
    andi t3, a0, BTN_LEFT       # isola il bit SINISTRA
    beqz t3, 1f
    addi t2, t2, -PADDLE_SPEED
1:  andi t3, a0, BTN_RIGHT      # isola il bit DESTRA
    beqz t3, 2f
    addi t2, t2, PADDLE_SPEED
2:  bgez t2, 3f                 # x < 0 ?  allora x = 0
    li   t2, 0
3:  li   t3, PADDLE_MAX
    ble  t2, t3, 4f             # x > 272 ?  allora x = 272
    mv   t2, t3
4:  sw   t2, 0(t1)              # salva paddle_x (memorizza)
    lw   ra, 12(sp)
    addi sp, sp, 16
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
