# Assembly Labs 3 and 4: Pong, one verified step at a time.
.option norelax
.equ BLACK,  0x0000
.equ WHITE,  0xffff
.equ PADDLE_Y, 188
.equ PADDLE_W, 64
.equ PADDLE_H, 8

.section .text
.global pong_init
.global pong_update
.global pong_draw

pong_init:
    ret

pong_update:
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
