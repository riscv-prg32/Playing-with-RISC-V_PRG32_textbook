    la   t0, ball_x
    lw   a0, 0(t0)            # ball x
    la   t0, ball_y
    lw   a1, 0(t0)            # ball y
    li   a2, 8                # ball width
    li   a3, 8                # ball height
    la   t0, paddle_x
    lw   a4, 0(t0)            # paddle x
    li   a5, 188              # paddle y
    li   a6, 64               # paddle width
    li   a7, 8                # paddle height
    call prg32_sprite_hitbox  # a0 = non-zero if overlapping
    beqz a0, 3f               # no overlap: skip the bounce
    la   t0, ball_dy          # overlap: make the ball go up
    li   t1, -1
    sw   t1, 0(t0)
3: