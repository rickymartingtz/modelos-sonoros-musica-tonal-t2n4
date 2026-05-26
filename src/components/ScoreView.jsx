// Componente de partitura con VexFlow 4.x
// Recibe un array de MIDIs (escala/arpegio/fórmula) y los renderiza
// en clave de sol como redondas o blancas, con accidentales auto-resueltas.

import { useEffect, useRef } from "react";
import { Renderer, Stave, StaveNote, Formatter, Accidental, Voice } from "vexflow";
import { NOTE_NAMES_SHARP, NOTE_NAMES_FLAT, preferFlatsFor, midiToName } from "../theory/utils";

function midiToVexNote(midi, preferFlats) {
  const names = preferFlats ? NOTE_NAMES_FLAT : NOTE_NAMES_SHARP;
  const octave = Math.floor(midi / 12) - 1;
  const raw = names[midi % 12];
  const letter = raw[0].toLowerCase();
  const acc = raw[1] || "";
  return { key: `${letter}${acc}/${octave}`, accidental: acc };
}

export default function ScoreView({ midis, tonicName = "C", duration = "q", className = "" }) {
  const ref = useRef(null);

  useEffect(() => {
    const host = ref.current;
    if (!host) return;
    host.innerHTML = "";
    if (!midis || midis.length === 0) return;

    const flats = preferFlatsFor(tonicName);

    // Ancho estimado por nota
    const w = Math.max(220, midis.length * 38 + 70);
    const h = 110;

    const renderer = new Renderer(host, Renderer.Backends.SVG);
    renderer.resize(w, h);
    const ctx = renderer.getContext();
    ctx.setFont("DM Sans", 10);

    const stave = new Stave(8, 16, w - 16);
    stave.addClef("treble");
    stave.setContext(ctx).draw();

    const notes = midis.map((m) => {
      const { key, accidental } = midiToVexNote(m, flats);
      const note = new StaveNote({ keys: [key], duration });
      if (accidental) note.addModifier(new Accidental(accidental));
      return note;
    });

    const voice = new Voice({ num_beats: notes.length, beat_value: 4 });
    voice.setStrict(false);
    voice.addTickables(notes);
    new Formatter().joinVoices([voice]).format([voice], w - 80);
    voice.draw(ctx, stave);
  }, [midis, tonicName, duration]);

  return <div ref={ref} className={`score-host ${className}`} />;
}

// Render de un acorde armónico (todas las notas en una columna).
export function ScoreChord({ midis, tonicName = "C", className = "" }) {
  const ref = useRef(null);

  useEffect(() => {
    const host = ref.current;
    if (!host) return;
    host.innerHTML = "";
    if (!midis || midis.length === 0) return;

    const flats = preferFlatsFor(tonicName);
    const sorted = [...midis].sort((a, b) => a - b);

    const w = 120;
    const h = 110;
    const renderer = new Renderer(host, Renderer.Backends.SVG);
    renderer.resize(w, h);
    const ctx = renderer.getContext();
    ctx.setFont("DM Sans", 10);

    const stave = new Stave(6, 16, w - 12);
    stave.addClef("treble");
    stave.setContext(ctx).draw();

    const keys = sorted.map((m) => midiToVexNote(m, flats).key);
    const accs = sorted.map((m) => midiToVexNote(m, flats).accidental);
    const note = new StaveNote({ keys, duration: "w" });
    accs.forEach((a, i) => {
      if (a) note.addModifier(new Accidental(a), i);
    });

    const voice = new Voice({ num_beats: 1, beat_value: 1 });
    voice.setStrict(false);
    voice.addTickables([note]);
    new Formatter().joinVoices([voice]).format([voice], w - 50);
    voice.draw(ctx, stave);
  }, [midis, tonicName]);

  return <div ref={ref} className={`score-host ${className}`} />;
}
