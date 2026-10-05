# Setup lab: the first cartridge, from an empty file.
.option norelax
.section .text
.global hello_world_init
.global hello_world_update
.global hello_world_draw

.equ BLACK, 0x0000
.equ CYAN,  0x07ff

hello_world_init:
    ret

hello_world_update:
    ret

hello_world_draw:
    addi sp, sp, -16
    sw   ra, 12(sp)            # this function calls others: save ra

    li   a0, BLACK
    call prg32_gfx_clear

    li   a0, 32                # x
    li   a1, 40                # y
    la   a2, title             # address of the string
    li   a3, CYAN              # foreground colour
    li   a4, BLACK             # background colour
    call prg32_gfx_text8

    lw   ra, 12(sp)
    addi sp, sp, 16
    ret

.section .rodata
title:
    .asciz "HELLO WORLD"
