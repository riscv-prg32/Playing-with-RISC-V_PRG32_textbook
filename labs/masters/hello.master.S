#@ 1
# Setup lab: the first cartridge, from an empty file.
.option norelax
.section .text
.global hello_world_init
.global hello_world_update
.global hello_world_draw
#@ 2

.equ BLACK, 0x0000
.equ CYAN,  0x07ff
#@ 3
.equ WHITE, 0xffff
#@ 4
.equ YELLOW, 0xffe0
.equ BTN_A, 0x10
#@ 1

hello_world_init:
    ret

hello_world_update:
#@ 1-3
    ret
#@ 4
    addi sp, sp, -16
    sw   ra, 12(sp)
    call prg32_input_read      # a0 = one bit per button
    la   t0, buttons
    sw   a0, 0(t0)             # keep it for draw
    lw   ra, 12(sp)
    addi sp, sp, 16
    ret
#@ 1

hello_world_draw:
#@ 1-1
    ret
#@ 2
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
#@ 3

    li   a0, 32
    li   a1, 64                # 24 pixels lower
    la   a2, line2
    li   a3, WHITE
    li   a4, BLACK
    call prg32_gfx_text8
#@ 4

    # An 8x8 sprite: one byte per row, one bit per pixel.
    li   a0, 152               # x
    li   a1, 96                # y
    la   a2, ship              # address of the 8 bytes
    li   a3, CYAN              # foreground: cyan...
    la   t0, buttons
    lw   t1, 0(t0)
    andi t1, t1, BTN_A
    beqz t1, 1f
    li   a3, YELLOW            # ...yellow while A is held
1:  li   a4, BLACK             # background
    call prg32_sprite_draw_8x8
#@ 2

    lw   ra, 12(sp)
    addi sp, sp, 16
    ret

.section .rodata
title:
    .asciz "HELLO WORLD"
#@ 3
line2:
    .asciz "PRG32 cartridge from scratch"
#@ 4
ship:
    .byte 0x18, 0x18, 0x3c, 0x7e, 0xff, 0xdb, 0x18, 0x24

.section .data
buttons: .word 0
