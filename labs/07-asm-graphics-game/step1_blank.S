# Assembly Labs 3 and 4: Pong, one verified step at a time.
.option norelax
.equ BLACK,  0x0000

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

    lw   ra, 12(sp)
    addi sp, sp, 16
    ret
