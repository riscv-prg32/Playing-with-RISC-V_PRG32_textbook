#@ 1
# Assembly Labs 3 and 4: Pong, one verified step at a time.
.option norelax
.equ BLACK,  0x0000
#@ 2
.equ WHITE,  0xffff
.equ PADDLE_Y, 188
.equ PADDLE_W, 64
.equ PADDLE_H, 8
#@ 3
.equ PADDLE_SPEED, 4
.equ PADDLE_MAX, 256           # 320 - PADDLE_W
#@ 4
.equ YELLOW, 0xffe0
.equ BALL_SIZE, 8
.equ BALL_MAX_X, 312           # 320 - BALL_SIZE
#@ 7
.equ GREEN,  0x07e0
#@ 9
.equ BTN_A, 0x10
#@ 1

.section .text
.global pong_init
.global pong_update
.global pong_draw

pong_init:
    ret

pong_update:
#@ 1-2
    ret
#@ 3
    addi sp, sp, -16
    sw   ra, 12(sp)
#@ 9
    sw   s0, 8(sp)

    # --- pause: toggle on the EDGE of A, not on its level -------------------
    call prg32_input_read
    mv   s0, a0                # s0 survives the calls below
    la   t0, previous_input
    lw   t1, 0(t0)             # buttons held last frame
    sw   s0, 0(t0)             # remember this frame for the next one
    not  t1, t1
    and  t1, s0, t1            # set now AND clear before = newly pressed
    andi t1, t1, BTN_A
    beqz t1, 9f
    la   t0, paused
    lw   t2, 0(t0)
    xori t2, t2, 1             # flip 0 <-> 1
    sw   t2, 0(t0)
9:  la   t0, paused
    lw   t2, 0(t0)
    bnez t2, update_done       # paused: skip the rest of update
    mv   a0, s0                # the paddle code below expects input in a0
#@ 3-8

    call prg32_input_read      # a0 = button mask
#@ 3

    # --- paddle: move with LEFT / RIGHT, clamp to the screen -----------------
    la   t1, paddle_x
    lw   t2, 0(t1)
    andi t3, a0, 1             # LEFT
    beqz t3, 1f
    addi t2, t2, -PADDLE_SPEED
1:  andi t3, a0, 2             # RIGHT
    beqz t3, 2f
    addi t2, t2, PADDLE_SPEED
2:  bgez t2, 3f
    li   t2, 0
3:  li   t3, PADDLE_MAX
    ble  t2, t3, 4f
    mv   t2, t3
4:  sw   t2, 0(t1)
#@ 4

    # --- ball x: add velocity, bounce off the side walls ----------------------
    la   t1, ball_x
    lw   t2, 0(t1)
    la   t3, ball_dx
    lw   t4, 0(t3)
    add  t2, t2, t4            # x = x + dx
    bgez t2, 5f
    li   t2, 0                 # clamp to the left edge
    neg  t4, t4                # and reverse
5:  li   t5, BALL_MAX_X
    ble  t2, t5, 6f
    mv   t2, t5                # clamp to the right edge
    neg  t4, t4
6:  sw   t2, 0(t1)
    sw   t4, 0(t3)
#@ 5

    # --- ball y: add velocity, bounce off the top ----------------------------
    la   t1, ball_y
    lw   t2, 0(t1)
    la   t3, ball_dy
    lw   t4, 0(t3)
    add  t2, t2, t4            # y = y + dy
    bgez t2, 7f
    li   t2, 0
    neg  t4, t4
7:  sw   t2, 0(t1)
    sw   t4, 0(t3)
#@ 6

    # --- lost ball: below the screen, restart from the top -------------------
    li   t5, 200
    blt  t2, t5, 8f
    li   t2, 40
    sw   t2, 0(t1)
8:

    # --- paddle collision -----------------------------------------------------
    la   t0, ball_x
    lw   a0, 0(t0)             # a0..a3: the ball rectangle
    la   t0, ball_y
    lw   a1, 0(t0)
    li   a2, BALL_SIZE
    li   a3, BALL_SIZE
    la   t0, paddle_x
    lw   a4, 0(t0)             # a4..a7: the paddle rectangle
    li   a5, PADDLE_Y
    li   a6, PADDLE_W
    li   a7, PADDLE_H
    call prg32_sprite_hitbox   # a0 = non-zero if they overlap
    beqz a0, update_done
    la   t0, ball_dy
    lw   t1, 0(t0)
    blez t1, update_done       # guard: bounce only while moving down
    neg  t1, t1
    sw   t1, 0(t0)
#@ 7
    la   t0, score
    lw   t1, 0(t0)
    addi t1, t1, 1             # inside the guard: one hit, one point
    sw   t1, 0(t0)
#@ 8
    li   a0, 0                 # channel
    li   a1, 0                 # instrument
    li   a2, 72                # MIDI note 72 = C5
    li   a3, 255               # volume
    li   a4, 60                # milliseconds
    call prg32_audio_note      # t registers are dead after this call
#@ 3

update_done:
#@ 9
    lw   s0, 8(sp)
#@ 3
    lw   ra, 12(sp)
    addi sp, sp, 16
    ret
#@ 1

pong_draw:
    addi sp, sp, -16
    sw   ra, 12(sp)

    li   a0, BLACK
    call prg32_gfx_clear       # fill the 320x200 viewport
#@ 7

    # --- score: a bar 4 pixels long per point, at most 312 -------------------
    la   t0, score
    lw   t1, 0(t0)
    slli a2, t1, 2             # width = score * 4
    li   t2, 312
    ble  a2, t2, 1f
    mv   a2, t2
1:  li   a0, 4
    li   a1, 4
    li   a3, 6
    li   a4, GREEN
    call prg32_gfx_rect
#@ 2

    # --- paddle: prg32_gfx_rect(x, y, w, h, color) ---------------------------
    la   t0, paddle_x
    lw   a0, 0(t0)             # x comes from memory: it is state
    li   a1, PADDLE_Y
    li   a2, PADDLE_W
    li   a3, PADDLE_H
    li   a4, WHITE
    call prg32_gfx_rect
#@ 4

    # --- ball -------------------------------------------------------------------
    la   t0, ball_x
    lw   a0, 0(t0)
    la   t0, ball_y
    lw   a1, 0(t0)
    li   a2, BALL_SIZE
    li   a3, BALL_SIZE
    li   a4, YELLOW
    call prg32_gfx_rect
#@ 1

    lw   ra, 12(sp)
    addi sp, sp, 16
    ret
#@ 2

.section .data
paddle_x: .word 128
#@ 4
ball_x:   .word 156
ball_y:   .word 40
ball_dx:  .word 2
#@ 5
ball_dy:  .word 2
#@ 7
score:    .word 0
#@ 9
paused:         .word 0
previous_input: .word 0
