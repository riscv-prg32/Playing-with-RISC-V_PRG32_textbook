# Assembly Labs 3 and 4: Pong, one verified step at a time.
.option norelax
.equ BLACK,  0x0000
.equ WHITE,  0xffff
.equ PADDLE_Y, 188
.equ PADDLE_W, 64
.equ PADDLE_H, 8
.equ PADDLE_SPEED, 4
.equ PADDLE_MAX, 256           # 320 - PADDLE_W
.equ YELLOW, 0xffe0
.equ BALL_SIZE, 8
.equ BALL_MAX_X, 312           # 320 - BALL_SIZE

.section .text
.global pong_init
.global pong_update
.global pong_draw

pong_init:
    ret

pong_update:
    addi sp, sp, -16
    sw   ra, 12(sp)

    call prg32_input_read      # a0 = button mask

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

update_done:
    lw   ra, 12(sp)
    addi sp, sp, 16
    ret

pong_draw:
    addi sp, sp, -16
    sw   ra, 12(sp)

    li   a0, BLACK
    call prg32_gfx_clear       # fill the 320x200 viewport

    # --- paddle: prg32_gfx_rect(x, y, w, h, color) ---------------------------
    la   t0, paddle_x
    lw   a0, 0(t0)             # x comes from memory: it is state
    li   a1, PADDLE_Y
    li   a2, PADDLE_W
    li   a3, PADDLE_H
    li   a4, WHITE
    call prg32_gfx_rect

    # --- ball -------------------------------------------------------------------
    la   t0, ball_x
    lw   a0, 0(t0)
    la   t0, ball_y
    lw   a1, 0(t0)
    li   a2, BALL_SIZE
    li   a3, BALL_SIZE
    li   a4, YELLOW
    call prg32_gfx_rect

    lw   ra, 12(sp)
    addi sp, sp, 16
    ret

.section .data
paddle_x: .word 128
ball_x:   .word 156
ball_y:   .word 40
ball_dx:  .word 2
ball_dy:  .word 2
