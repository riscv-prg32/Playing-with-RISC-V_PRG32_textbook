#!/usr/bin/env python3
"""Genera i progetti Blocks del laboratorio (uno per passo) e il C che il
Construction Kit produce per ciascuno.

    export PRG32_KIT_HOME=~/PRG32-Construction-Kit
    python3 breakout_blocks.py

Ogni file kit/passoN.blocks.json si importa nel Kit con "Import JSON".
"""
import itertools, json, os, sys
from pathlib import Path

sys.path.insert(0, os.environ.get("PRG32_KIT_HOME", "."))
from prg32_construction_kit import generator  # noqa: E402

OUT = Path(__file__).resolve().parent.parent / "kit"
OUT.mkdir(exist_ok=True)
ids = itertools.count(1)
BRICKS = [(k + 1, 3 + k * 53, "RED" if k % 2 == 0 else "YELLOW") for k in range(6)]


def B(kind, **fields):
    return {"type": "prg32_" + kind, "fields": {k.upper(): str(v) for k, v in fields.items()}}


def IF(kind, body, **fields):
    block = B(kind, **fields)
    block["body"] = body
    return block


def chain(statements, slug):
    head = None
    for s in reversed(statements):
        block = {"type": s["type"], "id": f"{slug}-{next(ids)}", "fields": s["fields"]}
        if "body" in s:
            block["inputs"] = {"DO": {"block": chain(s["body"], slug)}}
        if head:
            block["next"] = {"block": head}
        head = block
    return head


def ball_touches(body, bx, by, bw, bh):
    return IF("if_touching", body, ax="ball_x", ay="ball_y", aw=6, ah=6, bx=bx, by=by, bw=bw, bh=bh)


def project(step):
    start, update, draw = [], [], [B("clear_screen", color="BLACK")]
    if step >= 2:
        start.append(B("set_state", var="paddle_x", value=136))
    if step >= 4:
        start += [B("set_state", var="ball_x", value=157), B("set_state", var="ball_y", value=120),
                  B("set_state", var="ball_dx", value=2), B("set_state", var="ball_dy", value=-2)]
    if step >= 6:
        start += [B("set_state", var=f"m{n}_y", value=30) for n, _, _ in BRICKS]
    if step >= 7:
        start.append(B("set_state", var="score", value=0))

    if step >= 3:
        update += [IF("if_button", [B("change_state", var="paddle_x", delta=-4)], button="LEFT"),
                   IF("if_button", [B("change_state", var="paddle_x", delta=4)], button="RIGHT"),
                   B("clamp_state", var="paddle_x", low=0, high=272)]
    if step >= 4:
        update += [B("comment", text="La pallina si muove: posizione + velocita"),
                   B("change_state", var="ball_x", delta="ball_dx"),
                   B("change_state", var="ball_y", delta="ball_dy"),
                   B("comment", text="I muri sono rettangoli appena fuori dallo schermo"),
                   ball_touches([B("set_state", var="ball_dx", value=2)], -10, 0, 10, 200),
                   ball_touches([B("set_state", var="ball_dx", value=-2)], 320, 0, 10, 200),
                   ball_touches([B("set_state", var="ball_dy", value=2)], 0, -10, 320, 10),
                   ball_touches([B("set_state", var="ball_x", value=157), B("set_state", var="ball_y", value=120),
                                 B("set_state", var="ball_dy", value=-2)], 0, 200, 320, 10)]
    if step >= 5:
        hit = [B("set_state", var="ball_dy", value=-2)]
        if step >= 7:
            hit.append(B("play_beep", freq=262, ms=40))
        update += [B("comment", text="La racchetta rimanda la pallina in alto"),
                   ball_touches(hit, "paddle_x", 188, 48, 6)]
    if step >= 7:
        update.append(B("comment", text="Un mattoncino colpito va fuori schermo (y = 400)"))
        for n, x, _ in BRICKS:
            update.append(ball_touches([B("set_state", var=f"m{n}_y", value=400),
                                        B("set_state", var="ball_dy", value=2),
                                        B("change_state", var="score", delta=1),
                                        B("play_beep", freq=660, ms=40)], x, f"m{n}_y", 48, 10))
    if step >= 8:
        update += [B("comment", text="Vittoria: score vale 6, si ricomincia"),
                   IF("if_touching", [B("set_state", var=f"m{n}_y", value=30) for n, _, _ in BRICKS]
                      + [B("set_state", var="score", value=0)],
                      ax="score", ay=0, aw=1, ah=1, bx=6, by=0, bw=1, bh=1)]
    if not update:
        update = [B("comment", text="Per ora non cambia nulla")]

    if step >= 6:
        draw += [B("draw_rect", x=x, y=f"m{n}_y", w=48, h=10, color=color) for n, x, color in BRICKS]
    if step >= 7:
        draw.append(B("draw_rect", x=2, y=6, w="score * 8", h=6, color="GREEN"))
    if step >= 2:
        draw.append(B("draw_rect", x="paddle_x", y=188, w=48, h=6, color="CYAN"))
    if step >= 4:
        draw.append(B("draw_rect", x="ball_x", y="ball_y", w=6, h=6, color="WHITE"))
    if not start:
        start = [B("comment", text="Qui prepareremo il gioco")]

    slug = f"passo{step}"
    tops = [{"type": "prg32_" + kind, "id": f"{slug}-{kind}", "x": x, "y": 20,
             "inputs": {"DO": {"block": chain(statements, slug)}}}
            for kind, statements, x in (("on_start", start, 20), ("update", update, 340), ("draw", draw, 760))]
    return {"abi": "prg32-construction-kit-project-1.0", "title": "Breakout",
            "description": f"Laboratorio EST Napoli: Breakout, passo {step} di 8.",
            "author": "PRG32 workshop", "tags": ["workshop", "breakout", slug],
            "blocks_json": {"blocks": {"languageVersion": 0, "blocks": tops}}}


for step in range(1, 9):
    p = project(step)
    (OUT / f"passo{step}.blocks.json").write_text(json.dumps(p, indent=2) + "\n")
    ir, c = generator.blocks_to_c(p["blocks_json"], p)
    assert "Unsupported" not in json.dumps(ir), step
    (OUT / f"passo{step}.c").write_text(c)
    print(f"passo{step}: prefix={ir['entry_prefix']} variabili={len(ir['state'])}")
