# ---------------------------------------------------------------------------
#  BREAKOUT in assembly RISC-V per PRG32
#  Laboratorio "PRG32: videogiochi retro' per imparare il processore europeo
#  RISC-V" - EST Napoli Innovation Festival
# ---------------------------------------------------------------------------
.option norelax

# --- Colori (RGB565: 5 bit rosso, 6 verde, 5 blu) --------------------------
.equ BLACK,  0x0000
.equ CYAN,   0x07ff
.equ WHITE,  0xffff

# --- Racchetta --------------------------------------------------------------
.equ PADDLE_W, 48
.equ PADDLE_H, 6
.equ PADDLE_Y, 188
.equ PADDLE_SPEED, 4
.equ PADDLE_MAX, 272            # 320 - PADDLE_W: ultima x valida
.equ BTN_LEFT, 1                # bit 0 della maschera dei pulsanti
.equ BTN_RIGHT, 2               # bit 1

# --- Pallina ----------------------------------------------------------------
.equ BALL_SIZE, 6
.equ BALL_MAX_X, 314            # 320 - BALL_SIZE
.equ SCREEN_H, 200

.section .text
.global breakout_init
.global breakout_update
.global breakout_draw

# ===========================================================================
#  init: chiamata UNA volta, quando la cartuccia parte
# ===========================================================================
breakout_init:
    addi sp, sp, -16
    sw   ra, 12(sp)             # salviamo ra: stiamo per fare una call
    call reset_ball
    lw   ra, 12(sp)
    addi sp, sp, 16
    ret

# Rimette la pallina al centro, diretta verso l'alto.
reset_ball:
    la   t0, ball_x
    li   t1, 157
    sw   t1, 0(t0)
    la   t0, ball_y
    li   t1, 120
    sw   t1, 0(t0)
    la   t0, ball_dx
    li   t1, 2
    sw   t1, 0(t0)
    la   t0, ball_dy
    li   t1, -2
    sw   t1, 0(t0)
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

    # --- pallina: x = x + dx, rimbalzo sui muri laterali ----------------------
    la   t1, ball_x
    lw   t2, 0(t1)
    la   t3, ball_dx
    lw   t4, 0(t3)
    add  t2, t2, t4
    bgez t2, 5f                 # muro sinistro
    li   t2, 0
    neg  t4, t4
5:  li   t5, BALL_MAX_X
    ble  t2, t5, 6f             # muro destro
    mv   t2, t5
    neg  t4, t4
6:  sw   t2, 0(t1)
    sw   t4, 0(t3)

    # --- pallina: y = y + dy, rimbalzo sul soffitto ---------------------------
    la   t1, ball_y
    lw   t2, 0(t1)
    la   t3, ball_dy
    lw   t4, 0(t3)
    add  t2, t2, t4
    bgez t2, 7f
    li   t2, 0
    neg  t4, t4
7:  sw   t2, 0(t1)
    sw   t4, 0(t3)
    li   t5, SCREEN_H
    blt  t2, t5, 8f             # pallina ancora in campo?
    call reset_ball             # persa: si ricomincia dal centro
8:

    # --- la pallina tocca la racchetta? ---------------------------------------
    la   t0, ball_x
    lw   a0, 0(t0)              # a0..a3 = rettangolo della pallina
    la   t0, ball_y
    lw   a1, 0(t0)
    li   a2, BALL_SIZE
    li   a3, BALL_SIZE
    la   t0, paddle_x
    lw   a4, 0(t0)              # a4..a7 = rettangolo della racchetta
    li   a5, PADDLE_Y
    li   a6, PADDLE_W
    li   a7, PADDLE_H
    call prg32_sprite_hitbox    # a0 != 0 se i due rettangoli si toccano
    beqz a0, no_paddle_hit
    la   t0, ball_dy
    lw   t1, 0(t0)
    blez t1, no_paddle_hit      # rimbalza solo se sta scendendo
    neg  t1, t1
    sw   t1, 0(t0)
no_paddle_hit:
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

    # --- pallina ----------------------------------------------------------------
    la   t0, ball_x
    lw   a0, 0(t0)
    la   t0, ball_y
    lw   a1, 0(t0)
    li   a2, BALL_SIZE
    li   a3, BALL_SIZE
    li   a4, WHITE
    call prg32_gfx_rect
    lw   ra, 12(sp)
    addi sp, sp, 16
    ret

# ===========================================================================
#  Lo stato del gioco: numeri in memoria, ognuno con un nome
# ===========================================================================
.section .data
paddle_x: .word 136
ball_x:   .word 157
ball_y:   .word 120
ball_dx:  .word 2
ball_dy:  .word -2
