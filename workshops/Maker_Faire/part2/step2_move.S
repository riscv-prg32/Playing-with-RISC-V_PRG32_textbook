# Assembly Labs 3 and 4: Pong, one verified step at a time.
.option norelax
.equ BLACK,  0x0000
.equ WHITE,  0xffff
.equ PADDLE_Y, 188
.equ PADDLE_W, 64
.equ PADDLE_H, 8
.equ PADDLE_SPEED, 4
.equ PADDLE_MAX, 256           # 320 - PADDLE_W

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

    lw   ra, 12(sp)
    addi sp, sp, 16
    ret

.section .data
paddle_x: .word 128
