# The One When Future Tech Is Tough: Mastering Retro Games with PRG32

Workshop material for **Maker Faire** (2.5 hours, 15-30 participants in pairs),
proposed by the High Performance Scientific Computing SmartLab of the
University of Naples "Parthenope".

Materiale per il workshop **Maker Faire** (2 ore e 30, 15-30 partecipanti in
coppia), a cura dell'HPSC SmartLab dell'Università degli Studi di Napoli
"Parthenope".

| File | Language |
| --- | --- |
| `PRG32_Maker_Faire_EN.pptx` | English |
| `PRG32_Maker_Faire_IT.pptx` | Italiano |

Both decks are generated from one specification (`slides.js`), so they stay
identical in structure: three parts, each a 20-minute presentation followed by
30 minutes of guided hands-on work.

| Part | Presentation | Hands-on (files) |
| --- | --- | --- |
| 1. Welcome to the PRG32 universe | RISC-V, the European ecosystem, the console, the cartridge, assembly fundamentals | `part1/`: skeleton, text, two lines, a sprite that reacts to a button |
| 2. Programming games in assembly | registers, calling convention, branches and loops, sprites, input, the game loop | `part2/`: Pong in assembly: paddle, movement, ball, collision, score, sound |
| 3. From assembly to C | why combine them, the runtime and its ABI table, modular games, packaging | `part3/`: the game in C calling a hand-written assembly routine; bricks; a complete cartridge to exchange |

- Every step is a complete program; `*/expected/*.png` is its real screenshot.
- `cartridges/` holds all 13 steps already built, for kits without a laptop.
- Part 3 integrates C and assembly in one cartridge: the builder takes a
  single source file, so the assembly module is a top-level `__asm__` block
  inside the C file, called through an ordinary C declaration.

## On the day

```bash
. ~/esp-idf/export.sh
export PRG32_HOME=~/PRG32
export PRG32_URL=http://192.168.4.1     # the kit's own Wi-Fi network; omit to use QEMU
./run.sh 1 2        # Part 1, step 2
./run.sh 2 4        # Part 2, step 4
./run.sh 3 3        # Part 3, step 3
```

> **QEMU note.** On PRG32 `main` (a8669e5) with ESP-IDF v5.4 the QEMU firmware does not build from a fresh
> clone (`esp_crt_bundle.h` not found). Until fixed upstream, add the line `mbedtls` to `PRG32_PRIV_REQUIRES`
> in `components/prg32/CMakeLists.txt`. Kits and PRG32-QT are not affected.

## Regenerating

```bash
export PRG32_HOME=~/PRG32 PRG32QT_HEADLESS=~/PRG32-QT/build-core/prg32qt-headless
python3 ../../labs/tools/steps.py mf-                # steps, cartridges, screenshots
(cd ../../presentations/tools && node build.js mf)   # both decks
```

Parts 1 and 2 are generated from `labs/masters/hello.master.S` and
`labs/masters/pong.master.S`; Part 3 from `src/mixed.master.c`.
