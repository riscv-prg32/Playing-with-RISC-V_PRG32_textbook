# Assembly Lab 1: hello, state, and a counter you can see.
.option norelax
.equ BLACK, 0x0000
.equ WHITE, 0xffff

.section .text
.global first_init
.global first_update
.global first_draw

first_init:
    ret

first_update:
    ret

first_draw:
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

    lw   ra, 12(sp)            # epilogue: restore ra
    addi sp, sp, 16            # release the frame
    ret

.section .rodata
title:
    .asciz "HELLO PRG32"
