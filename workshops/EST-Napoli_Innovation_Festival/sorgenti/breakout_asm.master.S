#@ 1
# ---------------------------------------------------------------------------
#  BREAKOUT in assembly RISC-V per PRG32
#  Laboratorio "PRG32: videogiochi retro' per imparare il processore europeo
#  RISC-V" - EST Napoli Innovation Festival
# ---------------------------------------------------------------------------
.option norelax

# --- Colori (RGB565: 5 bit rosso, 6 verde, 5 blu) --------------------------
.equ BLACK,  0x0000
#@ 2
.equ CYAN,   0x07ff
#@ 4
.equ WHITE,  0xffff
#@ 6
.equ RED,    0xf800
.equ YELLOW, 0xffe0
#@ 7
.equ GREEN,  0x07e0
#@ 2

# --- Racchetta --------------------------------------------------------------
.equ PADDLE_W, 48
.equ PADDLE_H, 6
.equ PADDLE_Y, 188
#@ 3
.equ PADDLE_SPEED, 4
.equ PADDLE_MAX, 272            # 320 - PADDLE_W: ultima x valida
.equ BTN_LEFT, 1                # bit 0 della maschera dei pulsanti
.equ BTN_RIGHT, 2               # bit 1
#@ 4

# --- Pallina ----------------------------------------------------------------
.equ BALL_SIZE, 6
.equ BALL_MAX_X, 314            # 320 - BALL_SIZE
.equ SCREEN_H, 200
#@ 6

# --- Mattoncini: 2 righe da 8 -----------------------------------------------
.equ BRICK_COUNT, 16
.equ BRICK_W, 36
.equ BRICK_H, 10
.equ BRICK_PITCH_X, 40          # distanza tra due mattoncini vicini
.equ BRICK_PITCH_Y, 14
.equ BRICK_TOP, 24
#@ 1

.section .text
.global breakout_init
.global breakout_update
.global breakout_draw

# ===========================================================================
#  init: chiamata UNA volta, quando la cartuccia parte
# ===========================================================================
breakout_init:
#@ 1-3
    ret
#@ 4
    addi sp, sp, -16
    sw   ra, 12(sp)             # salviamo ra: stiamo per fare una call
    call reset_ball
#@ 6
    la   t0, bricks             # tutti i mattoncini tornano presenti
    li   t1, BRICK_COUNT
    li   t2, 1
1:  sb   t2, 0(t0)
    addi t0, t0, 1
    addi t1, t1, -1
    bnez t1, 1b
#@ 7
    la   t0, score
    sw   zero, 0(t0)            # punteggio a zero
#@ 4
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
#@ 1

# ===========================================================================
#  update: chiamata a OGNI fotogramma. Cambia lo stato, non disegna.
# ===========================================================================
breakout_update:
#@ 1-2
    ret
#@ 3
    addi sp, sp, -16
    sw   ra, 12(sp)
#@ 7
    sw   s0, 8(sp)              # s0 sara' l'indice del ciclo sui mattoncini
#@ 3

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
#@ 4

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
#@ 5

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
#@ 7
    li   a0, 0                  # canale
    li   a1, 0                  # strumento
    li   a2, 60                 # nota MIDI 60 = Do
    li   a3, 255                # volume
    li   a4, 40                 # millisecondi
    call prg32_audio_note
#@ 5
no_paddle_hit:
#@ 7

    # --- la pallina tocca un mattoncino? --------------------------------------
    li   s0, 0                  # s0 = indice del mattoncino (0..15)
brick_loop:
    la   t0, bricks
    add  t0, t0, s0
    lbu  t1, 0(t0)              # 1 = presente, 0 = distrutto
    beqz t1, brick_next
    la   t0, ball_x
    lw   a0, 0(t0)
    la   t0, ball_y
    lw   a1, 0(t0)
    li   a2, BALL_SIZE
    li   a3, BALL_SIZE
    andi t2, s0, 7              # colonna = indice AND 7   (0..7)
    li   t3, BRICK_PITCH_X
    mul  a4, t2, t3
    addi a4, a4, 2              # x = 2 + colonna * 40
    srli t2, s0, 3              # riga = indice / 8        (0..1)
    li   t3, BRICK_PITCH_Y
    mul  a5, t2, t3
    addi a5, a5, BRICK_TOP      # y = 24 + riga * 14
    li   a6, BRICK_W
    li   a7, BRICK_H
    call prg32_sprite_hitbox
    beqz a0, brick_next
    la   t0, bricks
    add  t0, t0, s0
    sb   zero, 0(t0)            # il mattoncino sparisce
    la   t0, ball_dy
    lw   t1, 0(t0)
    neg  t1, t1                 # la pallina torna indietro
    sw   t1, 0(t0)
    la   t0, score
    lw   t1, 0(t0)
    addi t1, t1, 1              # un punto
    sw   t1, 0(t0)
    li   a0, 0
    li   a1, 0
    li   a2, 76                 # nota MIDI 76 = Mi acuto
    li   a3, 255
    li   a4, 40
    call prg32_audio_note
    j    bricks_done            # al massimo un mattoncino per fotogramma
brick_next:
    addi s0, s0, 1
    li   t0, BRICK_COUNT
    blt  s0, t0, brick_loop
bricks_done:
#@ 8

    # --- vittoria: tutti i mattoncini distrutti -> nuova partita --------------
    la   t0, score
    lw   t1, 0(t0)
    li   t2, BRICK_COUNT
    blt  t1, t2, update_end
    call breakout_init
update_end:
#@ 7
    lw   s0, 8(sp)
#@ 3
    lw   ra, 12(sp)
    addi sp, sp, 16
    ret
#@ 1

# ===========================================================================
#  draw: chiamata a OGNI fotogramma. Disegna lo stato, non lo cambia.
# ===========================================================================
breakout_draw:
    addi sp, sp, -16
    sw   ra, 12(sp)
#@ 6
    sw   s0, 8(sp)
#@ 1

    li   a0, BLACK
    call prg32_gfx_clear        # prima si cancella, poi si disegna
#@ 6

    # --- mattoncini -------------------------------------------------------------
    li   s0, 0
draw_brick_loop:
    la   t0, bricks
    add  t0, t0, s0
    lbu  t1, 0(t0)
    beqz t1, draw_brick_next    # distrutto: non si disegna
    andi t2, s0, 7
    li   t3, BRICK_PITCH_X
    mul  a0, t2, t3
    addi a0, a0, 2              # a0 = x
    srli t2, s0, 3
    li   t3, BRICK_PITCH_Y
    mul  a1, t2, t3
    addi a1, a1, BRICK_TOP      # a1 = y
    li   a2, BRICK_W
    li   a3, BRICK_H
    li   a4, RED                # riga 0 rossa
    beqz t2, 1f
    li   a4, YELLOW             # riga 1 gialla
1:  call prg32_gfx_rect
draw_brick_next:
    addi s0, s0, 1
    li   t0, BRICK_COUNT
    blt  s0, t0, draw_brick_loop
#@ 7

    # --- punteggio: una barra verde lunga 8 pixel per punto ---------------------
    la   t0, score
    lw   t1, 0(t0)
    beqz t1, 2f
    slli a2, t1, 3              # larghezza = punti * 8
    li   a0, 2
    li   a1, 6
    li   a3, 6
    li   a4, GREEN
    call prg32_gfx_rect
2:
#@ 2

    # --- racchetta: prg32_gfx_rect(x, y, w, h, colore) --------------------------
    la   t0, paddle_x
    lw   a0, 0(t0)              # a0 = x, letta dalla memoria
    li   a1, PADDLE_Y           # a1 = y
    li   a2, PADDLE_W           # a2 = larghezza
    li   a3, PADDLE_H           # a3 = altezza
    li   a4, CYAN               # a4 = colore
    call prg32_gfx_rect
#@ 4

    # --- pallina ----------------------------------------------------------------
    la   t0, ball_x
    lw   a0, 0(t0)
    la   t0, ball_y
    lw   a1, 0(t0)
    li   a2, BALL_SIZE
    li   a3, BALL_SIZE
    li   a4, WHITE
    call prg32_gfx_rect
#@ 6

    lw   s0, 8(sp)
#@ 1
    lw   ra, 12(sp)
    addi sp, sp, 16
    ret
#@ 2

# ===========================================================================
#  Lo stato del gioco: numeri in memoria, ognuno con un nome
# ===========================================================================
.section .data
paddle_x: .word 136
#@ 4
ball_x:   .word 157
ball_y:   .word 120
ball_dx:  .word 2
ball_dy:  .word -2
#@ 7
score:    .word 0
#@ 6
bricks:   .fill BRICK_COUNT, 1, 1     # 16 byte, tutti a 1
