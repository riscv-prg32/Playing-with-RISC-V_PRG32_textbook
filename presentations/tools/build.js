#!/usr/bin/env node
/*
 * Slide-deck generator for "Playing with RISC-V" (PRG32 textbook).
 *
 *   npm install && node build.js            # build every deck
 *   node build.js 12                        # build only chapter 12
 *
 * Deck content lives in decks/*.js as compact slide specifications; this file
 * turns each specification into a 16:9 .pptx with pptxgenjs.  Code slides read
 * their listings from the textbook's examples/ and scripts/ folders, so slides
 * and book never drift apart.  Text is measured before it is placed: a slide
 * whose text cannot fit at a readable size fails the build instead of shipping
 * overflowing text.
 */
const fs = require("fs");
const path = require("path");
const pptxgen = require("pptxgenjs");
const JSZip = require("jszip");

const ROOT = path.resolve(__dirname, "..", "..");
const OUT = path.resolve(__dirname, "..");

// ---- palette (the textbook's own colours) ---------------------------------
const P = {
  ink: "1B2530", steel: "2E4A62", teal: "0E7C86", amber: "C7791B",
  red: "B23A48", green: "2F7D4F", violet: "6B4FA0", plum: "A03A8A",
  panel: "EEF2F4", rule: "C9D2D8", white: "FFFFFF", mute: "5B6B78",
  code: "12202B", codeText: "E6EDF2", codeComment: "8FB3A0", ice: "CFE3EA",
};
const SCREEN = { BLACK: "000000", WHITE: "FFFFFF", RED: "F80000", GREEN: "00FC00",
  BLUE: "0000F8", YELLOW: "F8FC00", CYAN: "00FCF8", MAGENTA: "F800F8",
  ORANGE: "F8A400", GREY: "808080" };
const HEAD = "Cambria", BODY = "Calibri", MONO = "Courier New";
const MONOCOL = /^(Instruction|Command|Call|Constant|Example|You write|The assembler emits|Endpoint|Path|Option|Register|Mask|Assembly|C|Hex|RGB565|Variable|Function|The same thing in C|In C|Assembly offset|Istruzione|Blocco|Il vostro blocco)$/;
const W = 13.333, H = 7.5, MX = 0.6, TOP = 1.6, BOT = 6.8, CW = W - 2 * MX;

// ---- slide constructors used by the deck files -----------------------------
const mk = (t) => (...a) => ({ t, a });
const api = {
  T: mk("bullets"),   // T(title, [bullets], note?, [bigText, label]?)
  C: mk("cards"),     // C(title, [[head, body], ...], note?)
  S: mk("steps"),     // S(title, [[head, body], ...], note?)
  K: mk("code"),      // K(title, fileOrText, [startRegexOrLine, count]|null, [callouts], note?)
  V: mk("versus"),    // V(title, [head, [items]], [head, [items]], note?)
  G: mk("table"),     // G(title, [headers], [[cells]...], note?, [colWidths]?)
  B: mk("big"),       // B(statement, sub?, note?)
  X: mk("exercise"),  // X(title, [tasks], minutes, expected, note?)
  Q: mk("quiz"),      // Q(question, [options], answerIndex, explanation)
  H: mk("section"),   // H(title, sub?)
  I: mk("image"),     // I(title, imagePath, caption, note?)
  F: mk("flow"),      // F(title, ["Head|sub", ...], caption?, note?)
  L: mk("blocks"),    // L(title, [[kind, text, indent?], ...], [bullets], note?)
  N: mk("checklist"), // N(title, [items], note?)
  SC: mk("screen"),
  W: mk("walk"),      // W(title, file, range, screenshotPng, text, note?)  code + real screenshot
  M: mk("layout"),    // M(title, [[name, bytes, description], ...], caption?, note?, baseOffset?)
  E: mk("encoding"),  // E(title, [[bits, name, value], ...], caption, note?)   32-bit instruction fields   // SC(title, [[x,y,w,h,COLOR,label?], ...], [bullets], note?)
};
const TXT = {
  en: { lecture: "LECTURE", lab: "LABORATORY", workshop: "WORKSHOP", minutes: "MINUTES", chapter: "CHAPTER", audience: "Audience",
    goals: "Learning objectives", goalsKids: "Today you will learn to", agenda: "Agenda", plan: "Plan of the session", step: "Step", about: "about", min: "min",
    expected: "Expected result", expectedKids: "You should see", quiz: "Check your understanding", quizKids: "Quick question",
    closing: "Next steps and reading", closingKids: "Next time, and for grown-ups", next: "Before the next session", nextKids: "Next time",
    refs: "Reading and sources", refsKids: "For the grown-ups", book: "Playing with RISC-V: Assembly, C, and Retro Games on the PRG32 Platform",
    footLecture: "Lecture", footLab: "Lab", ran: "Screenshot: this step, built and run", offset: "offset", bytes: "bytes" },
  it: { lecture: "LEZIONE", lab: "LABORATORIO", workshop: "LABORATORIO", minutes: "MINUTI", chapter: "", audience: "Per chi",
    goals: "Cosa impareremo", goalsKids: "Oggi impariamo a", agenda: "Programma", plan: "Programma", step: "Passo", about: "circa", min: "min",
    expected: "Risultato atteso", expectedKids: "Dovresti vedere", quiz: "Domanda", quizKids: "Domanda veloce",
    closing: "E adesso?", closingKids: "E adesso?", next: "Per continuare", nextKids: "Per continuare",
    refs: "Dove trovare tutto", refsKids: "Per gli adulti", book: "Playing with RISC-V: Assembly, C, and Retro Games on the PRG32 Platform",
    footLecture: "Lezione", footLab: "Laboratorio", ran: "Schermata vera: questo passo, compilato ed eseguito", offset: "offset", bytes: "byte" },
};
const decks = [];
// A later Deck with the same chapter, kind and file replaces an earlier one, so
// reworked decks can live in their own files.  Extend() inserts slides into an
// existing deck after the slide with the given title.
const keyOf = (d) => `${d.n}|${d.kind}|${d.file || ""}`;
api.Deck = (d) => {
  const i = decks.findIndex((x) => keyOf(x) === keyOf(d));
  if (i >= 0) decks[i] = d; else decks.push(d);
  return d;
};
api.Extend = (n, kind, afterTitle, slides) => {
  const d = decks.find((x) => String(x.n) === String(n) && x.kind === kind);
  if (!d) throw new Error(`Extend: no deck ${n} ${kind}`);
  const i = d.slides.findIndex((sl) => sl.a[0] === afterTitle);
  if (i < 0) throw new Error(`Extend: no slide titled "${afterTitle}" in ch${n} ${kind}`);
  d.slides.splice(i + 1, 0, ...slides);
};
Object.assign(global, api);

// ---- text measurement ------------------------------------------------------
function linesFor(text, wIn, fsPt, mono, bold) {
  const cw = (mono ? 0.6 : bold ? 0.54 : 0.5) * fsPt / 72;
  const cpl = Math.max(4, Math.floor(wIn / cw));
  let n = 0;
  for (const para of String(text).split("\n")) {
    let line = 0, c = 0;
    for (const word of para.split(" ")) {
      if (c > 0 && c + 1 + word.length > cpl) { line++; c = 0; }
      c += (c > 0 ? 1 : 0) + word.length;
      while (c > cpl) { line++; c -= cpl; }
    }
    n += line + 1;
  }
  return n;
}
const heightFor = (text, w, fsz, mono, bold) =>
  linesFor(text, w, fsz, mono, bold) * fsz * 1.22 / 72;
let WHERE = "";
function fit(text, w, h, max, min, mono, bold) {
  for (let s = max; s >= min; s -= 1) {
    if (heightFor(text, w, s, mono, bold) <= h) return s;
  }
  throw new Error(`${WHERE}: text does not fit (${w.toFixed(1)}x${h.toFixed(1)}in at ${min}pt): "${String(text).slice(0, 70)}"`);
}

// ---- helpers ---------------------------------------------------------------
function pngSize(file) {
  const b = fs.readFileSync(file);
  return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) };
}
function readListing(src, range) {
  let text = src;
  if (!src.includes("\n") && /\.(S|s|c|h|sh|ps1|json|py)$/.test(src)) {
    text = fs.readFileSync(path.join(ROOT, src), "utf8");
  }
  let lines = text.replace(/\t/g, "    ").replace(/\s+$/, "").split("\n");
  lines = lines.map((l) => l.replace(/\s*-{6,}\s*(\*\/)?\s*$/, (m, close) => (close ? " */" : "")));   // drop decorative dashes
  if (range) {
    let start = 0;
    if (typeof range[0] === "number") start = range[0] - 1;
    else {
      start = lines.findIndex((l) => l.includes(range[0]));
      if (start < 0) throw new Error(`${WHERE}: marker "${range[0]}" not found in ${src}`);
    }
    lines = lines.slice(start, start + range[1]);
  }
  while (lines.length && !lines[0].trim()) lines.shift();
  while (lines.length && !lines[lines.length - 1].trim()) lines.pop();
  return lines;
}
function wrapListing(lines, cwid, ch) {
  // Soft-wrap over-long lines at a space, at the largest font for which the result still fits.
  for (const pt of [12.5, 11.5, 10.5, 10]) {
    const maxCols = Math.floor((cwid - 0.55) * 72 / (pt * 0.635)), out = [];
    for (const l of lines) {
      const indent = (l.match(/^\s*/) || [""])[0] + "    ", cut = l.length > maxCols ? l.lastIndexOf(" ", maxCols) : -1;
      if (cut > indent.length) out.push(l.slice(0, cut), indent + l.slice(cut + 1)); else out.push(l);
    }
    if (out.length * pt * 1.2 / 72 <= ch - 0.4 || pt === 10) return out;
  }
  return lines;
}
function commentAt(line, lang) {
  if (lang === "asm") { const i = line.indexOf("#"); return i; }
  if (lang === "sh") { const i = line.search(/(^|\s)#/); return i < 0 ? -1 : i; }
  const a = line.indexOf("//"), b = line.indexOf("/*");
  if (a < 0) return b; if (b < 0) return a; return Math.min(a, b);
}

function build(deck) {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_WIDE";
  pres.author = "Playing with RISC-V (PRG32 textbook)";
  pres.title = `${deck.title} - ${deck.kind}`;
  pres.subject = deck.footer || `Chapter ${deck.n}`;
  pres.theme = { headFontFace: HEAD, bodyFontFace: BODY };
  const kids = !!deck.kids;
  const ACC = kids ? P.violet : deck.kind === "lab" ? P.green : P.teal;
  const BASE = kids ? 22 : 19, MIN = kids ? 17 : 14;
  const T_ = TXT[deck.lang || "en"];
  const kindLabel = deck.kind === "lab" ? T_.footLab : T_.footLecture;
  const footer = deck.footer || `Playing with RISC-V  |  Chapter ${deck.n}: ${deck.short || deck.title}  |  ${kindLabel}`;

  pres.defineSlideMaster({
    title: "LIGHT", background: { color: P.white },
    objects: [
      { text: { text: footer, options: { x: MX, y: 7.02, w: 10.5, h: 0.3, fontFace: BODY, fontSize: 10, color: P.mute, margin: 0 } } },
      { placeholder: { options: { name: "title", type: "title", x: MX, y: 0.42, w: CW, h: 0.95, fontFace: HEAD, fontSize: 30, bold: true, color: P.steel, align: "left", valign: "middle", margin: 0 }, text: "" } },
    ],
    slideNumber: { x: W - MX - 0.7, y: 7.02, w: 0.7, h: 0.3, fontFace: BODY, fontSize: 10, color: P.mute, align: "right" },
  });
  pres.defineSlideMaster({ title: "DARK", background: { color: P.ink },
    slideNumber: { x: W - MX - 0.7, y: 7.02, w: 0.7, h: 0.3, fontFace: BODY, fontSize: 10, color: P.ice, align: "right" } });

  let section = "Opening";
  pres.addSection({ title: section });
  let stepNo = 0, secNo = 0, count = 0;

  const tx = (s, text, o) => s.addText(text, Object.assign({ isTextBox: true, margin: 0, fontFace: BODY, color: P.ink, valign: "top" }, o));
  const light = (title) => {
    const s = pres.addSlide({ masterName: "LIGHT", sectionTitle: section });
    if (title.length > 58) throw new Error(`${WHERE}: title too long (${title.length}): ${title}`);
    s.addText(title, { placeholder: "title", fontSize: title.length > 44 ? 26 : 30 });
    count++; return s;
  };
  const dark = () => { count++; return pres.addSlide({ masterName: "DARK", sectionTitle: section }); };
  const pixels = (s, x, y, sz, cols) => cols.forEach((c, i) => c && s.addShape(pres.ShapeType.rect,
    { x: x + (i % 3) * sz, y: y + Math.floor(i / 3) * sz, w: sz * 0.92, h: sz * 0.92, fill: { color: c }, line: { color: c, width: 0 } }));
  const badge = (s, x, y, d, label, color) => s.addText(String(label), { isTextBox: true, shape: pres.ShapeType.roundRect, rectRadius: 0.08,
    x, y, w: d, h: d, fill: { color }, line: { color, width: 0 }, color: P.white, bold: true, fontFace: BODY,
    fontSize: Math.round(d * 34), align: "center", valign: "middle", margin: 0 });
  const card = (s, x, y, w, h, fill) => s.addShape(pres.ShapeType.roundRect, { x, y, w, h, rectRadius: 0.08,
    fill: { color: fill || P.panel }, line: { color: fill || P.panel, width: 0 } });
  const rows = (s, items, x, y, w, h, mark) => {
    const n = items.length, gap = 0.18, rh = (h - gap * (n - 1)) / n, d = Math.min(0.5, rh * 0.8);
    const all = items.map((it) => fit(it, w - d - 0.3, rh, BASE + (n <= 4 ? 5 : 3), MIN));
    const fsz = Math.min(...all);
    items.forEach((it, i) => {
      const yy = y + i * (rh + gap);
      const th = heightFor(it, w - d - 0.3, fsz);
      if (mark === "check") badge(s, x, yy + 0.02, d, i + 1, P.green);
      else badge(s, x, yy + 0.02, d, i + 1, ACC);
      tx(s, it, { x: x + d + 0.3, y: yy, w: w - d - 0.3, h: Math.max(rh, th), fontSize: fsz, valign: th < d ? "middle" : "top",
        ...(th < d ? { h: d + 0.04 } : {}) });
    });
  };
  const notes = (s, n) => { if (n) s.addNotes(n); };

  const R = {
    bullets([title, items, note, side]) {
      const s = light(title);
      if (side) {
        rows(s, items, MX, TOP, 7.9, BOT - TOP);
        card(s, 9.0, TOP, W - MX - 9.0, BOT - TOP, P.ink);
        const bf = fit(side[0], 3.3, 2.0, 60, 30, false, true);
        tx(s, side[0], { x: 9.2, y: TOP + 0.9, w: 3.33, h: 2.0, fontFace: HEAD, fontSize: bf, bold: true, color: P.white, align: "center", valign: "middle" });
        tx(s, side[1], { x: 9.3, y: TOP + 3.1, w: 3.13, h: 1.5, fontSize: fit(side[1], 3.13, 1.5, 18, 13), color: P.ice, align: "center" });
      } else rows(s, items, MX, TOP, CW, BOT - TOP);
      notes(s, note);
    },
    checklist([title, items, note]) { const s = light(title); rows(s, items, MX, TOP, CW, BOT - TOP, "check"); notes(s, note); },
    cards([title, cards, note]) {
      const s = light(title), n = cards.length;
      const cols = n <= 3 ? n : n === 4 ? 2 : 3, rws = Math.ceil(n / cols), g = 0.3;
      const cw = (CW - g * (cols - 1)) / cols, ch = (BOT - TOP - g * (rws - 1)) / rws;
      const tints = [P.teal, P.amber, P.violet, P.green, P.red, P.steel];
      cards.forEach(([head, body], i) => {
        const x = MX + (i % cols) * (cw + g), y = TOP + Math.floor(i / cols) * (ch + g);
        card(s, x, y, cw, ch);
        badge(s, x + 0.25, y + 0.25, 0.42, i + 1, tints[i % 6]);
        const hf = fit(head, cw - 1.1, 0.75, kids ? 22 : 20, 14, false, true);
        tx(s, head, { x: x + 0.85, y: y + 0.2, w: cw - 1.1, h: 0.75, fontSize: hf, bold: true, color: P.steel, valign: "middle" });
        tx(s, body, { x: x + 0.3, y: y + 1.05, w: cw - 0.6, h: ch - 1.25, fontSize: fit(body, cw - 0.6, ch - 1.25, BASE + 1, MIN - 1) });
      });
      notes(s, note);
    },
    steps([title, steps, note]) {
      const s = light(title), n = steps.length, g = 0.45, bw = (CW - g * (n - 1)) / n, y = TOP + 0.5, bh = BOT - y - 0.2;
      const bf = Math.min(...steps.map(([, b]) => fit(b, bw - 0.4, bh - 1.7, BASE, MIN - 1)));
      steps.forEach(([head, body], i) => {
        const x = MX + i * (bw + g);
        card(s, x, y, bw, bh);
        badge(s, x + bw / 2 - 0.3, y - 0.3, 0.6, i + 1, ACC);
        tx(s, head, { x: x + 0.2, y: y + 0.45, w: bw - 0.4, h: 0.9, fontSize: fit(head, bw - 0.4, 0.9, 19, 13, false, true), bold: true, color: P.steel, align: "center", valign: "middle" });
        tx(s, body, { x: x + 0.2, y: y + 1.5, w: bw - 0.4, h: bh - 1.7, fontSize: bf });
        if (i < n - 1) s.addShape(pres.ShapeType.rightArrow, { x: x + bw + 0.07, y: y + bh / 2 - 0.16, w: g - 0.14, h: 0.32, fill: { color: P.rule }, line: { color: P.rule, width: 0 } });
      });
      notes(s, note);
    },
    code([title, src, range, callouts, note]) {
      const s = light(title); let lines = readListing(src, range);
      const lang = /\.[Ss]$/.test(src) ? "asm" : /\.(sh|ps1)$/.test(src) || /^\$|python3 -m|^#!/m.test(src) ? "sh" : "c";
      const side = callouts && callouts.length, cwid = side ? 8.1 : CW, ch = BOT - TOP;
      lines = wrapListing(lines, cwid, ch);
      const longest = Math.max(...lines.map((l) => l.length));
      let fsz = 18;
      while (fsz > 10 && (lines.length * fsz * 1.2 / 72 > ch - 0.4 || longest * fsz * 0.635 / 72 > cwid - 0.55)) fsz -= 0.5;
      if (lines.length * fsz * 1.2 / 72 > ch - 0.4 || longest * fsz * 0.635 / 72 > cwid - 0.55)
        throw new Error(`${WHERE}: listing too large (${lines.length} lines, ${longest} cols)`);
      card(s, MX, TOP, cwid, ch, P.code);
      const runs = [];
      lines.forEach((l, i) => {
        const c = commentAt(l, lang), last = i === lines.length - 1;
        const a = c < 0 ? l : l.slice(0, c), b = c < 0 ? "" : l.slice(c);
        if (b) { if (a) runs.push({ text: a, options: { color: P.codeText } }); runs.push({ text: b, options: { color: P.codeComment, breakLine: !last } }); }
        else runs.push({ text: a || " ", options: { color: P.codeText, breakLine: !last } });
      });
      s.addText(runs, { isTextBox: true, x: MX + 0.25, y: TOP + 0.2, w: cwid - 0.5, h: ch - 0.4, fontFace: MONO, fontSize: fsz, margin: 0, valign: "top", paraSpaceAfter: 0 });
      if (side) {
        const x = MX + cwid + 0.3, w = W - MX - x, g = 0.22, n = callouts.length, h = (ch - g * (n - 1)) / n;
        const cf = Math.min(...callouts.map((c) => fit(c, w - 0.95, h - 0.3, 17, 13)));
        callouts.forEach((c, i) => {
          const y = TOP + i * (h + g);
          card(s, x, y, w, h); badge(s, x + 0.18, y + 0.18, 0.4, i + 1, P.amber);
          tx(s, c, { x: x + 0.75, y: y + 0.15, w: w - 0.95, h: h - 0.3, fontSize: cf, valign: "middle" });
        });
      }
      notes(s, (note ? note + "\n" : "") + (src.includes("\n") ? "" : `Source: ${src}`));
    },
    versus([title, left, right, note]) {
      const s = light(title), g = 0.4, cw = (CW - g) / 2;
      [left, right].forEach(([head, items], i) => {
        const x = MX + i * (cw + g), col = i ? P.amber : P.teal;
        card(s, x, TOP, cw, BOT - TOP);
        s.addText(head, { isTextBox: true, shape: pres.ShapeType.roundRect, rectRadius: 0.08, x: x + 0.3, y: TOP + 0.25, w: cw - 0.6, h: 0.6,
          fill: { color: col }, line: { color: col, width: 0 }, color: P.white, bold: true, fontFace: BODY, fontSize: fit(head, cw - 0.9, 0.6, 19, 13, false, true), align: "center", valign: "middle", margin: 0 });
        const body = items.join("\n"), bh = BOT - TOP - 1.3;
        const fsz = fit(body, cw - 0.9, bh - items.length * 0.14, BASE + 2, MIN);
        s.addText(items.map((t, k) => ({ text: t, options: { bullet: { indent: 16 }, breakLine: k < items.length - 1 } })),
          { isTextBox: true, x: x + 0.35, y: TOP + 1.1, w: cw - 0.7, h: bh, fontFace: BODY, fontSize: fsz, color: P.ink, valign: "top", margin: 0, paraSpaceAfter: 8 });
      });
      notes(s, note);
    },
    table([title, head, body, note, widths]) {
      const s = light(title), cols = head.length;
      const tw = widths ? widths.map((v) => v * CW / widths.reduce((a, b) => a + b, 0)) : Array(cols).fill(CW / cols);
      let fsz = kids ? 24 : 22, total;
      for (; fsz >= 12; fsz--) {
        total = [head, ...body].reduce((acc, r) => acc + Math.max(...r.map((c, i) => heightFor(c, tw[i] - 0.25, fsz))) + 0.16, 0);
        if (total <= BOT - TOP) break;
      }
      if (total > BOT - TOP) throw new Error(`${WHERE}: table too tall`);
      const cell = (t, o) => ({ text: String(t), options: Object.assign({ fontFace: BODY, fontSize: fsz, color: P.ink, valign: "middle", margin: [4, 8, 4, 8] }, o) });
      const data = [head.map((h) => cell(h, { bold: true, color: P.white, fill: { color: P.steel } }))]
        .concat(body.map((r, k) => r.map((c, i) => cell(c, { fill: { color: k % 2 ? P.white : P.panel }, bold: i === 0,
          fontFace: MONOCOL.test(head[i]) ? MONO : BODY }))));
      s.addTable(data, { x: MX, y: TOP, w: CW, colW: tw, border: { type: "solid", color: P.rule, pt: 0.5 } });
      notes(s, note);
    },
    big([statement, sub, note]) {
      const s = dark();
      pixels(s, MX, 0.7, 0.2, [ACC, P.amber, null, null, ACC, null]);
      tx(s, statement, { x: MX, y: 1.7, w: CW, h: 3.0, fontFace: HEAD, fontSize: fit(statement, CW, 3.0, 44, 28, false, true), bold: true, color: P.white, valign: "middle" });
      if (sub) tx(s, sub, { x: MX, y: 4.9, w: CW, h: 1.5, fontSize: fit(sub, CW, 1.5, 22, 15), color: P.ice });
      notes(s, note);
    },
    section([title, sub]) {
      secNo++; section = title; pres.addSection({ title });
      const s = dark();
      tx(s, String(secNo).padStart(2, "0"), { x: MX, y: 1.5, w: 3, h: 1.3, fontFace: HEAD, fontSize: 80, bold: true, color: ACC === P.green ? "6FCF97" : ACC === P.violet ? "B9A4E3" : "5CC7D1" });
      tx(s, title, { x: MX, y: 3.1, w: CW, h: 1.5, fontFace: HEAD, fontSize: fit(title, CW, 1.5, 42, 28, false, true), bold: true, color: P.white, valign: "middle" });
      if (sub) tx(s, sub, { x: MX, y: 4.8, w: CW, h: 1.2, fontSize: fit(sub, CW, 1.2, 22, 15), color: P.ice });
    },
    exercise([title, tasks, minutes, expected, note, shot]) {
      stepNo++;
      const s = light(title), lw = 7.9, x2 = MX + lw + 0.35, w2 = W - MX - x2;
      const n = tasks.length, g = 0.16, rh = (BOT - TOP - g * (n - 1)) / n;
      const isCmd = (t) => t.startsWith("$ ");
      const tf = Math.min(...tasks.filter((t) => !isCmd(t)).map((t) => fit(t, lw - 0.85, rh, BASE + 2, MIN)), BASE + 2);
      tasks.forEach((t, i) => {
        const y = TOP + i * (rh + g);
        badge(s, MX, y + 0.02, 0.48, i + 1, ACC);
        if (isCmd(t)) {
          const c = t.slice(2), cf = fit(c, lw - 1.15, rh - 0.16, 15, 10, true);
          card(s, MX + 0.75, y, lw - 0.75, Math.min(rh, heightFor(c, lw - 1.15, cf, true) + 0.26), P.code);
          tx(s, c, { x: MX + 0.95, y: y + 0.12, w: lw - 1.15, h: rh - 0.2, fontFace: MONO, fontSize: cf, color: P.codeText });
        } else tx(s, t, { x: MX + 0.75, y, w: lw - 0.85, h: rh, fontSize: tf, valign: heightFor(t, lw - 0.85, tf) < 0.5 ? "middle" : "top", ...(heightFor(t, lw - 0.85, tf) < 0.5 ? { h: 0.52 } : {}) });
      });
      const top2 = shot ? 0.8 : 1.25;
      card(s, x2, TOP, w2, top2, P.ink);
      if (shot) tx(s, `${T_.step} ${stepNo}  |  ${T_.about} ${minutes} ${T_.min}`, { x: x2 + 0.25, y: TOP, w: w2 - 0.5, h: top2, fontFace: HEAD, fontSize: 18, bold: true, color: P.white, valign: "middle" });
      else {
        tx(s, `${T_.step} ${stepNo}`, { x: x2 + 0.25, y: TOP + 0.15, w: w2 - 0.5, h: 0.5, fontFace: HEAD, fontSize: 22, bold: true, color: P.white });
        tx(s, `${T_.about} ${minutes} ${T_.min}`, { x: x2 + 0.25, y: TOP + 0.68, w: w2 - 0.5, h: 0.4, fontSize: 16, color: P.ice });
      }
      const py = TOP + top2 + 0.2;
      card(s, x2, py, w2, BOT - py);
      tx(s, kids ? T_.expectedKids : T_.expected, { x: x2 + 0.25, y: py + 0.1, w: w2 - 0.5, h: 0.34, fontSize: 14, bold: true, color: P.green });
      let ey = py + 0.5;
      if (shot) {
        const iw = w2 - 0.5, ih = iw * 200 / 320;
        s.addImage({ path: path.join(ROOT, shot), x: x2 + 0.25, y: ey, w: iw, h: ih, altText: expected });
        ey += ih + 0.1;
      }
      tx(s, expected, { x: x2 + 0.25, y: ey, w: w2 - 0.5, h: BOT - ey - 0.12, fontSize: fit(expected, w2 - 0.5, BOT - ey - 0.12, shot ? 15 : BASE, 11) });
      notes(s, (note ? note + "\n" : "") + (shot ? `${T_.ran}: ${shot}` : ""));
    },
    quiz([question, options, answer, explain]) {
      const s = light(kids ? T_.quizKids : T_.quiz);
      tx(s, question, { x: MX, y: TOP, w: CW, h: 1.3, fontFace: HEAD, fontSize: fit(question, CW, 1.3, 26, 17, false, true), bold: true, color: P.ink, valign: "middle" });
      const n = options.length, g = 0.25, y0 = TOP + 1.55, cols = n > 3 ? 2 : 1, rws = Math.ceil(n / cols);
      const cw = (CW - g * (cols - 1)) / cols, ch = (BOT - y0 - g * (rws - 1)) / rws;
      const of = Math.min(...options.map((o) => fit(o, cw - 1.1, ch - 0.2, BASE, MIN)));
      options.forEach((o, i) => {
        const x = MX + (i % cols) * (cw + g), y = y0 + Math.floor(i / cols) * (ch + g);
        card(s, x, y, cw, ch); badge(s, x + 0.2, y + ch / 2 - 0.24, 0.48, "ABCDEF"[i], P.steel);
        tx(s, o, { x: x + 0.9, y: y + 0.1, w: cw - 1.1, h: ch - 0.2, fontSize: of, valign: "middle" });
      });
      notes(s, `Answer: ${"ABCDEF"[answer]}. ${explain || ""}`);
    },
    image([title, img, caption, note]) {
      const s = light(title), file = path.join(ROOT, img), d = pngSize(file);
      const bw = CW, bh = BOT - TOP - 0.7, r = Math.min(bw / d.w, bh / d.h), w = d.w * r, h = d.h * r;
      s.addImage({ path: file, x: MX + (bw - w) / 2, y: TOP, w, h, altText: caption });
      tx(s, caption, { x: MX, y: TOP + bh + 0.15, w: CW, h: 0.5, fontSize: fit(caption, CW, 0.5, 14, 11), color: P.mute, italic: true, align: "center" });
      notes(s, note);
    },
    flow([title, labels, caption, note]) {
      const s = light(title), n = labels.length, g = 0.5, bw = (CW - g * (n - 1)) / n, bh = 1.9, y = caption ? TOP + 0.5 : TOP + 1.3;
      labels.forEach((lab, i) => {
        const [head, sub] = lab.split("|"), x = MX + i * (bw + g), col = [P.steel, P.teal, P.violet, P.amber, P.green, P.red][i % 6];
        card(s, x, y, bw, bh, col);
        tx(s, head, { x: x + 0.12, y: y + 0.2, w: bw - 0.24, h: sub ? 0.8 : bh - 0.4, fontSize: fit(head, bw - 0.24, sub ? 0.8 : bh - 0.4, 20, 12, false, true), bold: true, color: P.white, align: "center", valign: "middle" });
        if (sub) tx(s, sub, { x: x + 0.12, y: y + 1.0, w: bw - 0.24, h: 0.8, fontSize: fit(sub, bw - 0.24, 0.8, 15, 10.5), color: P.white, align: "center" });
        if (i < n - 1) s.addShape(pres.ShapeType.rightArrow, { x: x + bw + 0.08, y: y + bh / 2 - 0.17, w: g - 0.16, h: 0.34, fill: { color: P.rule }, line: { color: P.rule, width: 0 } });
      });
      if (caption) { const ch = BOT - y - bh - 0.5; card(s, MX, y + bh + 0.5, CW, ch);
        tx(s, caption, { x: MX + 0.35, y: y + bh + 0.65, w: CW - 0.7, h: ch - 0.3, fontSize: fit(caption, CW - 0.7, ch - 0.3, BASE + 3, MIN), valign: "middle" }); }
      notes(s, note);
    },
    blocks([title, blocks, items, note]) {
      const s = light(title), col = { g: P.amber, s: P.violet, i: P.red, d: P.teal, a: P.plum };
      const lw = 6.9, n = blocks.length, bh = Math.min(0.62, (BOT - TOP - 0.3) / n - 0.08), fsz = Math.min(17, bh * 28);
      card(s, MX, TOP, lw, BOT - TOP);
      blocks.forEach(([kind, text, indent], i) => {
        const x = MX + 0.3 + (indent || 0) * 0.45, cw = 0.6 * 0.54 * fsz / 72;
        let f = fsz; while (text.length * 0.54 * f / 72 + 0.4 > lw - 0.6 - (indent || 0) * 0.45 && f > 10) f -= 0.5;
        const w = Math.min(lw - 0.6 - (indent || 0) * 0.45, text.length * 0.54 * f / 72 + 0.5);
        s.addText(text, { isTextBox: true, shape: pres.ShapeType.roundRect, rectRadius: 0.1, x, y: TOP + 0.2 + i * (bh + 0.08), w, h: bh,
          fill: { color: col[kind] }, line: { color: P.white, width: 1 }, color: P.white, bold: true, fontFace: BODY, fontSize: f, align: "left", valign: "middle", margin: 7 });
      });
      rows(s, items, MX + lw + 0.4, TOP, CW - lw - 0.4, BOT - TOP);
      notes(s, note);
    },
    walk([title, src, range, shot, text, note]) {
      const s = light(title); let lines = readListing(src, range);
      const lang = /\.[Ss]$/.test(src) ? "asm" : /\.(sh|ps1)$/.test(src) ? "sh" : "c";
      const cwid = 7.75, ch = BOT - TOP, x2 = MX + cwid + 0.3, w2 = W - MX - x2;
      lines = wrapListing(lines, cwid, ch);
      const longest = Math.max(...lines.map((l) => l.length));
      let fsz = 20;
      while (fsz > 9.5 && (lines.length * fsz * 1.2 / 72 > ch - 0.4 || longest * fsz * 0.635 / 72 > cwid - 0.55)) fsz -= 0.5;
      if (lines.length * fsz * 1.2 / 72 > ch - 0.4 || longest * fsz * 0.635 / 72 > cwid - 0.55)
        throw new Error(`${WHERE}: listing too large (${lines.length} lines, ${longest} cols)`);
      card(s, MX, TOP, cwid, ch, P.code);
      const runs = [];
      lines.forEach((l, i) => {
        const c = commentAt(l, lang), last = i === lines.length - 1, a = c < 0 ? l : l.slice(0, c), b = c < 0 ? "" : l.slice(c);
        if (b) { if (a) runs.push({ text: a, options: { color: P.codeText } }); runs.push({ text: b, options: { color: P.codeComment, breakLine: !last } }); }
        else runs.push({ text: a || " ", options: { color: P.codeText, breakLine: !last } });
      });
      s.addText(runs, { isTextBox: true, x: MX + 0.25, y: TOP + 0.2, w: cwid - 0.5, h: ch - 0.4, fontFace: MONO, fontSize: fsz, margin: 0, valign: "top", paraSpaceAfter: 0 });
      const ih = w2 * 200 / 320;
      s.addShape(pres.ShapeType.rect, { x: x2 - 0.05, y: TOP - 0.05, w: w2 + 0.1, h: ih + 0.1, fill: { color: P.steel }, line: { color: P.steel, width: 0 } });
      s.addImage({ path: path.join(ROOT, shot), x: x2, y: TOP, w: w2, h: ih, altText: text });
      tx(s, T_.ran, { x: x2, y: TOP + ih + 0.1, w: w2, h: 0.28, fontSize: 10.5, italic: true, color: P.mute });
      const cy = TOP + ih + 0.45;
      card(s, x2, cy, w2, BOT - cy);
      tx(s, text, { x: x2 + 0.2, y: cy + 0.12, w: w2 - 0.4, h: BOT - cy - 0.24, fontSize: fit(text, w2 - 0.4, BOT - cy - 0.24, 17, 11), valign: "middle" });
      notes(s, (note ? note + "\n" : "") + `Source: ${src}`);
    },
    layout([title, fields, caption, note, base]) {
      const s = light(title), n = fields.length, capH = caption ? 0.95 : 0, g = 0.07;
      const rh = Math.min(0.62, (BOT - TOP - capH - g * (n - 1)) / n), cols = [P.steel, P.teal, P.violet, P.amber, P.green, P.red];
      let off = base || 0;
      const fz = Math.min(16, rh * 34);
      fields.forEach(([name, size, desc], i) => {
        const y = TOP + i * (rh + g), c = cols[i % 6];
        tx(s, typeof size === "number" ? `+${off}` : "", { x: MX, y, w: 0.9, h: rh, fontFace: MONO, fontSize: fz - 2, color: P.mute, align: "right", valign: "middle" });
        s.addText(name, { isTextBox: true, shape: pres.ShapeType.rect, x: MX + 1.05, y, w: 3.6, h: rh, fill: { color: c }, line: { color: P.white, width: 1 },
          color: P.white, bold: true, fontFace: MONO, fontSize: fit(name, 3.4, rh, fz, 9, true), align: "center", valign: "middle", margin: 0 });
        tx(s, typeof size === "number" ? `${size} ${T_.bytes}` : String(size), { x: MX + 4.8, y, w: 1.25, h: rh, fontSize: fz - 2, color: P.mute, valign: "middle" });
        tx(s, desc, { x: MX + 6.1, y, w: CW - 6.1, h: rh, fontSize: fit(desc, CW - 6.1, rh, fz, 10), valign: "middle" });
        if (typeof size === "number") off += size;
      });
      if (caption) { const y = BOT - capH + 0.12; card(s, MX, y, CW, capH - 0.12);
        tx(s, caption, { x: MX + 0.3, y: y + 0.08, w: CW - 0.6, h: capH - 0.28, fontSize: fit(caption, CW - 0.6, capH - 0.28, 17, 11), valign: "middle" }); }
      notes(s, note);
    },
    encoding([title, fields, caption, note]) {
      const s = light(title), total = fields.reduce((a, [b]) => a + b, 0), y = TOP + 0.75, bh = 1.15, cols = [P.steel, P.teal, P.violet, P.amber, P.green, P.red];
      const minW = 1.05, flex = CW - minW * fields.length; let x = MX, hi = total - 1;
      fields.forEach(([bits, name, value], i) => {
        const w = minW + flex * bits / total, c = cols[i % 6];
        tx(s, bits === 1 ? `${hi}` : `${hi}..${hi - bits + 1}`, { x, y: y - 0.42, w, h: 0.36, fontFace: MONO, fontSize: 12, color: P.mute, align: "center", valign: "bottom" });
        s.addText(name, { isTextBox: true, shape: pres.ShapeType.rect, x, y, w, h: bh, fill: { color: c }, line: { color: P.white, width: 1.5 },
          color: P.white, bold: true, fontFace: BODY, fontSize: fit(name, w - 0.1, bh, 18, 10, false, true), align: "center", valign: "middle", margin: 0 });
        if (value !== undefined) tx(s, String(value), { x, y: y + bh + 0.1, w, h: 0.72, fontFace: MONO, fontSize: fit(String(value), w, 0.72, 14, 9, true), color: P.ink, align: "center" });
        tx(s, `${bits} bit`, { x, y: y + bh + 0.85, w, h: 0.3, fontSize: 11, color: P.mute, align: "center" });
        x += w; hi -= bits;
      });
      const cy = y + bh + 1.4; card(s, MX, cy, CW, BOT - cy);
      tx(s, caption, { x: MX + 0.3, y: cy + 0.12, w: CW - 0.6, h: BOT - cy - 0.24, fontSize: fit(caption, CW - 0.6, BOT - cy - 0.24, 19, 12), valign: "middle" });
      notes(s, note);
    },
    screen([title, shapes, items, note]) {
      const s = light(title), sw = 6.4, sc = sw / 320, sh = 200 * sc, y0 = TOP + (BOT - TOP - sh) / 2;
      s.addShape(pres.ShapeType.rect, { x: MX - 0.08, y: y0 - 0.08, w: sw + 0.16, h: sh + 0.16, fill: { color: P.steel }, line: { color: P.steel, width: 0 } });
      s.addShape(pres.ShapeType.rect, { x: MX, y: y0, w: sw, h: sh, fill: { color: "000000" }, line: { color: "000000", width: 0 } });
      shapes.forEach(([x, y, w, h, c, label]) => {
        if (w > 0) s.addShape(pres.ShapeType.rect, { x: MX + x * sc, y: y0 + y * sc, w: Math.max(0.03, w * sc), h: Math.max(0.03, h * sc), fill: { color: SCREEN[c] || c }, line: { color: SCREEN[c] || c, width: 0 } });
        if (label) tx(s, label, { x: MX + x * sc + (w > 0 ? w * sc + 0.08 : 0), y: y0 + y * sc - (w > 0 ? 0.02 : 0), w: 2.6, h: 0.3, fontSize: 12, fontFace: MONO, color: w > 0 ? "FFFFFF" : SCREEN[c] || c });
      });
      tx(s, "320 x 200 game viewport", { x: MX, y: y0 + sh + 0.12, w: sw, h: 0.3, fontSize: 11, color: P.mute, italic: true });
      rows(s, items, MX + sw + 0.5, TOP, CW - sw - 0.5, BOT - TOP);
      notes(s, note);
    },
  };

  // ---- opening slides ------------------------------------------------------
  WHERE = `ch${deck.n} ${deck.kind} [title]`;
  {
    const s = dark();
    pixels(s, MX, 0.8, 0.26, [ACC, P.amber, null, null, ACC, P.amber, ACC, null, null]);
    tx(s, deck.kicker || `${T_.chapter} ${deck.n}  |  ${deck.kind === "lab" ? T_.lab : T_.lecture}  |  ${deck.duration || 45} ${T_.minutes}`, { x: MX, y: 2.1, w: CW, h: 0.4, fontSize: 15, bold: true, color: P.ice, charSpacing: 3 });
    tx(s, deck.title, { x: MX, y: 2.6, w: CW, h: 1.9, fontFace: HEAD, fontSize: fit(deck.title, CW, 1.9, 44, 30, false, true), bold: true, color: P.white, valign: "middle" });
    tx(s, deck.subtitle, { x: MX, y: 4.65, w: CW, h: 0.9, fontSize: fit(deck.subtitle, CW, 0.9, 22, 15), color: P.ice });
    tx(s, `${T_.audience}: ${deck.audience}`, { x: MX, y: 6.1, w: CW, h: 0.35, fontSize: 14, color: P.ice });
    tx(s, deck.byline || T_.book, { x: MX, y: 6.5, w: CW, h: 0.35, fontSize: 13, italic: true, color: "8FA3B3" });
    s.addNotes(deck.titleNote || `Teaching support for Chapter ${deck.n} of the textbook. ${deck.kind === "lab" ? "Practical, step-by-step session: learners work at their machines; keep each step to its time box." : "Front lecture: about 45 minutes including the questions."} ${deck.prep ? "Preparation: " + deck.prep : ""}`);
  }
  WHERE = `ch${deck.n} ${deck.kind} [goals]`;
  R.checklist([kids ? T_.goalsKids : T_.goals, deck.goals, "State the objectives; return to this slide at the end."]);
  WHERE = `ch${deck.n} ${deck.kind} [agenda]`;
  {
    const s = light(deck.kind === "lab" ? T_.plan : T_.agenda), total = deck.agenda.reduce((a, [, m]) => a + m, 0);
    const cols = [P.steel, P.teal, P.violet, P.amber, P.green, P.red]; let x = MX;
    deck.agenda.forEach(([label, m], i) => {
      const w = CW * m / total;
      s.addShape(pres.ShapeType.rect, { x, y: TOP + 0.3, w: w - 0.05, h: 0.9, fill: { color: cols[i % 6] }, line: { color: cols[i % 6], width: 0 } });
      tx(s, `${m}'`, { x, y: TOP + 0.3, w: w - 0.05, h: 0.9, fontSize: 20, bold: true, color: P.white, align: "center", valign: "middle" });
      x += w;
    });
    const n = deck.agenda.length, cw = (CW - 0.25 * (n - 1)) / n;
    deck.agenda.forEach(([label, m], i) => {
      const cx = MX + i * (cw + 0.25);
      card(s, cx, TOP + 1.7, cw, BOT - TOP - 1.7); badge(s, cx + 0.2, TOP + 1.9, 0.42, i + 1, cols[i % 6]);
      tx(s, label, { x: cx + 0.2, y: TOP + 2.5, w: cw - 0.4, h: BOT - TOP - 2.7, fontSize: fit(label, cw - 0.4, BOT - TOP - 2.7, 18, 12) });
    });
    s.addNotes(`Total: ${total} minutes.`);
  }
  // ---- body ----------------------------------------------------------------
  deck.slides.forEach((sl, i) => { WHERE = `ch${deck.n} ${deck.kind} slide ${i + 4} (${sl.t})`; R[sl.t](sl.a); });
  // ---- closing -------------------------------------------------------------
  section = "Closing"; pres.addSection({ title: section });
  WHERE = `ch${deck.n} ${deck.kind} [closing]`;
  R.versus([kids ? T_.closingKids : T_.closing,
    [kids ? T_.nextKids : T_.next, deck.next],
    [kids ? T_.refsKids : T_.refs, deck.refs]]);

  const dir = deck.outDir ? path.join(ROOT, deck.outDir) : path.join(OUT, `${String(deck.n).padStart(2, "0")}-${deck.slug}`);
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, deck.file || `${String(deck.n).padStart(2, "0")}-${deck.slug}-${deck.kind}.pptx`);
  // pptxgenjs stores parts uncompressed; repack with DEFLATE (about 8x smaller).
  return pres.write({ outputType: "nodebuffer" })
    .then((buf) => JSZip.loadAsync(buf))
    .then((zip) => zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE", compressionOptions: { level: 9 } }))
    .then((buf) => { fs.writeFileSync(file, buf); return { file, count }; });
}

(async () => {
  const only = process.argv[2];
  for (const f of fs.readdirSync(path.join(__dirname, "decks")).sort()) require(path.join(__dirname, "decks", f));
  const ws = path.join(ROOT, "workshops");                      // workshop decks live beside their sources
  if (fs.existsSync(ws)) for (const d of fs.readdirSync(ws).sort()) {
    const spec = path.join(ws, d, "slides.js");
    if (fs.existsSync(spec)) require(spec);
  }
  let failed = 0;
  for (const d of decks) {
    if (only && String(d.n) !== only) continue;
    try { const r = await build(d); console.log(`${String(r.count).padStart(3)} slides  ${path.relative(ROOT, r.file)}`); }
    catch (e) { failed++; console.error("FAILED " + e.message); }
  }
  if (failed) process.exit(1);
})();
