#@ 1
# Assembly Lab 2: read the controller, move a marker, keep it on screen.
.option norelax
.equ BLACK,  0x0000
.equ YELLOW, 0xffe0
.equ GREY,   0x4208
#@ 2
.equ WHITE,  0xffff
.equ BTN_LEFT,  1
.equ BTN_RIGHT, 2
.equ SPEED, 2
#@ 3
.equ MAX_X, 304                # 320 - 16
#@ 4
.equ BTN_UP,   4
.equ BTN_DOWN, 8
.equ MIN_Y, 60                 # stay below the row of lamps
.equ MAX_Y, 184                # 200 - 16
#@ 1

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
#@ 2

    la   t1, marker_x
    lw   t2, 0(t1)             # t2 = marker_x
    andi t3, t0, BTN_LEFT      # isolate the LEFT bit
    beqz t3, 1f                # clear: skip
    addi t2, t2, -SPEED
1:  andi t3, t0, BTN_RIGHT
    beqz t3, 2f
    addi t2, t2, SPEED
2:
#@ 3
    bgez t2, 3f                # x < 0 ?  clamp to 0
    li   t2, 0
3:  li   t3, MAX_X
    ble  t2, t3, 4f            # x > 304 ?  clamp to 304
    mv   t2, t3
4:
#@ 2
    sw   t2, 0(t1)             # one store, after all adjustments
#@ 4

    la   t1, marker_y
    lw   t2, 0(t1)
    andi t3, t0, BTN_UP
    beqz t3, 5f
    addi t2, t2, -SPEED        # up is a SMALLER y
5:  andi t3, t0, BTN_DOWN
    beqz t3, 6f
    addi t2, t2, SPEED
6:  li   t3, MIN_Y
    bge  t2, t3, 7f
    mv   t2, t3
7:  li   t3, MAX_Y
    ble  t2, t3, 8f
    mv   t2, t3
8:  sw   t2, 0(t1)
#@ 1

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
#@ 2

    la   t0, marker_x
    lw   a0, 0(t0)
#@ 2-3
    li   a1, 120
#@ 4
    la   t0, marker_y
    lw   a1, 0(t0)
#@ 2
    li   a2, 16
    li   a3, 16
    li   a4, WHITE
    call prg32_gfx_rect
#@ 1

    lw   s0, 8(sp)
    lw   ra, 12(sp)
    addi sp, sp, 16
    ret

.section .data
buttons:  .word 0
#@ 2
marker_x: .word 152
#@ 4
marker_y: .word 120
