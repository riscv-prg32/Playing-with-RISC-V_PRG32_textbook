#@ 1
# Assembly Lab 1: hello, state, and a counter you can see.
.option norelax
#@ 2
.equ BLACK, 0x0000
.equ WHITE, 0xffff
#@ 4
.equ GREEN, 0x07e0
#@ 1

.section .text
.global first_init
.global first_update
.global first_draw

first_init:
    ret

first_update:
#@ 1-2
    ret
#@ 3
    # A leaf function: it calls nothing, so it needs no stack frame.
    la   t0, counter           # t0 = ADDRESS of counter
    lw   t1, 0(t0)             # t1 = VALUE stored there      (load)
    addi t1, t1, 1             # one tick per frame           (modify)
    sw   t1, 0(t0)             # write it back                (store)
    ret
#@ 1

first_draw:
#@ 1-1
    ret
#@ 2
    addi sp, sp, -16           # prologue: make a 16-byte frame
    sw   ra, 12(sp)            # save the return address

    li   a0, BLACK
    call prg32_gfx_clear

    li   a0, 32                # x
    li   a1, 40                # y
    la   a2, title             # address of the string
    li   a3, WHITE             # foreground
    li   a4, BLACK             # background
    call prg32_gfx_text8
#@ 4

    la   t0, counter
    lw   t1, 0(t0)
    andi a2, t1, 255           # width = counter modulo 256
    li   a0, 32                # x
    li   a1, 60                # y
    li   a3, 8                 # height
    li   a4, GREEN
    call prg32_gfx_rect
#@ 2

    lw   ra, 12(sp)            # epilogue: restore ra
    addi sp, sp, 16            # release the frame
    ret

.section .rodata
title:
    .asciz "HELLO PRG32"
#@ 3

.section .data
counter: .word 0
