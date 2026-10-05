# Event sound with the mixer API (replaces the legacy buzzer helper).
# void prg32_audio_note(channel, instrument, note, volume, duration_ms)
#                        a0       a1          a2    a3      a4
.option norelax
.section .text
.global beep_init
.global beep_update
.global beep_draw

.equ PRG32_BTN_A, 0x10

beep_init:
    ret

beep_update:
    addi sp, sp, -16
    sw   ra, 12(sp)
    sw   s0, 8(sp)

    call prg32_input_read       # a0 = buttons held this frame
    mv   s0, a0                 # keep it across the next call

    la   t0, previous_input
    lw   t1, 0(t0)              # t1 = buttons held last frame
    sw   s0, 0(t0)              # remember this frame for the next one

    not  t1, t1                 # t1 = buttons NOT held last frame
    and  t1, s0, t1             # t1 = buttons newly pressed
    andi t1, t1, PRG32_BTN_A
    beqz t1, beep_done          # A was not newly pressed: no sound

    li   a0, 0                  # channel 0
    li   a1, 0                  # default instrument
    li   a2, 69                 # MIDI note 69 = A4 = 440 Hz
    li   a3, 255                # full volume
    li   a4, 120                # milliseconds
    call prg32_audio_note

beep_done:
    lw   s0, 8(sp)
    lw   ra, 12(sp)
    addi sp, sp, 16
    ret

beep_draw:
    ret

.section .data
previous_input:
    .word 0
