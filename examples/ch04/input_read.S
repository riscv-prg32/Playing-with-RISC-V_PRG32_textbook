.option norelax

.section .data
game_x:  .word 20           # object position, in text columns

.section .text
.global input_read_init
.global input_read_update
.global input_read_draw

input_read_init:
    ret                     

input_read_update:
    addi sp, sp, -16
    sw   ra, 12(sp)

    call prg32_input_read
    mv   t0, a0             # t0 = button bitmask

    la   t1, game_x
    lw   t2, 0(t1)          # t2 = current x (a value)

    andi t3, t0, 1          # test LEFT (bit 0)
    beqz t3, 1f
    addi t2, t2, -1         # move left
1:  andi t3, t0, 2          # test RIGHT (bit 1)
    beqz t3, 2f
    addi t2, t2, 1          # move right
2:  sw   t2, 0(t1)          # store the new x

    lw   ra, 12(sp)
    addi sp, sp, 16
    ret

input_read_draw:
    ret          