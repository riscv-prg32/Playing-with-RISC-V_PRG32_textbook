game_draw:
    addi sp, sp, -16
    sw   ra, 12(sp)
    li   a0, 0
    call prg32_gfx_clear       # black background

    la   t0, paddle_x          # draw the paddle
    lw   a0, 0(t0)
    li   a1, 188
    li   a2, 64
    li   a3, 8
    li   a4, 65535             # white
    call prg32_gfx_rect

    la   t0, ball_x            # draw the ball
    lw   a0, 0(t0)
    la   t0, ball_y
    lw   a1, 0(t0)
    li   a2, 8
    li   a3, 8
    li   a4, 65504             # yellow
    call prg32_gfx_rect

    lw   ra, 12(sp)
    addi sp, sp, 16
    ret