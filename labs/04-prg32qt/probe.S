# Debugger lab: a tiny cartridge built to be watched.
# State: frames (a counter), buttons (last input mask), box_x (a position).
.option norelax
.equ BLACK,  0x0000
.equ YELLOW, 0xffe0
.equ GREEN,  0x07e0

.section .text
.global probe_init
.global probe_update
.global probe_draw

probe_init:
    ret

probe_update:
    addi sp, sp, -16
    sw   ra, 12(sp)

    call prg32_input_read      # a0 = button mask  <-- breakpoint target
    la   t0, buttons
    sw   a0, 0(t0)             # remember it so the debugger can find it

    la   t0, frames
    lw   t1, 0(t0)
    addi t1, t1, 1             # one tick per frame
    sw   t1, 0(t0)

    la   t0, box_x
    lw   t2, 0(t0)
    andi t3, a0, 1             # LEFT?
    beqz t3, 1f
    addi t2, t2, -2
1:  andi t3, a0, 2             # RIGHT?
    beqz t3, 2f
    addi t2, t2, 2
2:  sw   t2, 0(t0)

    lw   ra, 12(sp)
    addi sp, sp, 16
    ret

probe_draw:
    addi sp, sp, -16
    sw   ra, 12(sp)

    li   a0, BLACK
    call prg32_gfx_clear

    la   t0, frames
    lw   t1, 0(t0)
    andi a2, t1, 255           # bar width = frames modulo 256
    li   a0, 0
    li   a1, 0
    li   a3, 4
    li   a4, GREEN
    call prg32_gfx_rect

    la   t0, box_x
    lw   a0, 0(t0)
    li   a1, 92
    li   a2, 16
    li   a3, 16
    li   a4, YELLOW
    call prg32_gfx_rect

    lw   ra, 12(sp)
    addi sp, sp, 16
    ret

.section .data
frames:  .word 0
buttons: .word 0
box_x:   .word 152
