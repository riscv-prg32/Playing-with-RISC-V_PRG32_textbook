# PRG32: videogiochi retrò per imparare il processore europeo RISC-V

Materiale del laboratorio per **EST - Napoli Innovation Festival**, giovedì
22 ottobre 2026 (10:30-12:00 e 12:00-13:30, Sala Coworking, primo piano), a
cura dell'Università degli Studi di Napoli "Parthenope" - Prof. Raffaele
Montella.
[Scheda nel programma](https://festivalnapoliest.it/programma#2026-10-22-1030-prg32-videogiochi-retr-per-imparare-il-proce).

## Tre presentazioni alternative (90 minuti ciascuna)

Stessa introduzione, stessa piattaforma, **stesso gioco** (Breakout) costruito
in otto passi; cambia solo il linguaggio. Si sceglie in base al pubblico.

| File | Il gioco si scrive in | Serve |
| --- | --- | --- |
| `PRG32_Breakout_assembly.pptx` | assembly RISC-V | toolchain PRG32 |
| `PRG32_Breakout_C.pptx` | linguaggio C | toolchain PRG32 |
| `PRG32_Breakout_Construction_Kit.pptx` | blocchi (PRG32 Construction Kit) | solo un browser |

Scaletta comune: l'idea (10') - la piattaforma PRG32 (15') - il ciclo
init/update/draw (10') - Breakout passo per passo (45') - sfide finali (10').

## Il gioco, passo per passo

| Passo | Cosa si aggiunge |
| --- | --- |
| 1 | lo scheletro: tre funzioni, schermo nero |
| 2 | la racchetta: una variabile di stato, un rettangolo |
| 3 | i pulsanti: muovere la racchetta e tenerla nello schermo |
| 4 | la pallina: velocità, rimbalzo sui muri, pallina persa |
| 5 | l'urto con la racchetta |
| 6 | i mattoncini: un ciclo (assembly, C) o una variabile ciascuno (blocchi) |
| 7 | l'urto con i mattoncini, il punteggio, il suono |
| 8 | la vittoria: tutto ricomincia |

- `asm/passoN_*.S`, `c/passoN_*.c`: **ogni file è un gioco completo** che si
  compila e funziona. Il passo N contiene tutto il passo N-1 più il nuovo.
- `kit/passoN.blocks.json`: progetti da caricare nel Construction Kit con
  *Import JSON*; `kit/passoN.c` è il C che il Kit genera per quel progetto.
- `*/expected/*.png`: la schermata di ogni passo, ottenuta **eseguendo davvero
  la cartuccia** (sono le immagini che compaiono nelle slide).
- `cartucce/*.prg32`: le 24 cartucce già compilate, da aprire in PRG32-QT o
  caricare su una scheda senza installare nulla.
- `sorgenti/`: i file da cui tutto il resto è generato.

## Preparare le postazioni

Versioni assembly e C:

```bash
git clone https://github.com/riscv-prg32/PRG32 ~/PRG32     # e ESP-IDF 5.4, vedi il README di PRG32
. ~/esp-idf/export.sh
export PRG32_HOME=~/PRG32
./prova.sh asm 1        # compila il passo 1 in assembly e lo avvia in QEMU
./prova.sh c 5          # passo 5 in C
```

Per avviare su una scheda PRG32 o su PRG32-QT invece che in QEMU:

```bash
export PRG32_URL=http://192.168.4.1     # indirizzo della scheda o di PRG32-QT
./prova.sh asm 8
```

Versione Construction Kit: avviare il Kit su un computer raggiungibile dalle
postazioni (`python app.py`, porta 5090) e scrivere l'indirizzo alla lavagna.

## Rigenerare tutto

```bash
export PRG32_HOME=~/PRG32 PRG32_KIT_HOME=~/PRG32-Construction-Kit
export PRG32QT_HEADLESS=~/PRG32-QT/build-core/prg32qt-headless
python3 sorgenti/breakout_blocks.py                  # progetti Blocks e C generato
python3 ../../labs/tools/steps.py workshop           # passi, cartucce, schermate
(cd ../../presentations/tools && node build.js ws)   # le tre presentazioni
```

I sorgenti `sorgenti/breakout_asm.master.S` e `breakout_c.master.c` contengono
l'intero gioco; le righe `#@ N` / `//@ N` dicono da quale passo in poi compare
il codice che segue.
