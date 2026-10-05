pong_c_update:
	addi	sp,sp,-32
	sw	ra,28(sp)
	sw	s0,24(sp)
	addi	s0,sp,32
	call	prg32_input_read
	sw	a0,-20(s0)
	lw	a5,-20(s0)
	andi	a5,a5,1
	beq	a5,zero,.L3
	lui	a5,%hi(paddle_x)
	lw	a5,%lo(paddle_x)(a5)
	addi	a4,a5,-3
	lui	a5,%hi(paddle_x)
	sw	a4,%lo(paddle_x)(a5)
.L3:
	lw	a5,-20(s0)
	andi	a5,a5,2
	beq	a5,zero,.L4
	lui	a5,%hi(paddle_x)
	lw	a5,%lo(paddle_x)(a5)
	addi	a4,a5,3
	lui	a5,%hi(paddle_x)
	sw	a4,%lo(paddle_x)(a5)
.L4:
	lui	a5,%hi(paddle_x)
	lw	a5,%lo(paddle_x)(a5)
	bge	a5,zero,.L5
	lui	a5,%hi(paddle_x)
	sw	zero,%lo(paddle_x)(a5)
.L5:
	lui	a5,%hi(paddle_x)
	lw	a4,%lo(paddle_x)(a5)
	li	a5,256
	ble	a4,a5,.L6
	lui	a5,%hi(paddle_x)
	li	a4,256
	sw	a4,%lo(paddle_x)(a5)
.L6:
	lui	a5,%hi(ball_x)
	lw	a4,%lo(ball_x)(a5)
	lui	a5,%hi(ball_dx)
	lw	a5,%lo(ball_dx)(a5)
	add	a4,a4,a5
	lui	a5,%hi(ball_x)
	sw	a4,%lo(ball_x)(a5)
	lui	a5,%hi(ball_y)
	lw	a4,%lo(ball_y)(a5)
	lui	a5,%hi(ball_dy)
	lw	a5,%lo(ball_dy)(a5)
	add	a4,a4,a5
	lui	a5,%hi(ball_y)
	sw	a4,%lo(ball_y)(a5)
	lui	a5,%hi(ball_x)
	lw	a5,%lo(ball_x)(a5)
	blt	a5,zero,.L7
	lui	a5,%hi(ball_x)
	lw	a4,%lo(ball_x)(a5)
	li	a5,312
	ble	a4,a5,.L8
.L7:
	lui	a5,%hi(ball_dx)
	lw	a5,%lo(ball_dx)(a5)
	neg	a4,a5
	lui	a5,%hi(ball_dx)
	sw	a4,%lo(ball_dx)(a5)
.L8:
	lui	a5,%hi(ball_y)
	lw	a5,%lo(ball_y)(a5)
	bge	a5,zero,.L9
	lui	a5,%hi(ball_dy)
	lw	a5,%lo(ball_dy)(a5)
	neg	a4,a5
	lui	a5,%hi(ball_dy)
	sw	a4,%lo(ball_dy)(a5)
.L9:
	lui	a5,%hi(ball_y)
	lw	a4,%lo(ball_y)(a5)
	li	a5,200
	ble	a4,a5,.L10
	call	pong_c_init
.L10:
	lui	a5,%hi(ball_x)
	lw	a0,%lo(ball_x)(a5)
	lui	a5,%hi(ball_y)
	lw	a1,%lo(ball_y)(a5)
	lui	a5,%hi(paddle_x)
	lw	a4,%lo(paddle_x)(a5)
	li	a7,8
	li	a6,64
	li	a5,188
	li	a3,8
	li	a2,8
	call	prg32_sprite_hitbox
	mv	a5,a0
	beq	a5,zero,.L13
	lui	a5,%hi(ball_dy)
	lw	a5,%lo(ball_dy)(a5)
	ble	a5,zero,.L12
	lui	a5,%hi(score)
	lw	a5,%lo(score)(a5)
	addi	a4,a5,1
	lui	a5,%hi(score)
	sw	a4,%lo(score)(a5)
.L12:
	lui	a5,%hi(ball_dy)
	li	a4,-1
	sw	a4,%lo(ball_dy)(a5)
.L13:
	nop
	lw	ra,28(sp)
	lw	s0,24(sp)
	addi	sp,sp,32
	jr	ra
