// Technical-detail slides added to the lecture decks, and real screenshots
// added to the Young Makers workshops.  Every number here comes from the
// PRG32 sources or from a build/run performed while preparing the decks.
const STUB = "prg32_gfx_rect:                # one stub per runtime function\n    la   t0, __prg32_abi       # where the table pointer was saved\n    lw   t0, 0(t0)             # t0 = address of the ABI table\n    lw   t1, OFFSET(t0)        # OFFSET = 20 + index * 4\n    jr   t1                    # jump; a0..a7 untouched\n\nprg32_entry_update:            # what the host really calls\n    addi sp, sp, -16\n    sw   ra, 12(sp)\n    la   t0, __prg32_abi\n    sw   a0, 0(t0)             # the host passes the table in a0\n    call pong_update           # your function\n    lw   ra, 12(sp)\n    addi sp, sp, 16\n    ret";
const HEADER = [["magic \"PRG2\"", 4, "format signature"], ["abi_major, abi_minor", 4, "two uint16"], ["header_size, flags", 4, "100; bit 2 = ABI table"], ["load_addr", 4, "0x40800000"], ["code_size, mem_size", 8, "bytes to copy; bytes to reserve"],
  ["init, update, draw offsets", 12, "three uint32 entry points"], ["payload_crc32", 4, "integrity of the code"], ["name", 32, "shown in the menu"], ["abi_hash, features, isa, relocs, import_model", 28, "version-2 fields: compatibility"]];

Extend(1, "lecture", "Deliberately thin, so the processor stays in view", [
  G("The machine in numbers", ["Quantity", "Value"], [["Processor", "ESP32-C6, RV32IMAC, 160 MHz"], ["Main RAM (HP SRAM)", "512 KB at 0x40800000"], ["Game viewport", "320 x 200 = 64,000 pixels, one byte each"], ["Frame period", "33 ms: about 30 frames per second"],
    ["Audio", "8 voices, 22,050 Hz, I2S"], ["Cartridge RAM", "64 KiB by default; 4 flash slots"], ["Runtime interface", "139 functions, ABI 1.6"]], "Sources: PRG32 docs/hardware/memory.md, prg32.h, prg32_abi.json."),
  T("What 160 MHz buys per frame", ["33 ms at 160 MHz is about 5 million clock cycles per frame", "Clearing the screen touches 64,000 bytes", "A Pong update is a few hundred instructions", "The budget is generous for logic and tight for pixels: draw less, not faster"], null, ["5 M", "cycles per frame"]),
]);

Extend(2, "lecture", "Two ways to name a colour", [
  E("RGB565, bit by bit", [[5, "red", "11111"], [6, "green", "111111"], [5, "blue", "00000"]], "Yellow = full red + full green = 1111 1111 1110 0000 = 0xFFE0. To build a colour: (r << 11) | (g << 5) | b, with r and b in 0..31 and g in 0..63."),
  G("Where the pixels live", ["Buffer", "Size", "Purpose"], [["Indexed framebuffer", "64,000 bytes", "one palette index per viewport pixel"], ["Palette", "512 bytes", "256 RGB565 entries"], ["SPI strip", "5,120 bytes", "8 rows converted and sent at a time"]],
    "The former RGB565 framebuffer needed 128,000 bytes; the indexed design saves 63,488. Source: PRG32 docs/hardware/memory.md."),
]);
Extend(2, "lecture", "Three properties of a cartridge", [
  M("The cartridge header, byte by byte", HEADER, "100 bytes in all. The host checks magic, CRC, ABI major, hash and features before a single instruction runs."),
  K("How a portable cartridge reaches the runtime", STUB, null, ["The builder generates 139 such stubs", "No firmware address is baked in", "That is why an empty cartridge is 2604 bytes"], "Shape of the code emitted by prg32/cartridge/build_cartridge.py."),
]);

Extend(3, "lecture", "Cartridge commands", [
  K("A real build log", "[INFO] Portable: True\n[INFO] Building cartridge: work/hello/hello (Prefix: hello_world)\n[INFO] Cartridge RAM limit: 65536 bytes (default firmware profile)\n[OK] built work/hello/hello.prg32 name=hello load=0x40800000\n[INFO] code=2664 mem=2664 audio=0", null,
    ["Portable: ABI-table imports", "The 64 KiB profile limit", "Load address of cartridge RAM", "code: bytes copied; mem: bytes reserved (code + data + .bss)"], "Captured from a real build."),
  G("What the builder does", ["Stage", "Tool", "Result"], [["Compile", "riscv32-esp-elf-gcc -march=rv32imac -mabi=ilp32", "game.o"], ["C only", "-Os -ffreestanding -fno-builtin -mcmodel=medany", "small, position-tolerant code"], ["Stubs", "generated portable_stubs.S", "139 ABI stubs + 3 trampolines"],
    ["Link", "generated linker script at 0x40800000", "game.elf"], ["Package", "header + payload + CRC32", "game.prg32"]], "From prg32/cartridge/build_cartridge.py.", [0.8, 2.4, 1.6]),
]);
Extend(3, "lecture", "Cartridge memory profiles", [
  T("Sizes you will actually see", ["Empty cartridge: 2604 bytes (stubs and trampolines)", "Hello world with one text call: 2664", "Complete Pong in assembly: 2984; in C: 2952", "Breakout with bricks, score and sound: about 3.4 KiB", "All of them use about 5% of the 64 KiB profile"], "Sizes from the build logs of the lab steps.", ["5%", "of the default budget"]),
]);

Extend(4, "lecture", "What a host checks before running", [
  K("Stubs and trampolines: what the debugger shows first", STUB, null, ["Select Update: you land in the trampoline", "It saves the ABI table pointer", "Then calls your function"], "Shape of the code emitted by the cartridge builder."),
  G("How PRG32-QT reports a broken cartridge", ["Message", "Typical cause"], [["instruction budget exhausted", "an endless loop: for example ra not saved before a call"], ["instruction fetch outside cartridge memory", "a jump to garbage: for example sp not restored"], ["ABI hash or feature mismatch", "built for a table this host does not provide"]],
    "The first two were reproduced with deliberately broken lab cartridges.", [1.4, 2]),
]);

Extend(5, "lecture", "There is no subi", [
  E("addi t1, t1, 1 as 32 bits", [[12, "imm[11:0]", "000000000001"], [5, "rs1", "00110 (t1 = x6)"], [3, "funct3", "000"], [5, "rd", "00110 (t1 = x6)"], [7, "opcode", "0010011"]],
    "I-type: 0x00130313. The 12-bit immediate is signed, hence the range -2048..2047 and the lack of a subi. With the C extension the assembler may choose a 16-bit form instead."),
  E("sw t1, 0(t0) as 32 bits", [[7, "imm[11:5]", "0000000"], [5, "rs2", "00110 (t1)"], [5, "rs1", "00101 (t0 = x5)"], [3, "funct3", "010"], [5, "imm[4:0]", "00000"], [7, "opcode", "0100011"]],
    "S-type: 0x0062A023. The immediate is split so that rs1 and rs2 sit in the same bit positions in every format: simpler decoding hardware."),
]);
Extend(5, "lecture", "The stack frame: prologue and epilogue", [
  M("The 16-byte frame in memory", [["(free)", 4, "sp + 0"], ["(free)", 4, "sp + 4"], ["saved s0, if used", 4, "sp + 8"], ["saved ra", 4, "sp + 12"]], "The stack grows toward lower addresses. sp must be a multiple of 16 at every call; that is why a function that needs 4 bytes still reserves 16."),
  G("Two failures, reproduced", ["Mistake", "What the host reports"], [["ra not saved in a function that calls", "frame 0: instruction budget exhausted (returns into itself forever)"], ["sp restored by 8 instead of 16", "frame 0: instruction fetch outside cartridge memory (the caller reloads the wrong ra)"]],
    "Both from running deliberately broken versions of the Lab 1 cartridge in the PRG32-QT headless runner.", [1.3, 2.2]),
]);
Extend(5, "lecture", "The anatomy of a program", [
  G("Where a cartridge lands", ["Region", "Address", "Holds"], [["External flash", "0x42000000 ...", "firmware code and constants"], ["HP SRAM", "0x40800000 - 0x4087FFFF", "512 KB: heap, firmware data, cartridge RAM"], ["Cartridge", "from 0x40800000", ".text, then .rodata, .data, .bss"], ["LP SRAM", "0x50000000 ...", "16 KB kept in deep sleep"]],
    "Cartridge code executes from RAM. Source: PRG32 docs/hardware/memory.md."),
]);

Extend(6, "lecture", "Conditional branches", [
  E("beq rs1, rs2, label as 32 bits", [[7, "imm[12|10:5]", "offset high"], [5, "rs2", ""], [5, "rs1", ""], [3, "funct3", "000 = beq"], [5, "imm[4:1|11]", "offset low"], [7, "opcode", "1100011"]],
    "B-type. The immediate is a signed offset from the branch itself, in multiples of 2 bytes: a branch reaches about 4 KiB either way. Farther targets need a jump."),
  T("Branches are relative, so code can move", ["A branch stores a distance, not an address", "The same bytes work wherever the cartridge is loaded", "la uses auipc: also relative to the pc", "This is what lets one cartridge run at different addresses on different hosts"]),
]);
Extend(6, "lecture", "Test one button", [
  K("Any bit, with a shift: the lamp loop of Lab 2", "labs/06-asm-state-and-input/step1_lamps.S", ["la   t0, buttons", 7], ["srl moves bit number s0 down to bit 0", "andi keeps only that bit", "The colour depends on the result"]),
]);

Extend(7, "lecture", "Drawing rectangles", [
  T("What a drawing call costs", ["prg32_gfx_clear writes all 64,000 bytes of the framebuffer", "A 64 x 8 paddle writes 512", "An 8 x 8 ball writes 64", "Clearing dominates: a whole Pong frame is about 64,600 bytes written", "On the board the frame is then sent to the display 8 rows at a time over SPI"], null, ["64,000", "bytes per clear"]),
]);
Extend(7, "lecture", "Collision", [
  K("What the overlap test computes", "/* two axis-aligned rectangles overlap when they overlap on x AND on y */\nint hit = ax < bx + bw &&      /* a's left  is left of b's right  */\n          ax + aw > bx &&      /* a's right is right of b's left  */\n          ay < by + bh &&      /* a's top   is above b's bottom   */\n          ay + ah > by;        /* a's bottom is below b's top     */", null,
    ["Four comparisons", "Touching edges do not count", "Works with negative coordinates"], "This is the test the Construction Kit simulator uses for the same call."),
]);

Extend(8, "lecture", "Bricks as bits", [
  K("Bytes or bits: the two layouts", "# one BYTE per brick (the labs and the workshop)\n    la   t0, bricks\n    add  t0, t0, s0          # address of brick number s0\n    lbu  t1, 0(t0)           # 1 = present\n    sb   zero, 0(t0)         # destroy it\n\n# one BIT per brick (the upstream Breakout)\n    li   t2, 1\n    sll  t2, t2, s0          # mask = 1 << s0\n    and  t3, t1, t2          # present?\n    not  t2, t2\n    and  t1, t1, t2          # destroy it: clear the bit", null,
    ["16 bricks: 16 bytes, or half a word", "lbu / sb: byte load and store", "Bits cost instructions, bytes cost memory"]),
]);
Extend(8, "lecture", "Build, inspect, run", [
  K("What cartridge summary prints", "{\n  \"abi_hash\": \"0x260f6136\",\n  \"abi_major\": 1,\n  \"code_size\": 3160,\n  \"flags\": 4,\n  \"header_size\": 100,\n  \"import_model\": \"abi-table\",\n  \"load_addr\": 1082130432,\n  \"mem_size\": 3160,\n  \"required_features\": 0,\n  \"trailer_present\": false\n}", null,
    ["The ABI table this cartridge expects", "flags 4: ABI-table imports", "1082130432 = 0x40800000", "No metadata trailer yet"], "Abridged real output for the Lab 4 cartridge."),
]);

Extend(9, "lecture", "Initialising state", [
  G("Where C variables go", ["Declaration", "Section", "Counted in"], [["static int score;", ".bss (starts at zero)", "mem only"], ["static int paddle_x = 136;", ".data", "code and mem"], ["static const uint8_t tile[8] = {...};", ".rodata", "code and mem"], ["uint32_t input; (inside a function)", "a register or the stack", "neither"]],
    "The Lab 1 Pong reports code=2952 mem=2976: the difference, 24 bytes, is its six zero-initialised int variables.", [1.6, 1.2, 1]),
]);
Extend(9, "lecture", "Truth in C", [
  K("What the compiler makes of an if", "labs/16-assembly-meets-c/pong_c_update_Os.s", ["prg32_input_read", 7], ["The result is tested straight from a0", "andi isolates the bit", "beq skips the body", "The body: lw, addi, sw"], "Real output of gcc -Os for the Lab 1 Pong."),
]);

Extend(10, "lecture", "The dot and the ampersand", [
  M("prg32_platform_actor_t, field by field", [["x", 4, "int"], ["y", 4, "int"], ["vx", 4, "int"], ["vy", 4, "int"], ["w", 2, "uint16_t"], ["h", 2, "uint16_t"], ["state", 2, "uint16_t"], ["layer, reserved", 2, "uint8_t each"]],
    "24 bytes. player.vx is 'the int 8 bytes after the start'; &player is the address of byte 0. prg32.h publishes the same offsets for assembly."),
]);
Extend(10, "lecture", "The playfield in numbers", [
  T("Why tiles: the arithmetic", ["A 512 x 256 world in pixels at one byte each: 131,072 bytes", "The same world as 64 x 32 tile numbers: 2,048 bytes", "Tile bitmaps: 8 bytes each", "Two layers and a hundred tiles still fit in under 6 KiB"], null, ["64x", "less memory than pixels"]),
]);

Extend(11, "lecture", "Worked values", [
  G("What Q8 can hold", ["Property", "Value"], [["Smallest step", "1/256 = 0.0039 pixel"], ["Largest value in an int", "about 8.3 million"], ["Safe product a * b before / 256", "a * b must stay below 2,147,483,647"], ["Example", "384 * 512 = 196,608: fine"], ["Counter-example", "two Q8 values near 50,000.0 overflow"]]),
]);
Extend(11, "lecture", "Shipping", [
  G("How a real game grew", ["Step", "code", "mem", "Added"], [["Refactored Pong", "2908", "2932", "baseline"], ["Fixed-point ball", "2968", "2992", "+60"], ["Lives, edges, game over, notes", "3248", "3284", "+280"], ["Score submission", "3280", "3316", "+32"]], "Build logs of C Lab 3. Text strings and their drawing calls are the largest single addition."),
]);

Extend(15, "lecture", "Nothing is magic: the pipeline", [
  K("The intermediate form the Kit keeps", "block:  if button LEFT pressed -> change paddle_x by -4\n\nIR:     {\"op\": \"if_button\", \"button\": \"LEFT\",\n         \"then\": [{\"op\": \"change\", \"var\": \"paddle_x\", \"delta\": \"-4\"}]}\n\nC:      if (input & PRG32_BTN_LEFT) {\n            paddle_x += -4;\n        }\n\nJS:     if (keys.LEFT) { state.paddle_x += -4; }", null,
    ["One description, two back ends", "The simulator and the C cannot disagree about meaning", "Pupils can open the IR tab and read it"], "The IR is shown in the editor's Game IR tab."),
  G("What pupils' projects become", ["Project", "Blocks", "Cartridge"], [["First Square", "10", "2720 bytes"], ["Moving Square", "17", "2796 bytes"], ["Lemon Catcher", "37", "3352 bytes"], ["Music Pad", "26", "3004 bytes"], ["Workshop Breakout", "88", "3924 bytes"]],
    "Sizes of the real cartridges built from the Kit's generated C."),
]);

Extend(16, "lecture", "Seeing it yourself", [
  K("gcc -O0: every statement stands alone", "labs/16-assembly-meets-c/pong_c_update_O0.s", ["pong_c_update:", 15], ["Frame pointer in s0", "input stored, then reloaded", "paddle_x: its address is rebuilt for the load and again for the store"], "Real output for the C Lab 1 Pong."),
  K("gcc -Os: the same C, rearranged", "labs/16-assembly-meets-c/pong_c_update_Os.s", ["pong_c_update:", 14], ["No frame pointer", "input never leaves a0", "The address of paddle_x is kept in s0", "Three instructions per update"], "Real output for the same file."),
  G("The same function, counted", ["", "gcc -O0", "gcc -Os", "by hand"], [["Lines for update", "114", "83", "74"], ["Whole file", "223", "192", "139"], ["Cartridge", "-", "2952 bytes", "3052 bytes"]], "The hand-written figures are the assembly Pong with the same features (Lab 4, step 7)."),
]);

Extend(17, "lecture", "Pack and submit", [
  K("What the tools answer", "$ python3 -m prg32 store publish-bundle build/lemon-catcher-1.0.0.zip ...\n[ { \"architecture\": \"esp32c6\", \"file\": \"lemon-catcher-esp32c6.prg32\" },\n  { \"architecture\": \"qemu\",    \"file\": \"lemon-catcher-qemu.prg32\" } ]\nSubmitted for review\n\n$ curl -X POST .../api/submissions/1/verify -d '{\"metadata\":{\"id\":\"x.y\"}}'\n{ \"error\": \"metadata.id cannot be changed during review\", \"ok\": false }\n\n$ python3 -m prg32 store list --store-url ...\nID                          Title          Version  Architectures\norg.example.lemon-catcher   Lemon Catcher           esp32c6, qemu", null,
    ["A submission is pending", "An editor cannot change identity", "After verification the game is listed"], "Condensed from a real session against a local Store."),
  M("The metadata trailer", [["\"PRG32META\"", 9, "magic"], ["version", 1, "currently 1"], ["entry_count", 2, "number of blocks"], ["trailer_size", 4, "whole trailer, in bytes"], ["type", 4, "META, ICON, SCRN, SIGN or COLO"], ["length", 4, "bytes that follow"], ["value", "length", "JSON or image bytes; repeated per entry"]],
    "Appended after the code. The Store adds one on publication: the 3432-byte cartridge we uploaded came back as 4418 bytes."),
]);

// Real screenshots for the Young Makers workshops (the Kit's generated C, built and run).
const KB = (n) => `examples/blocks_first_steps/expected/${n}.png`;
Extend(12, "lab", "Does yours look like this?", [I("The real thing", KB("first_square"), "First Square, built from the Kit's generated C and run on the PRG32 runtime")]);
Extend(13, "lab", "Race the bars", [I("Lemon Catcher, for real", KB("lemon_catcher"), "The reference project, built from its generated C and run for 260 frames")]);
Extend(14, "lab", "Make music", [I("The Music Pad, for real", KB("music_pad"), "UP held: the white bar is under the green pad")]);
