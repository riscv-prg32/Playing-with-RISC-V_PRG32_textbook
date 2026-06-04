.section .data
ball_x:  .word 156
ball_dx: .word 2               # +2 means moving right

.section .text
    la   t1, ball_x
    lw   t2, 0(t1)             # t2 = ball x
    la   t3, ball_dx
    lw   t4, 0(t3)             # t4 = ball dx (velocity)
    add  t2, t2, t4           # x = x + dx
    bltz t2, 1f                # hit the left edge?
    li   t5, 312               # 320 - ball width (8)
    ble  t2, t5, 2f            # still in range on the right?
    mv   t2, t5                # clamp to right edge
    neg  t4, t4                # reverse direction
    j    2f
1:  li   t2, 0                 # clamp to left edge
    neg  t4, t4                # reverse direction
2:  sw   t2, 0(t1)            # store new x
    sw   t4, 0(t3)            # store (possibly reversed) dx