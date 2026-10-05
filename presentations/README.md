# Presentations

Teaching support for *Playing with RISC-V*: **two slide decks for every chapter**
(34 decks, about 30 slides each, 16:9 PowerPoint).

| Deck | Purpose | Shape |
| --- | --- | --- |
| `NN-<chapter>-lecture.pptx` | about 45 minutes of front teaching | objectives, agenda, concept slides, code read from the book's examples, check-your-understanding questions, summary |
| `NN-<chapter>-lab.pptx` | about 45 minutes of practical, step-by-step work | numbered steps, each with a time box and an *expected result*, interleaved with reference slides and questions |

Each deck is pitched at the audience of its chapter:

| Chapters | Audience |
| --- | --- |
| 1-4 (Foundations, PRG32-QT) | first-year university students |
| 5-8 (assembly track) | computer architecture students |
| 9-11 (C track) | computer programming students |
| 12-14 (Young Makers) | children aged 7 and over, led by a teacher: large type, short sentences, blocks drawn in colour |
| 15 (Teaching with the Construction Kit) | teachers, club leaders, teaching assistants |
| 16-17 (reunion, Cartridge Store) | both university tracks; Store staff |

Speaker notes carry the answers to the quiz slides, teaching tips, and the
source file of every listing. Every lab deck's title-slide notes list the
preparation the room needs.

## Labs are verified tutorials

The lab decks of the code chapters are step-by-step tutorials over the files in
[`labs/`](../labs/README.md). Each step is a complete program that was built
and executed while the decks were prepared; the screenshot beside the code is
the frame that run produced, and the sizes, logs and tool replies quoted on the
slides are the real ones. A learner who types `labs/run.sh STEP PREFIX` gets
what the slide shows.

The lecture decks carry the technical detail behind those steps: instruction
encodings bit by bit, the cartridge header and the stack frame byte by byte,
the generated ABI stubs, memory maps, and real compiler and tool output.

Workshop decks built with the same engine live in
[`workshops/`](../workshops/).

## Rebuilding

The decks are generated, so slides and book cannot drift apart: code slides read
their listings directly from `examples/` and `scripts/`.

```bash
cd presentations/tools
npm install
node build.js        # all decks
node build.js 12     # only chapter 12
node build.js ws     # the EST Napoli workshop decks
node build.js mf     # the Maker Faire decks
```

- `tools/build.js` is the layout engine (pptxgenjs). It measures text before
  placing it and **fails the build** if a slide's text cannot fit at a readable
  size, instead of shipping an overflowing slide.
- `tools/decks/*.js` hold the content, one compact specification per deck;
  `zz-labs-*.js` are the verified lab tutorials and `zz-technical.js` the
  technical slides inserted into the lectures.

To change a slide, edit its line in `tools/decks/`, rebuild, and commit both the
specification and the regenerated `.pptx`.

## Licence

Same terms as the textbook. Screenshots of PRG32-Construction-Kit and PRG32-QT
come from those projects (MIT License).
