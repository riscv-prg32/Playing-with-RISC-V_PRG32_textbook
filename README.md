# Playing with RISC-V — LaTeX Source

This archive contains the complete LaTeX source for the textbook
**"Playing with RISC-V: Assembly, C, and Retro Games on the PRG32 Platform."**

## Building the PDF

You need a TeX distribution (TeX Live 2021+ or MiKTeX) with the standard
packages (listings, tcolorbox, tikz, booktabs, titlesec, natbib, microtype,
hyperref). Then run:

```bash
latexmk -pdf main.tex
```

or, manually:

```bash
pdflatex main.tex
bibtex   main
pdflatex main.tex
pdflatex main.tex
```

The result is `main.pdf` (about 180 pages).

## What is in the book

| Part | Content | Audience |
| --- | --- | --- |
| I | Foundations: why, the framework, setup, PRG32-QT | everyone |
| II | Computer Architecture track: RISC-V assembly | university |
| III | Computer Programming track: C | university |
| IV | Young Makers track: Blocks with the PRG32 Construction Kit, plus a chapter for teachers | ages 7+, teachers |
| V | Assembly meets C; publishing on the Cartridge Store | everyone |

## Project layout

```
main.tex                 Master document; \input order defines the book
prg32style.sty           Shared style: palette, code listings, callout boxes, block drawings
frontmatter/             Title page, colophon, preface, reading guide, bibliography
chapters/
  introduction.tex              Why a game, why RISC-V (European IP), the ecosystem
  platform_and_design.tex       Game design principles + the PRG32 framework
  setup.tex                     Toolchain, targets, profiles
  prg32qt.tex                   PRG32-QT: a third host with an RV32IMAC debugger
  asm_*.tex                     Computer Architecture track (4 chapters)
  c_*.tex                       Computer Programming track (3 chapters)
  kids_*.tex                    Young Makers track (3 chapters, ages 7+)
  teaching_construction_kit.tex The Construction Kit, for teachers
  assembly_meets_c.tex          Reunion: one game, two languages
  cartridge_store.tex           Publishing: visitor, user, editor, administrator
appendices/              API reference, performance, worked examples, GitHub, hardware
examples/                Source files listed in the book
  blocks_first_steps/    Construction Kit projects (.blocks.json) and their generated C
  store_publishing/      Bundle manifest and colophon
  complete/              Full games, including Lemon Catcher in hand-written C
scripts/                 Shell listings (setup, Store, Construction Kit, PRG32-QT, ...)
figures/                 Screenshots
presentations/           Two slide decks per chapter (lecture + lab) and their generator
labs/                    Verified step-by-step tutorial sources and screenshots for the lab decks
workshops/               Workshop decks and material (EST Napoli Innovation Festival, Maker Faire)
```

## About the platform

The textbook is built around the PRG32 open educational runtime for RISC-V
assembly and C games, by Raffaele Montella, Ivan Cafiero and Simone Boscaglia (University of
Naples "Parthenope"), distributed under the MIT License:

  https://github.com/riscv-prg32/PRG32

Most source files under `examples/` are reproduced from that repository's
`examples/games` directory and remain under their original MIT License; the
Blocks projects, the Lemon Catcher game, and the Store and audio examples were
written for this book. The companion projects are the
[Cartridge Store](https://github.com/riscv-prg32/CartridgeStore), the
[PRG32-Construction-Kit](https://github.com/riscv-prg32/PRG32-Construction-Kit),
and [PRG32-QT](https://github.com/riscv-prg32/PRG32-QT). If you use PRG32 in coursework, cite it via the repository's
`CITATION.cff`.

## Notes

- All callout boxes, code listings, and diagrams are defined in
  `prg32style.sty`; edit colours and styles there in one place.
- The book compiles cleanly with no errors and no overfull boxes.
- Every code example in the book is designed to run on both the QEMU emulator
  (ESP32-C3 graphics target) and the physical ESP32-C6 board, and, as a
  portable cartridge, in PRG32-QT.
- The new C and assembly examples were built with `python3 -m prg32 cartridge
  build --portable` against PRG32 `main` (cartridge ABI 1.6).

## Slide decks

`presentations/` holds a lecture deck and a lab deck for every chapter; see
[presentations/README.md](presentations/README.md). The lab decks are
step-by-step tutorials over the verified sources in [labs/](labs/README.md).

## Workshops

- [workshops/EST-Napoli_Innovation_Festival](workshops/EST-Napoli_Innovation_Festival/README.md):
  three alternative 90-minute decks in Italian (Breakout in assembly, in C,
  and with the Construction Kit).
- [workshops/Maker_Faire](workshops/Maker_Faire/README.md): a 2.5-hour
  workshop in Italian and English, from assembly to mixed assembly/C.

## Staying aligned with PRG32

The [PRG32 `main` branch](https://github.com/riscv-prg32/PRG32) is the source of truth for the runtime API and current build commands. Before a course, check the [getting-started guide](https://github.com/riscv-prg32/PRG32/blob/main/docs/usage/getting_started.md), [cartridge guide](https://github.com/riscv-prg32/PRG32/blob/main/docs/software/cartridges.md), and [public header](https://github.com/riscv-prg32/PRG32/blob/main/components/prg32/include/prg32.h). The textbook examples show the corresponding portable-cartridge workflow.
