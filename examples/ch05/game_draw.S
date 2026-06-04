game_draw:
    addi sp, sp, -16
    sw   ra, 12(sp)
    li   a0, 0                 # RGB565 black
    call prg32_gfx_clear       # fill the 320x200 viewport
    lw   ra, 12(sp)
    addi sp, sp, 16
    ret