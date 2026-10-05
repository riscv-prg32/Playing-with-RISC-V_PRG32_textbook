# Labs: verified, step-by-step tutorials

Every lab deck in `presentations/` walks through the files in this folder.
Each step is a **complete program**: step N contains everything of step N-1
plus what is new. Every step was built as a portable cartridge and executed,
and the screenshot shown on the slide is the frame that execution produced
(`expected/*.png`).

| Folder | Lab | Steps |
| --- | --- | --- |
| `03-setup` | first cartridge | skeleton, text, two lines |
| `04-prg32qt` | debugger | `probe.S`, a cartridge written to be watched |
| `05-asm-first-contact` | assembly 1 | skeleton, hello, counter, bar |
| `06-asm-state-and-input` | assembly 2 | lamps, move, clamp, two axes |
| `07-asm-graphics-game` | assembly 3 | Pong: blank, paddle, move, ball x, ball y, collision |
| `08-asm-capstone` | assembly 4 | Pong: score, sound, pause |
| `09-c-first-contact` | C 1 | Pong in C: six steps |
| `10-c-structs-and-tiles` | C 2 | bricks (3 steps), tile world and actor (3 steps) |
| `11-c-capstone` | C 3 | refactor, fixed point, lives, score submission |
| `16-assembly-meets-c` | reunion | real `gcc -O0` / `-Os` output for the C Pong |

The Young Makers projects are in `examples/blocks_first_steps/`, the Store
files in `examples/store_publishing/` and `scripts/store/`.

## Running a step

```bash
export PRG32_HOME=~/PRG32          # a PRG32 checkout, with ESP-IDF active
labs/run.sh 07-asm-graphics-game/step3_move.S pong
```

The second argument is the entry-point prefix (`hello_world`, `probe`,
`first`, `steer`, `pong`, `pong_c`, `bricks_c`, `plat`, `refine_c`). The step
runs in QEMU, or on a PRG32 board or PRG32-QT when `PRG32_URL` is set.

## Regenerating and re-verifying everything

`masters/` holds one annotated source per tutorial; `#@ N` (or `//@ N`) marks
the step from which the following lines exist, `#@ A-B` a range.

```bash
export PRG32_HOME=~/PRG32
export PRG32QT_HEADLESS=~/PRG32-QT/build-core/prg32qt-headless   # cmake -DPRG32QT_BUILD_APP=OFF
python3 labs/tools/steps.py          # split, build, run and screenshot every step
python3 labs/tools/steps.py lab07    # only one tutorial
```

`tools/labs.json` lists every tutorial, its steps, how many frames to run and
which buttons to hold while running (the scripted input behind each
screenshot). The same tool generates the workshop material in `workshops/`.

## What was verified, and how

- All step files build with `python3 -m prg32 cartridge build --portable`
  against PRG32 `main` (cartridge ABI 1.6).
- All steps run in the PRG32-QT headless runner for the listed number of
  frames; the final frame is saved as the expected screenshot.
- The deliberate bugs of Assembly Lab 1 were reproduced: an unsaved `ra` gives
  `instruction budget exhausted`, an unbalanced stack gives
  `instruction fetch outside cartridge memory`.
- The publishing lab (Chapter 17) was run end to end against a local Cartridge
  Store; the replies shown on its slides are the real ones.
- Not verified here: behaviour on a physical board and in QEMU's window, and
  the interactive PRG32-QT debugger steps (the readings they ask for follow
  from the source and the calling convention).
