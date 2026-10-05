# Assembly Lab 2: read the controller, move a marker, keep it on screen.
.option norelax
.equ BLACK,  0x0000
.equ YELLOW, 0xffe0
.equ GREY,   0x4208

.section .text
.global steer_init
.global steer_update
.global steer_draw

steer_init:
    ret

steer_update:
    addi sp, sp, -16
    sw   ra, 12(sp)

    call prg32_input_read      # a0 = button mask
    mv   t0, a0                # keep our own copy
    la   t1, buttons
    sw   t0, 0(t1)             # remember it for draw

    lw   ra, 12(sp)
    addi sp, sp, 16
    ret

steer_draw:
    addi sp, sp, -16
    sw   ra, 12(sp)
    sw   s0, 8(sp)             # s0 = bit number, survives the calls

    li   a0, BLACK
    call prg32_gfx_clear

    # Seven lamps, one per button bit: lit when the bit is 1.
    li   s0, 0
lamp_loop:
    li   t0, 40
    mul  a0, s0, t0
    addi a0, a0, 24            # x = 24 + bit * 40
    li   a1, 16
    li   a2, 24
    li   a3, 24
    la   t0, buttons
    lw   t1, 0(t0)
    srl  t1, t1, s0            # move bit number s0 down to bit 0
    andi t1, t1, 1
    li   a4, GREY
    beqz t1, 1f
    li   a4, YELLOW
1:  call prg32_gfx_rect
    addi s0, s0, 1
    li   t0, 7
    blt  s0, t0, lamp_loop

    lw   s0, 8(sp)
    lw   ra, 12(sp)
    addi sp, sp, 16
    ret

.section .data
buttons:  .word 0
