// EST - Napoli Innovation Festival, 22 ottobre 2026.
// "PRG32: videogiochi retro' per imparare il processore europeo RISC-V"
// Tre presentazioni alternative da 90 minuti: assembly, C, Construction Kit.
// Generate con:  cd presentations/tools && node build.js ws
const WS = "workshops/EST-Napoli_Innovation_Festival";
const AUD = "studenti delle scuole e cittadini curiosi; nessuna esperienza richiesta";
const AGENDA = [["L'idea: perché un videogioco, perché RISC-V", 10], ["La piattaforma PRG32", 15], ["Il ciclo init, update, draw", 10], ["Breakout, un passo alla volta", 45], ["Sfide finali e come continuare", 10]];
const NEXT = ["Gioca e modifica: tutti i passi sono nella cartella del laboratorio", "Prova le altre due versioni dello stesso gioco: assembly, C, blocchi",
  "Pubblica il tuo gioco sul Cartridge Store (con un docente come editor)", "Costruisci la tua PRG32: una scheda ESP32-C6, uno schermo, un joystick"];
const REFS = ["PRG32: github.com/riscv-prg32/PRG32", "Cartridge Store: store.prg32.uniparthenope.it", "Construction Kit e PRG32-QT: github.com/riscv-prg32",
  "Libro: Playing with RISC-V (github.com/riscv-prg32/Playing-with-RISC-V_PRG32_textbook)", "Università degli Studi di Napoli \"Parthenope\""];

// ---------------------------------------------------------------- parte comune
function comune(v) {
  const lingua = { asm: "assembly RISC-V", c: "linguaggio C", kit: "blocchi colorati" }[v];
  return [
    B("Oggi costruiamo un videogioco. Dentro c'è un processore progettato per essere di tutti.", "Novanta minuti, un gioco vero, e alla fine saprete cosa succede davvero dentro un computer."),
    H("L'idea", "Perché un videogioco, perché RISC-V"),
    T("Un computer fa solo tre cose", ["Calcola con dei numeri", "Sposta numeri da e verso la memoria", "Decide quale istruzione eseguire dopo", "Tutto il resto, dai social ai videogiochi, è fatto di questi tre mattoni"]),
    C("Perché proprio un videogioco", [["Si vede subito", "Cambi un numero e la racchetta si sposta: causa ed effetto nello stesso istante."], ["È onesto", "Se sbagli, la pallina attraversa il muro. Non serve un voto per saperlo."],
      ["È piccolo", "Un gioco retrò sta tutto nella testa di una persona. E in 3 KiB di memoria."], ["È completo", "Stato, ingresso, calcoli, decisioni, un ciclo: c'è tutta l'informatica di base."]]),
    T("Che cos'è un processore", ["È il componente che esegue le istruzioni, una alla volta", "Ogni famiglia di processori capisce un proprio elenco di istruzioni",
      "Quell'elenco si chiama ISA: Instruction Set Architecture", "È il contratto tra chi scrive il software e chi costruisce l'hardware"]),
    V("Chi possiede le istruzioni?", ["Architetture proprietarie", ["L'elenco delle istruzioni appartiene a un'azienda", "Per costruire un processore serve una licenza", "Le decisioni si prendono altrove", "Hanno dominato PC e telefoni per decenni"]],
      ["RISC-V", ["Uno standard aperto, nato all'università di Berkeley", "Chiunque può progettare un processore, senza pagare l'architettura", "Governato come uno standard condiviso", "Si pronuncia \"risc-five\""]]),
    G("Perché l'Europa ci punta", ["Fatto", "Numero"], [["Mercato mondiale dei semiconduttori", "circa 700 miliardi di dollari"], ["Quota attuale dell'Europa", "circa un decimo"], ["Obiettivo dello European Chips Act", "un quinto entro il 2030"],
      ["Progetto DARE (EuroHPC): processori europei su RISC-V", "circa 240 milioni di euro"]], "Ordini di grandezza citati nel libro (fonti: HiPEAC 2026, EuroHPC JU). La parola chiave è sovranità tecnologica.", [2.4, 1.4]),
    B("Le istruzioni che useremo oggi sono le stesse con cui l'Europa sta costruendo i suoi processori.", "Non è un dialetto per la scuola: addi, lw, sw, beqz sono RISC-V vero."),
    Q("Che cosa rende RISC-V \"aperto\"?", ["I suoi processori sono gratis", "L'elenco delle istruzioni è uno standard che chiunque può usare senza licenza", "Funziona solo con software libero", "È stato inventato in Europa"], 1,
      "L'apertura riguarda la specifica dell'ISA. I singoli chip possono essere aperti o proprietari. RISC-V nasce a Berkeley, in California."),

    H("La piattaforma PRG32", "Una console retrò con dentro un processore RISC-V"),
    C("PRG32 in quattro righe", [["Che cos'è", "Una piattaforma didattica open source: una piccola console per giochi scritti in assembly, in C o con i blocchi."], ["Il processore", "ESP32-C6: RISC-V a 32 bit, 160 MHz, 512 KB di RAM. Costa pochi euro."],
      ["Il codice gira davvero", "Il vostro programma è codice macchina RISC-V eseguito dal processore, non una simulazione."], ["Chi la sviluppa", "Università degli Studi di Napoli \"Parthenope\". Licenza MIT: potete leggerla, copiarla, migliorarla."]]),
    G("Cosa c'è sul tavolo", ["Componente", "Caratteristiche"], [["Scheda ESP32-C6", "Processore RISC-V RV32IMAC, Wi-Fi, USB"], ["Schermo ILI9341", "320 x 240 pixel a colori; il gioco ne usa 320 x 200"], ["Joystick e pulsanti", "Quattro direzioni, A, B, Start/Select"],
      ["Audio", "Amplificatore digitale I2S, 8 voci a 22.050 Hz"], ["Memoria per il gioco", "64 KiB: il nostro Breakout ne usa circa 3,5"]], null, [1.2, 2.6]),
    F("Tre modi per far girare lo stesso gioco", ["Scheda PRG32|il processore vero", "QEMU|la scheda emulata sul PC", "PRG32-QT|app per PC, tablet, telefono, TV"], "La cartuccia è lo stesso file .prg32 in tutti e tre i casi. Oggi usiamo quello che c'è sulla vostra postazione."),
    C("L'ecosistema", [["PRG32", "Il firmware della console e gli strumenti per costruire le cartucce."], ["Cartridge Store", "Un catalogo di giochi, con classifiche e multiplayer. Ogni gioco passa da un editor prima di essere pubblico."],
      ["Construction Kit", "Si programma con i blocchi nel browser; il Kit mostra il C che ne risulta."], ["PRG32-QT", "Fa girare le cartucce ovunque e ha un debugger: si può fermare il processore tra due istruzioni."]]),
    T("La cartuccia: un file piccolissimo", ["Un gioco è un file che finisce in .prg32", "Dentro: un'intestazione di 100 byte e il codice macchina", "Si carica sulla console via Wi-Fi, senza riprogrammarla",
      "La console ha quattro \"slot\" per le cartucce", "La cartuccia chiama la console attraverso una tabella di 139 funzioni"], null, ["~3,5 KiB", "tutto il nostro Breakout"]),
    M("Dentro una cartuccia", [["PRG2", 4, "firma: \"sono una cartuccia PRG32\""], ["versione ABI", 4, "quale tabella di funzioni si aspetta"], ["dimensioni, indirizzo", 16, "dove caricare il codice e quanto è grande"],
      ["init / update / draw", 12, "dove iniziano le tre funzioni del gioco"], ["CRC32", 4, "controllo: il file è arrivato intatto?"], ["nome", 32, "quello che si legge nel menu"], ["hash ABI, funzioni richieste", 28, "la console rifiuta ciò che non può eseguire"],
      ["codice e dati del gioco", "~3,4 KiB", "le istruzioni RISC-V che scriviamo oggi"]], "Intestazione: 100 byte. Prima di eseguire, la console controlla firma, CRC e compatibilità: una cartuccia incompatibile viene rifiutata, non eseguita."),
    Q("Dove \"gira\" il gioco quando usiamo la scheda PRG32?", ["Su un server in Internet", "Sul processore RISC-V della scheda, come codice macchina", "Dentro un programma Python", "Nello schermo"], 1,
      "Esecuzione nativa. In PRG32-QT, invece, un interprete esegue le stesse istruzioni una per una."),

    H("Il ciclo init, update, draw", "Tutti i giochi PRG32 hanno la stessa forma"),
    F("Un gioco è un ciclo", ["init|una volta sola", "leggi i pulsanti|cosa vuole il giocatore", "update|cambia i numeri", "draw|disegna i numeri"], "Dopo init, la console chiama update e draw circa 30 volte al secondo. Ogni giro è un fotogramma. Come un cartone animato: tante immagini, una dopo l'altra."),
    V("Due compiti, mai mescolati", ["update: cambia lo stato", ["Legge i pulsanti", "Sposta racchetta e pallina", "Controlla gli urti, conta i punti", "Non disegna nulla"]],
      ["draw: mostra lo stato", ["Cancella lo schermo", "Disegna ogni oggetto dove dicono i numeri", "Non cambia le regole del gioco", "Non ricorda il fotogramma prima"]]),
    T("Lo stato: i numeri che il gioco ricorda", ["paddle_x: dove si trova la racchetta", "ball_x, ball_y: dove si trova la pallina", "ball_dx, ball_dy: di quanto si sposta a ogni fotogramma",
      "bricks: quali mattoncini ci sono ancora", "score: quanti ne abbiamo distrutti"], "Tutto il gioco è la regola che trasforma lo stato di questo fotogramma in quello del successivo."),
    SC("Lo schermo è una griglia", [[0, 0, 0, 0, "YELLOW", "(0,0)"], [136, 188, 48, 6, "CYAN", ""], [136, 172, 0, 0, "CYAN", "x=136 y=188"], [157, 120, 6, 6, "WHITE", ""], [228, 186, 0, 0, "WHITE", "(319,199)"]],
      ["320 pixel in orizzontale: la x", "200 in verticale: la y", "L'origine è in alto a sinistra", "La y cresce verso il BASSO"], "L'errore più comune: pensare che y cresca verso l'alto come nei grafici di matematica."),
    C("Un colore in 16 bit: RGB565", [["5 bit di rosso", "I bit più a sinistra. Rosso pieno: 0xF800."], ["6 bit di verde", "L'occhio è più sensibile al verde. Verde pieno: 0x07E0."], ["5 bit di blu", "I bit più a destra. Blu pieno: 0x001F."]],
      "Giallo = rosso + verde = 0xFFE0. Bianco = tutti i bit a 1 = 0xFFFF. Ciano = verde + blu = 0x07FF."),
    G("I pulsanti sono bit", ["Pulsante", "Valore", "In binario"], [["SINISTRA", "1", "0000 0001"], ["DESTRA", "2", "0000 0010"], ["SU", "4", "0000 0100"], ["GIÙ", "8", "0000 1000"], ["A", "16", "0001 0000"], ["B", "32", "0010 0000"]],
      "La console restituisce un solo numero con tutti i pulsanti. DESTRA + A premuti insieme danno 2 + 16 = 18. Per sapere se un pulsante è premuto si isola il suo bit con AND."),
    Q("La pallina è a y = 50. Aggiungiamo 10 a y. La pallina...", ["sale", "scende", "va a destra", "resta ferma"], 1, "y cresce verso il basso."),
    T("Come lavoriamo: " + lingua, v === "kit"
      ? ["Apriamo il Construction Kit nel browser", "Per ogni passo: importiamo il progetto, leggiamo i blocchi, premiamo Play", "Poi cambiamo UNA cosa e guardiamo che succede", "Otto passi: dallo schermo nero al gioco completo"]
      : ["Otto file, uno per passo: ogni file è un gioco completo che funziona", "Per ogni passo: leggiamo il codice nuovo, lo compiliamo, lo proviamo", "Poi cambiamo UNA cosa e guardiamo che succede", "Un solo comando: ./prova.sh " + v + " NUMERO"]),
  ];
}

const SFIDE = (v) => [
  H("Sfide finali", "Adesso il gioco è vostro"),
  C("Scegline una", [["Più difficile", "Racchetta più stretta, pallina più veloce. Attenzione: la larghezza compare in più punti."], ["Più colorato", "Cambia i colori usando RGB565: prova 0xF81F e 0xFD20."],
    ["Tre vite", "Una variabile lives: si perde una vita quando la pallina cade. A zero si ricomincia."], ["Più mattoncini", v === "kit" ? "Aggiungi m7_y e m8_y: servono un blocco di disegno e uno di urto per ciascuno." : "Una terza riga: cambia BRICK_COUNT e controlla dove si usa il numero 16."]]),
  T("Che cosa abbiamo imparato", ["Un gioco è stato + regole + disegno, ripetuti a ogni fotogramma", "Lo schermo è una griglia, i colori e i pulsanti sono bit", "Un urto è un confronto tra rettangoli",
    v === "asm" ? "In assembly ogni cosa è: carica, calcola, memorizza, salta" : v === "c" ? "Il C descrive le stesse operazioni in modo leggibile" : "I blocchi sono un programma vero: sotto c'è il C", "Il processore che lo esegue è aperto: RISC-V"]),
  F("Lo stesso gioco, a tre altezze", ["Blocchi|if button LEFT pressed", "C|if (input & PRG32_BTN_LEFT)", "Assembly|andi t3, a0, 1 / beqz", "Codice macchina|32 bit per istruzione"], "Nella cartella del laboratorio ci sono tutte e tre le versioni, passo per passo. Sono lo stesso gioco: provate a confrontarle."),
];

// ---------------------------------------------------------------- assembly
const A = (n, nome) => `${WS}/asm/passo${n}_${nome}.S`;
const AS = (n, nome) => `${WS}/asm/expected/passo${n}_${nome}.png`;
Deck({ n: "ws", lang: "it", kind: "lab", duration: 90, outDir: WS, file: "PRG32_Breakout_assembly.pptx",
  title: "PRG32: videogiochi retrò per imparare il processore europeo RISC-V", subtitle: "Costruiamo Breakout in assembly RISC-V, un passo alla volta",
  kicker: "EST - NAPOLI INNOVATION FESTIVAL  |  22 OTTOBRE 2026  |  LABORATORIO  |  90 MINUTI", byline: "Università degli Studi di Napoli \"Parthenope\" - Prof. Raffaele Montella",
  footer: "PRG32 - Breakout in assembly RISC-V  |  EST Napoli Innovation Festival", audience: AUD,
  titleNote: "Versione ASSEMBLY del laboratorio. Postazioni: repository PRG32 con ESP-IDF attivo, variabile PRG32_HOME impostata, cartella del laboratorio copiata. Ogni passo è un file completo in asm/ e si avvia con ./prova.sh asm N. Le schermate nelle slide sono state ottenute eseguendo davvero ogni passo.",
  goals: ["Spiegare perché RISC-V è un processore \"di tutti\"", "Descrivere un gioco come init, update, draw", "Leggere le istruzioni RISC-V fondamentali", "Muovere, far rimbalzare e far scontrare oggetti", "Modificare un gioco vero e vederne subito l'effetto"],
  agenda: AGENDA,
  slides: comune("asm").concat([
    H("Breakout in assembly", "Otto passi, dallo schermo nero al gioco completo"),
    G("Le parole dell'assembly che ci servono", ["Istruzione", "Che cosa fa"], [["li a0, 5", "mette il numero 5 nel registro a0"], ["la t0, paddle_x", "mette in t0 l'INDIRIZZO della variabile"], ["lw t2, 0(t0)", "carica in t2 il valore che sta a quell'indirizzo"],
      ["addi t2, t2, 4", "t2 = t2 + 4"], ["sw t2, 0(t0)", "memorizza t2 a quell'indirizzo"], ["beqz t3, 1f", "se t3 è zero salta avanti all'etichetta 1"], ["call f / ret", "chiama la funzione f / torna indietro"]], "Trentadue registri: piccoli cassetti velocissimi dentro il processore. Gli argomenti delle funzioni viaggiano in a0, a1, a2..."),
    E("Un'istruzione è un numero a 32 bit", [[12, "immediato", "000000000100"], [5, "rs1", "00111 (t2)"], [3, "funct3", "000"], [5, "rd", "00111 (t2)"], [7, "opcode", "0010011"]],
      "addi t2, t2, 4 nella forma a 32 bit è il numero 0x00438393 (ne esiste anche una forma compressa a 16 bit). L'assemblatore traduce le parole in numeri; il processore legge i campi e sa cosa fare.", "Codifica di tipo I. imm=4, rs1=x7, funct3=000, rd=x7, opcode=0x13."),
    W("Passo 1: lo scheletro", A(1, "scheletro"), ["breakout_draw:", 9], AS(1, "scheletro"), "Tre funzioni. init e update tornano subito; draw cancella lo schermo. Salviamo ra perché facciamo una call."),
    X("Prova il passo 1", ["Apri asm/passo1_scheletro.S e trova le tre etichette", "$ ./prova.sh asm 1", "Cambia BLACK in 0x001F (blu) nella riga .equ e riprova", "Rimetti 0x0000"], 4, "Uno schermo nero; poi blu. Il gioco non fa ancora nulla, ma la console sta già chiamando le nostre tre funzioni.", null, AS(1, "scheletro")),
    W("Passo 2: la racchetta", A(2, "racchetta"), ["# --- racchetta: prg32_gfx_rect", 8], AS(2, "racchetta"), "Cinque argomenti in cinque registri: x, y, larghezza, altezza, colore. La x arriva dalla memoria: è stato."),
    K("Lo stato vive in memoria", A(2, "racchetta"), [".section .data", 2], ["Una parola di 32 bit con un nome", "Valore iniziale: 136", "136 + 48/2 = 160: la racchetta è al centro"]),
    X("Prova il passo 2", ["$ ./prova.sh asm 2", "Cambia il valore iniziale di paddle_x in 0, poi in 272", "Cambia PADDLE_W in 96: che succede con x = 272?"], 4, "Una racchetta ciano in basso. Con x = 272 e larghezza 96 esce dallo schermo: nessuno glielo impedisce, per ora.", null, AS(2, "racchetta")),
    W("Passo 3: i pulsanti", A(3, "input"), ["# --- racchetta: leggi i pulsanti", 15], AS(3, "input"), "Carica, calcola, memorizza. andi isola un bit, beqz salta se è zero. Poi due controlli tengono x tra 0 e 272."),
    X("Prova il passo 3", ["$ ./prova.sh asm 3", "Tieni premuto DESTRA finché la racchetta si ferma", "Cambia PADDLE_SPEED da 4 a 12 e riprova", "Togli le due righe dopo l'etichetta 2: e ora?"], 5, "La racchetta segue i tasti e si ferma al bordo (schermata: DESTRA tenuto per 40 fotogrammi). Senza il controllo esce a sinistra.", null, AS(3, "input")),
    Q("a0 vale 18 (binario 0001 0010). Quali pulsanti sono premuti?", ["SINISTRA e DESTRA", "DESTRA e A", "SU e B", "Solo A"], 1, "18 = 16 + 2: bit 4 (A) e bit 1 (DESTRA)."),
    W("Passo 4: la pallina si muove", A(4, "pallina"), ["# --- pallina: x = x + dx", 14], AS(4, "pallina"), "Posizione più velocità. Ai muri: rimetti la pallina sul bordo e cambia segno alla velocità con neg."),
    K("Passo 4: il soffitto e il fondo", A(4, "pallina"), ["# --- pallina: y = y + dy", 14], ["Il soffitto fa rimbalzare", "Sotto y = 200 la pallina è persa", "reset_ball la rimette al centro"]),
    X("Prova il passo 4", ["$ ./prova.sh asm 4", "Guarda dove rimbalza e dove no", "In reset_ball cambia la velocità: dx = 3, dy = -1", "Prova dx = 0: che traiettoria fa?"], 5, "La pallina rimbalza su tre lati, attraversa la racchetta e ricomincia dal centro.", null, AS(4, "pallina")),
    W("Passo 5: l'urto con la racchetta", A(5, "rimbalzo"), ["# --- la pallina tocca la racchetta", 19], AS(5, "rimbalzo"), "Otto argomenti: il rettangolo della pallina in a0-a3, quello della racchetta in a4-a7. La risposta torna in a0."),
    T("Perché \"solo se sta scendendo\"", ["La pallina può restare sovrapposta alla racchetta per più fotogrammi", "Se invertissimo la velocità ogni volta, tremerebbe sul posto", "blez t1 salta l'inversione se dy è già negativa (sta salendo)", "Un urto, un rimbalzo"]),
    X("Prova il passo 5", ["$ ./prova.sh asm 5", "Tieni viva la pallina per cinque rimbalzi", "Cancella la riga con blez e colpisci la pallina di lato", "Rimetti la riga"], 5, "Ora si gioca: la racchetta rimanda la pallina verso l'alto.", null, AS(5, "rimbalzo")),
    W("Passo 6: sedici mattoncini, un ciclo", A(6, "mattoncini"), ["    # --- mattoncini", 21], AS(6, "mattoncini"), "s0 conta da 0 a 15. Colonna = indice AND 7, riga = indice diviso 8. s0 sopravvive alle call: per questo lo salviamo."),
    T("Un indice, due coordinate", ["16 mattoncini in fila nella memoria: un byte ciascuno", "colonna = indice AND 7: gli ultimi tre bit (0..7)", "riga = indice spostato a destra di 3 bit (0..1)",
      "x = 2 + colonna x 40, y = 24 + riga x 14", "Con potenze di due, dividere è spostare bit"], null, ["13 = 1101", "riga 1, colonna 5"]),
    X("Prova il passo 6", ["$ ./prova.sh asm 6", "Cambia YELLOW con CYAN nel ciclo di disegno", "Cambia BRICK_PITCH_Y in 20", "La pallina li attraversa: perché?"], 4, "Due righe di mattoncini, rossa e gialla. Sono solo disegnati: manca ancora la regola dell'urto.", null, AS(6, "mattoncini")),
    W("Passo 7: colpire i mattoncini", A(7, "punti"), ["# --- la pallina tocca un mattoncino", 22], AS(7, "punti"), "Lo stesso ciclo, ma con prg32_sprite_hitbox: per ogni mattoncino presente, la pallina lo tocca?"),
    K("Passo 7: quando lo colpisce", A(7, "punti"), ["    sb   zero, 0(t0)            # il mattoncino", 16], ["sb scrive un byte: 0 = distrutto", "La pallina inverte dy", "score cresce di 1", "Una nota: cinque argomenti", "j esce dal ciclo"]),
    X("Prova il passo 7", ["$ ./prova.sh asm 7", "Distruggi quattro mattoncini e guarda la barra verde", "Cambia la nota 76 in 84: più acuta o più grave?", "Cambia slli a2, t1, 3 in slli a2, t1, 4"], 5, "I mattoncini spariscono, la barra verde cresce di 8 pixel per punto, ogni urto suona.", null, AS(7, "punti")),
    W("Passo 8: vittoria", A(8, "vittoria"), ["# --- vittoria", 7], AS(8, "vittoria"), "Se score è arrivato a 16 richiamiamo init: mattoncini, pallina e punteggio tornano come all'inizio."),
    X("Prova il passo 8", ["$ ./prova.sh asm 8", "Per vincere in fretta: nel blocco vittoria cambia li t2, BRICK_COUNT in li t2, 3", "Distruggi tre mattoncini: il muro ricompare", "Rimetti BRICK_COUNT e gioca una partita vera"], 5, "Il gioco completo: 307 righe di assembly, circa 3,5 KiB di cartuccia.", null, AS(8, "vittoria")),
  ]).concat(SFIDE("asm")),
  next: NEXT, refs: REFS });

// ---------------------------------------------------------------- C
const Cf = (n, nome) => `${WS}/c/passo${n}_${nome}.c`;
const CS = (n, nome) => `${WS}/c/expected/passo${n}_${nome}.png`;
Deck({ n: "ws", lang: "it", kind: "lab", duration: 90, outDir: WS, file: "PRG32_Breakout_C.pptx",
  title: "PRG32: videogiochi retrò per imparare il processore europeo RISC-V", subtitle: "Costruiamo Breakout in linguaggio C, un passo alla volta",
  kicker: "EST - NAPOLI INNOVATION FESTIVAL  |  22 OTTOBRE 2026  |  LABORATORIO  |  90 MINUTI", byline: "Università degli Studi di Napoli \"Parthenope\" - Prof. Raffaele Montella",
  footer: "PRG32 - Breakout in C  |  EST Napoli Innovation Festival", audience: AUD,
  titleNote: "Versione C del laboratorio. Postazioni: repository PRG32 con ESP-IDF attivo, variabile PRG32_HOME impostata, cartella del laboratorio copiata. Ogni passo è un file completo in c/ e si avvia con ./prova.sh c N. Le schermate nelle slide sono state ottenute eseguendo davvero ogni passo.",
  goals: ["Spiegare perché RISC-V è un processore \"di tutti\"", "Descrivere un gioco come init, update, draw", "Leggere variabili, if, for e funzioni in C", "Muovere, far rimbalzare e far scontrare oggetti", "Modificare un gioco vero e vederne subito l'effetto"],
  agenda: AGENDA,
  slides: comune("c").concat([
    H("Breakout in C", "Otto passi, dallo schermo nero al gioco completo"),
    G("Le parole del C che ci servono", ["In C", "Che cosa significa"], [["static int paddle_x = 136;", "una variabile intera che vive per tutta la partita"], ["paddle_x += 4;", "aggiungi 4 a paddle_x"], ["if (condizione) { ... }", "esegui il blocco solo se la condizione è vera"],
      ["input & PRG32_BTN_LEFT", "AND bit a bit: isola il bit del pulsante"], ["for (int i = 0; i < 16; i++)", "ripeti 16 volte, con i da 0 a 15"], ["bricks[i]", "l'elemento numero i di un array"], ["#define PADDLE_W 48", "un nome per un numero"]],
      "Il compilatore traduce ogni riga in poche istruzioni RISC-V. La versione assembly dello stesso gioco è nella cartella asm/."),
    V("Che cosa fa il compilatore", ["Voi scrivete", ["paddle_x -= 4;", "if (input & PRG32_BTN_LEFT)", "prg32_gfx_rect(x, y, w, h, c);"]], ["Il processore esegue", ["lw, addi -4, sw: carica, calcola, memorizza", "andi + beqz: isola il bit, salta se è zero", "cinque registri a0..a4, poi call"]],
      "Il C non nasconde la macchina: la descrive in modo più comodo."),
    W("Passo 1: lo scheletro", Cf(1, "scheletro"), ["/* init: chiamata UNA volta", 12], CS(1, "scheletro"), "Tre funzioni con il prefisso breakout_c. init e update sono vuote; draw cancella lo schermo."),
    X("Prova il passo 1", ["Apri c/passo1_scheletro.c e trova le tre funzioni", "$ ./prova.sh c 1", "Cambia PRG32_COLOR_BLACK in PRG32_COLOR_BLUE e riprova", "Rimetti il nero"], 4, "Uno schermo nero; poi blu. Il gioco non fa ancora nulla, ma la console sta già chiamando le nostre tre funzioni.", null, CS(1, "scheletro")),
    W("Passo 2: la racchetta", Cf(2, "racchetta"), ["/* --- Racchetta", 9], CS(2, "racchetta"), "Tre costanti con un nome e una variabile di stato. static: resta in vita tra un fotogramma e l'altro."),
    K("Passo 2: disegnarla", Cf(2, "racchetta"), ["/* draw: chiamata a OGNI", 7], ["Prima si cancella", "Poi un rettangolo: x, y, larghezza, altezza, colore", "La x è la variabile di stato"]),
    X("Prova il passo 2", ["$ ./prova.sh c 2", "Cambia il valore iniziale di paddle_x in 0, poi in 272", "Cambia PADDLE_W in 96: che succede con x = 272?"], 4, "Una racchetta ciano in basso. Con x = 272 e larghezza 96 esce dallo schermo: nessuno glielo impedisce, per ora.", null, CS(2, "racchetta")),
    W("Passo 3: i pulsanti", Cf(3, "input"), ["/* racchetta: leggi i pulsanti", 15], CS(3, "input"), "Una chiamata legge tutti i pulsanti. & isola un bit. Due if tengono la racchetta tra 0 e 320 - 48."),
    X("Prova il passo 3", ["$ ./prova.sh c 3", "Tieni premuto DESTRA finché la racchetta si ferma", "Cambia PADDLE_SPEED da 4 a 12 e riprova", "Cancella l'if con paddle_x < 0: e ora?"], 5, "La racchetta segue i tasti e si ferma al bordo (schermata: DESTRA tenuto per 40 fotogrammi). Senza il controllo esce a sinistra.", null, CS(3, "input")),
    Q("input vale 18 (binario 0001 0010). Quanto vale input & PRG32_BTN_A (cioè & 16)?", ["0", "2", "16", "18"], 2, "Resta solo il bit di A: 16, diverso da zero, quindi \"vero\"."),
    W("Passo 4: la pallina si muove", Cf(4, "pallina"), ["/* pallina: posizione = posizione", 19], CS(4, "pallina"), "Posizione più velocità. A ogni muro: rimetti la pallina sul bordo e cambia segno alla velocità."),
    X("Prova il passo 4", ["$ ./prova.sh c 4", "Guarda dove rimbalza e dove no", "In reset_ball cambia la velocità: ball_dx = 3, ball_dy = -1", "Prova ball_dx = 0: che traiettoria fa?"], 5, "La pallina rimbalza su tre lati, attraversa la racchetta e ricomincia dal centro.", null, CS(4, "pallina")),
    W("Passo 5: l'urto con la racchetta", Cf(5, "rimbalzo"), ["/* la pallina tocca la racchetta", 7], CS(5, "rimbalzo"), "prg32_sprite_hitbox dice se due rettangoli si toccano. && : entrambe le condizioni devono essere vere."),
    T("Perché \"solo se sta scendendo\"", ["La pallina può restare sovrapposta alla racchetta per più fotogrammi", "Se invertissimo la velocità ogni volta, tremerebbe sul posto", "ball_dy > 0 significa: sta scendendo", "Un urto, un rimbalzo"]),
    X("Prova il passo 5", ["$ ./prova.sh c 5", "Tieni viva la pallina per cinque rimbalzi", "Cancella \"ball_dy > 0 &&\" e colpisci la pallina di lato", "Rimetti la condizione"], 5, "Ora si gioca: la racchetta rimanda la pallina verso l'alto.", null, CS(5, "rimbalzo")),
    W("Passo 6: sedici mattoncini, un array", Cf(6, "mattoncini"), ["/* Dove si trova il mattoncino", 3], CS(6, "mattoncini"), "Due piccole funzioni trasformano l'indice in coordinate: % è il resto della divisione, / la divisione intera."),
    K("Passo 6: disegnarli con un ciclo", Cf(6, "mattoncini"), ["prg32_gfx_clear(PRG32_COLOR_BLACK); /* prima", 8],
      ["Solo i mattoncini presenti", "La prima riga è rossa, la seconda gialla", "Le coordinate vengono da brick_x e brick_y"]),
    T("Un indice, due coordinate", ["16 mattoncini in un array: bricks[0] ... bricks[15]", "colonna = i % 8: il resto della divisione per 8", "riga = i / 8: la divisione intera",
      "x = 2 + colonna x 40, y = 24 + riga x 14", "Il mattoncino 13 è in riga 1, colonna 5"], null, ["13 / 8 = 1", "13 % 8 = 5"]),
    X("Prova il passo 6", ["$ ./prova.sh c 6", "Cambia PRG32_COLOR_YELLOW con PRG32_COLOR_CYAN", "Cambia BRICK_PITCH_Y in 20", "La pallina li attraversa: perché?"], 4, "Due righe di mattoncini, rossa e gialla. Sono solo disegnati: manca ancora la regola dell'urto.", null, CS(6, "mattoncini")),
    W("Passo 7: colpire i mattoncini", Cf(7, "punti"), ["/* la pallina tocca un mattoncino", 13], CS(7, "punti"), "Lo stesso ciclo con l'urto: il mattoncino sparisce, la pallina torna indietro, un punto, una nota. break esce dal ciclo."),
    X("Prova il passo 7", ["$ ./prova.sh c 7", "Distruggi quattro mattoncini e guarda la barra verde", "Cambia la nota 76 in 84: più acuta o più grave?", "Cambia score * 8 in score * 16"], 5, "I mattoncini spariscono, la barra verde cresce di 8 pixel per punto, ogni urto suona.", null, CS(7, "punti")),
    W("Passo 8: vittoria", Cf(8, "vittoria"), ["/* vittoria", 4], CS(8, "vittoria"), "Quando score arriva a 16 richiamiamo init: mattoncini, pallina e punteggio tornano come all'inizio."),
    X("Prova il passo 8", ["$ ./prova.sh c 8", "Per vincere in fretta cambia la condizione in score >= 3", "Rimetti BRICK_COUNT e gioca una partita vera", "Quante righe ha il file? E la versione assembly?"], 5, "Il gioco completo: 137 righe di C contro 307 di assembly, e una cartuccia di circa 3,3 KiB.", null, CS(8, "vittoria")),
  ]).concat(SFIDE("c")),
  next: NEXT, refs: REFS });

// ---------------------------------------------------------------- Construction Kit
const KS = (n) => `${WS}/kit/expected/passo${n}.png`;
const KC = (n) => `${WS}/kit/passo${n}.c`;
const TOCCA = (rett) => `if rect ball_x ball_y 6 6 touches rect ${rett}`;
Deck({ n: "ws", lang: "it", kind: "lab", kids: true, duration: 90, outDir: WS, file: "PRG32_Breakout_Construction_Kit.pptx",
  title: "PRG32: videogiochi retrò per imparare il processore europeo RISC-V", subtitle: "Costruiamo Breakout con i blocchi del Construction Kit, un passo alla volta",
  kicker: "EST - NAPOLI INNOVATION FESTIVAL  |  22 OTTOBRE 2026  |  LABORATORIO  |  90 MINUTI", byline: "Università degli Studi di Napoli \"Parthenope\" - Prof. Raffaele Montella",
  footer: "PRG32 - Breakout con il Construction Kit  |  EST Napoli Innovation Festival", audience: AUD,
  titleNote: "Versione CONSTRUCTION KIT del laboratorio: serve solo un browser. Il Kit deve essere avviato su un computer raggiungibile dalle postazioni (python app.py, porta 5090). I progetti di ogni passo sono in kit/passoN.blocks.json e si caricano con Import JSON. Le schermate nelle slide sono state ottenute compilando ed eseguendo il C che il Kit genera per ogni passo.",
  goals: ["Spiegare perché RISC-V è un processore \"di tutti\"", "Descrivere un gioco come init, update, draw", "Costruire un gioco con i blocchi", "Muovere, far rimbalzare e far scontrare oggetti", "Scoprire il programma vero che sta sotto i blocchi"],
  agenda: AGENDA,
  slides: comune("kit").concat([
    H("Breakout con i blocchi", "Otto passi, dallo schermo nero al gioco completo"),
    I("Il Construction Kit", "figures/construction-kit-editor.png", "A sinistra i blocchi, a destra lo schermo del gioco con il joypad; sotto, il C generato"),
    L("I tre blocchi grandi sono init, update, draw", [["g", "when game starts"], ["g", "every frame update"], ["g", "every frame draw"]], ["when game starts: una volta sola (init)", "every frame update: cambia i numeri", "every frame draw: disegna", "I blocchi del Kit sono in inglese: li leggiamo insieme"]),
    G("I blocchi che useremo", ["Blocco", "Che cosa fa"], [["set X to N", "mette il numero N nella variabile X"], ["change X by N", "aggiunge N a X (anche negativo)"], ["keep X between A and B", "tiene X dentro un recinto"],
      ["if button ... pressed", "esegue i blocchi dentro solo se il pulsante è premuto"], ["if rect ... touches rect ...", "esegue i blocchi dentro se due rettangoli si toccano"], ["draw rectangle ...", "disegna un rettangolo"], ["play beep ...", "suona una nota"]], null, [1.3, 2]),
    X("Passo 1: apri il Kit e importa", ["Apri nel browser l'indirizzo scritto alla lavagna", "Clicca Import JSON e scegli kit/passo1.blocks.json", "Apri il progetto Breakout e premi Play", "Cambia BLACK in BLUE nel blocco clear screen"], 4, "Uno schermo nero, poi blu. I tre blocchi gialli sono quasi vuoti: è lo scheletro del gioco.", null, KS(1)),
    L("Passo 2: la racchetta", [["g", "when game starts"], ["s", "set paddle_x to 136", 1], ["g", "every frame draw"], ["d", "clear screen BLACK", 1], ["d", "draw rectangle x paddle_x y 188 w 48 h 6 color CYAN", 1]],
      ["Una variabile: paddle_x", "È la x della racchetta", "y, larghezza e altezza sono fisse", "Prima si cancella, poi si disegna"]),
    X("Prova il passo 2", ["Costruisci i blocchi della slide (o importa kit/passo2.blocks.json)", "Premi Play", "Cambia paddle_x in 0, poi in 272", "Cambia w in 96: che succede con x = 272?"], 5, "Una racchetta ciano in basso. Con x = 272 e larghezza 96 esce dallo schermo.", null, KS(2)),
    L("Passo 3: i pulsanti", [["g", "every frame update"], ["i", "if button LEFT pressed", 1], ["s", "change paddle_x by -4", 2], ["i", "if button RIGHT pressed", 1], ["s", "change paddle_x by 4", 2], ["s", "keep paddle_x between 0 and 272", 1]],
      ["Due domande a ogni fotogramma", "Sinistra: x diminuisce", "Destra: x aumenta", "Il recinto: 320 - 48 = 272"]),
    X("Prova il passo 3", ["Aggiungi i blocchi (o importa kit/passo3.blocks.json)", "Premi Play e usa le frecce", "Metti in pausa, tieni DESTRA sul joypad e premi Step più volte: leggi paddle_x", "Togli il blocco keep: e ora?"], 5, "La racchetta segue le frecce e si ferma ai bordi. Con Step: 136, 140, 144...", null, KS(3)),
    Q("paddle_x vale 100. Eseguiamo due volte \"change paddle_x by -4\". Ora vale...", ["108", "96", "92", "100"], 2, "100, 96, 92."),
    L("Passo 4: la pallina si muove", [["s", "change ball_x by ball_dx"], ["s", "change ball_y by ball_dy"], ["i", TOCCA("-10 0 10 200")], ["s", "set ball_dx to 2", 1], ["i", TOCCA("320 0 10 200")], ["s", "set ball_dx to -2", 1], ["i", TOCCA("0 -10 320 10")], ["s", "set ball_dy to 2", 1]],
      ["Posizione più velocità", "I muri sono rettangoli appena FUORI dallo schermo", "Muro sinistro: vai a destra", "Muro destro: vai a sinistra", "Soffitto: scendi"]),
    SC("Il trucco dei muri invisibili", [[157, 120, 6, 6, "WHITE", "pallina"], [0, 0, 3, 200, "RED", ""], [317, 0, 3, 200, "RED", ""], [0, 0, 320, 3, "RED", ""], [0, 197, 320, 3, "BLUE", ""]],
      ["Il Kit non ha un blocco \"se x è minore di 0\"", "Ma sa dire se due rettangoli si toccano", "Mettiamo un rettangolo oltre ogni bordo", "Toccare il fondo: pallina persa"], "Nel disegno i muri sono mostrati dentro lo schermo per farli vedere: in realtà stanno a x = -10, x = 320, y = -10 e y = 200."),
    X("Prova il passo 4", ["Importa kit/passo4.blocks.json e leggi i blocchi di update", "Premi Play: dove rimbalza e dove no?", "In when game starts cambia ball_dx in 3", "Trova il blocco del fondo: che cosa fa?"], 5, "La pallina rimbalza su tre lati, attraversa la racchetta e ricomincia dal centro.", null, KS(4)),
    L("Passo 5: l'urto con la racchetta", [["i", TOCCA("paddle_x 188 48 6")], ["s", "set ball_dy to -2", 1]], ["Primi quattro numeri: la pallina", "Gli altri quattro: la racchetta", "Devono essere gli stessi del blocco di disegno", "set, non change: su, e basta"]),
    X("Prova il passo 5", ["Aggiungi il blocco (o importa kit/passo5.blocks.json)", "Premi Play e tieni viva la pallina", "Cambia il 48 in 20 solo in questo blocco: che succede?", "Rimetti 48"], 5, "Ora si gioca. Con 20 la pallina attraversa mezza racchetta: il computer guarda i numeri, non il disegno.", null, KS(5)),
    L("Passo 6: sei mattoncini", [["s", "set m1_y to 30"], ["s", "set m2_y to 30"], ["d", "draw rectangle x 3 y m1_y w 48 h 10 color RED"], ["d", "draw rectangle x 56 y m2_y w 48 h 10 color YELLOW"], ["d", "draw rectangle x 109 y m3_y w 48 h 10 color RED"]],
      ["Una variabile per mattoncino: la sua y", "m1_y ... m6_y, tutte a 30", "x: 3, 56, 109, 162, 215, 268", "Un mattoncino ogni 53 pixel"]),
    X("Prova il passo 6", ["Importa kit/passo6.blocks.json", "Conta i blocchi set e i blocchi draw dei mattoncini", "Premi Play", "Cambia m3_y in 60 in when game starts"], 4, "Sei mattoncini rossi e gialli. La pallina li attraversa: manca la regola dell'urto.", null, KS(6)),
    L("Passo 7: colpire un mattoncino", [["i", TOCCA("3 m1_y 48 10")], ["s", "set m1_y to 400", 1], ["s", "set ball_dy to 2", 1], ["s", "change score by 1", 1], ["a", "play beep freq 660 ms 40", 1], ["d", "draw rectangle x 2 y 6 w score * 8 h 6 color GREEN"]],
      ["y = 400 è fuori dallo schermo: sparito!", "La pallina torna giù", "Un punto e un suono", "Sei blocchi così: uno per mattoncino", "La barra verde: score per 8"]),
    X("Prova il passo 7", ["Importa kit/passo7.blocks.json", "Premi Play e distruggi tre mattoncini", "Con Step guarda m1_y diventare 400 e score crescere", "Cambia 660 in 1320: più acuto o più grave?"], 6, "I mattoncini colpiti spariscono, la barra verde cresce, ogni urto suona.", null, KS(7)),
    L("Passo 8: vittoria", [["i", "if rect score 0 1 1 touches rect 6 0 1 1"], ["s", "set m1_y to 30", 1], ["s", "set m2_y to 30", 1], ["s", "... fino a m6_y", 1], ["s", "set score to 0", 1]],
      ["Un altro trucco con i rettangoli", "Un quadratino in x = score, uno in x = 6", "Si toccano solo quando score vale 6", "Allora: tutto come all'inizio"]),
    X("Prova il passo 8", ["Importa kit/passo8.blocks.json", "Gioca fino a distruggere tutti e sei i mattoncini", "Per vincere in fretta cambia il 6 in 2"], 5, "Distrutti tutti i mattoncini, il muro ricompare e il punteggio torna a zero.", null, KS(8)),
    H("Sotto i blocchi", "Il programma vero"),
    W("Generate C: i vostri blocchi, in C", KC(8), ["void breakout_update(void) {", 18], KS(8), "Ogni blocco è diventato una riga. if button: un AND su un bit. keep: due if. È lo stesso C che scrivono all'università."),
    G("Blocco per blocco", ["Il vostro blocco", "In C"], [["set paddle_x to 136", "paddle_x = 136;"], ["change paddle_x by -4", "paddle_x += -4;"], ["if button LEFT pressed", "if (input & PRG32_BTN_LEFT) { ... }"], ["if rect ... touches rect ...", "if (prg32_sprite_hitbox(...)) { ... }"], ["clear screen BLACK", "prg32_gfx_clear(PRG32_COLOR_BLACK);"]], null, [1.3, 2]),
    X("Dal browser alla console", ["Clicca Generate C e trova la riga nata dal blocco keep", "Clicca Compile Cartridge", "Se compaiono i pulsanti verdi: scarica la cartuccia .prg32", "Aprila in PRG32-QT o caricala sulla scheda PRG32"], 6, "Lo stesso gioco, ora come cartuccia di circa 3,9 KiB, eseguito da un processore RISC-V.", "Compile Cartridge produce file .prg32 solo se sul computer che ospita il Kit è installata la toolchain PRG32; altrimenti produce un pacchetto con il solo sorgente. Le cartucce già compilate sono in cartucce/.", KS(8)),
  ]).concat(SFIDE("kit")),
  next: NEXT, refs: REFS });
