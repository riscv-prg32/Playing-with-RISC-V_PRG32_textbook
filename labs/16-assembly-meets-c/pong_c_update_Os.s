pong_c_update:
	addi	sp,sp,-32
	sw	s0,24(sp)
	sw	ra,28(sp)
	sw	s1,20(sp)
	sw	s2,16(sp)
	sw	s3,12(sp)
	call	prg32_input_read
	andi	a5,a0,1
	lui	s0,%hi(paddle_x)
	beq	a5,zero,.L3
	lw	a5,%lo(paddle_x)(s0)
	addi	a5,a5,-3
	sw	a5,%lo(paddle_x)(s0)
.L3:
	andi	a0,a0,2
	beq	a0,zero,.L4
	lw	a5,%lo(paddle_x)(s0)
	addi	a5,a5,3
	sw	a5,%lo(paddle_x)(s0)
.L4:
	lw	a4,%lo(paddle_x)(s0)
	bge	a4,zero,.L5
	sw	zero,%lo(paddle_x)(s0)
.L6:
	lui	s2,%hi(ball_x)
	lui	s3,%hi(ball_y)
	lui	a1,%hi(ball_dx)
	lui	s1,%hi(ball_dy)
	lw	a2,%lo(ball_x)(s2)
	lw	a5,%lo(ball_y)(s3)
	lw	a3,%lo(ball_dx)(a1)
	lw	a4,%lo(ball_dy)(s1)
	li	a0,312
	add	a2,a3,a2
	add	a5,a4,a5
	sw	a2,%lo(ball_x)(s2)
	sw	a5,%lo(ball_y)(s3)
	bleu	a2,a0,.L7
	neg	a3,a3
	sw	a3,%lo(ball_dx)(a1)
.L7:
	bge	a5,zero,.L8
	neg	a4,a4
	sw	a4,%lo(ball_dy)(s1)
.L9:
	lw	a4,%lo(paddle_x)(s0)
	lw	a1,%lo(ball_y)(s3)
	lw	a0,%lo(ball_x)(s2)
	li	a7,8
	li	a6,64
	li	a5,188
	mv	a3,a7
	mv	a2,a7
	call	prg32_sprite_hitbox
	beq	a0,zero,.L2
	lw	a5,%lo(ball_dy)(s1)
	ble	a5,zero,.L11
	lui	a4,%hi(score)
	lw	a5,%lo(score)(a4)
	addi	a5,a5,1
	sw	a5,%lo(score)(a4)
.L11:
	li	a5,-1
	sw	a5,%lo(ball_dy)(s1)
.L2:
	lw	ra,28(sp)
	lw	s0,24(sp)
	lw	s1,20(sp)
	lw	s2,16(sp)
	lw	s3,12(sp)
	addi	sp,sp,32
	jr	ra
.L5:
	li	a5,256
	ble	a4,a5,.L6
	sw	a5,%lo(paddle_x)(s0)
	j	.L6
.L8:
	li	a4,200
	ble	a5,a4,.L9
	call	pong_c_init
	j	.L9
