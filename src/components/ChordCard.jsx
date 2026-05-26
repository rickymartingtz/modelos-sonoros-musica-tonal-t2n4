// ChordCard: tarjeta que sirve tanto para Arpegios como para Fórmulas a la fundamental.
// Recibe un objeto de acorde (de chords.js) y un MIDI raíz (la fundamental absoluta).
//
// pillarMode: "arpeggio" | "approach"
//   - "arpeggio": muestra el arpegio con sus inversiones, y un botón separado para el acorde armónico.
//   - "approach": muestra las fórmulas de conducción (una por nota del acorde), con la opción
//     de tocarlas solas, con el acorde armónico, o el acorde primero seguido de la fórmula.

import { useState, useMemo } from "react";
import {
  applyIntervals,
  midiToName,
  clampToSinging,
} from "../theory/utils";
import ScoreView, { ScoreChord } from "./ScoreView";
import { PlayButton, FamilyChip, SectionLabel, TranspositionControls } from "./UI";
import TheoryPanel from "./TheoryPanel";
import { CHORD_FAMILIES } from "../theory/chords";
import {
  playMelodic,
  playHarmonic,
  playHarmonyThenMelody,
  playNote,
  stopAll,
} from "../audio/AudioEngine";

const DURATION_TO_SEC = { w: 2.0, h: 1.2, q: 0.6, e: 0.35 };

function applyDurations(midis, durations) {
  return midis.map((midi, i) => ({
    midi,
    duration: DURATION_TO_SEC[durations?.[i] ?? "q"] ?? 0.6,
  }));
}

export default function ChordCard({ chord, rootMidi, onRootChange, pillarMode = "arpeggio" }) {
  const family = CHORD_FAMILIES[chord.family];
  const tonicName = midiToName(rootMidi).replace(/-?\d+$/, "");

  // Estado: inversión activa (para arpegios) y fórmula activa (para approach)
  const [inversionIdx, setInversionIdx] = useState(0);
  const [formulaIdx, setFormulaIdx] = useState(0);
  const [direction, setDirection] = useState("asc"); // asc | desc | both

  const inversion = chord.arpeggioInversions[inversionIdx];
  const formula = chord.approachFormulas[formulaIdx];

  // Notas del acorde armónico
  const chordMidis = useMemo(
    () => applyIntervals(rootMidi, chord.intervals),
    [chord, rootMidi]
  );

  // Notas del arpegio según inversión y dirección
  const arpeggioMidis = useMemo(() => {
    if (!inversion) return [];
    // Inversión: las notas se computan respecto a la nota más grave del arpegio,
    // que es la fundamental desplazada según la inversión.
    // Sin embargo, la convención más simple: los intervalos están ya relativos a la fundamental
    // del acorde, asumiendo posición fundamental + octava.
    // Para inversiones, los intervalos se computan según el array de la inversión.
    const base = rootMidi;
    let seq = inversion.intervals.map((i) => base + i);
    if (direction === "desc") seq = [...seq].reverse();
    if (direction === "both") seq = [...seq, ...[...seq].slice(0, -1).reverse()];
    return seq;
  }, [inversion, rootMidi, direction]);

  // Notas de la fórmula de conducción (para approach)
  const approachMidis = useMemo(() => {
    if (!formula) return [];
    return applyIntervals(rootMidi, formula.intervals);
  }, [formula, rootMidi]);

  // Botones de reproducción
  const playArpeggio = () => {
    const notes = applyDurations(arpeggioMidis, []);
    playMelodic(notes);
  };
  const playChord = () => playHarmonic(chordMidis);
  const playFormula = () => {
    const notes = applyDurations(approachMidis, formula.duration);
    playMelodic(notes);
  };
  const playFormulaWithChord = () => {
    const notes = applyDurations(approachMidis, formula.duration);
    playHarmonyThenMelody(chordMidis, notes);
  };
  const playFirstNote = () => {
    const first = pillarMode === "approach" ? approachMidis[0] : arpeggioMidis[0];
    if (first != null) playNote(clampToSinging(first), 3.0);
  };

  // Transposición
  const transpose = (n) => onRootChange(rootMidi + n);

  // Notas a mostrar en partitura
  const displayMidis = pillarMode === "approach" ? approachMidis : arpeggioMidis;

  return (
    <div className="rounded-3xl border border-ink-200 bg-white p-5 transition hover:border-ink-300">
      {/* Encabezado */}
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <FamilyChip color={family?.color}>{family?.label}</FamilyChip>
          <h3 className="mt-2 font-display text-2xl font-medium text-ink-950">
            {chord.name}
            <span className="ml-2 font-mono text-base text-ink-500">{chord.symbol}</span>
          </h3>
          <p className="mt-0.5 text-xs text-ink-600">
            En {tonicName} · Nivel {chord.level}
          </p>
        </div>
        <TranspositionControls
          onUp={() => transpose(1)}
          onDown={() => transpose(-1)}
          onOctaveUp={() => transpose(12)}
          onOctaveDown={() => transpose(-12)}
          onReset={() => onRootChange(60)}
        />
      </div>

      {/* Partitura */}
      <div className="rounded-2xl border border-ink-100 bg-ink-50/40 p-2">
        {pillarMode === "approach" ? (
          <div className="flex flex-col items-center gap-2 sm:flex-row sm:justify-center">
            <ScoreView midis={displayMidis} tonicName={tonicName} duration="q" />
            <div className="hidden h-20 w-px bg-ink-200 sm:block" />
            <ScoreChord midis={chordMidis} tonicName={tonicName} />
          </div>
        ) : (
          <ScoreView midis={displayMidis} tonicName={tonicName} duration="q" />
        )}
      </div>

      {/* Controles según modo */}
      {pillarMode === "arpeggio" ? (
        <ArpeggioControls
          chord={chord}
          inversionIdx={inversionIdx}
          setInversionIdx={setInversionIdx}
          direction={direction}
          setDirection={setDirection}
          onPlayArpeggio={playArpeggio}
          onPlayChord={playChord}
          onPlayFirst={playFirstNote}
          onStop={stopAll}
        />
      ) : (
        <ApproachControls
          chord={chord}
          formulaIdx={formulaIdx}
          setFormulaIdx={setFormulaIdx}
          onPlayFormula={playFormula}
          onPlayChord={playChord}
          onPlayBoth={playFormulaWithChord}
          onPlayFirst={playFirstNote}
          onStop={stopAll}
        />
      )}

      {/* Panel teórico */}
      <TheoryPanel
        formula={chord.theory.construction}
        construction={chord.theory.function}
        origin={chord.theory.origin}
        works={chord.theory.examples}
        relations={chord.theory.relations}
      />
    </div>
  );
}

function ArpeggioControls({
  chord,
  inversionIdx,
  setInversionIdx,
  direction,
  setDirection,
  onPlayArpeggio,
  onPlayChord,
  onPlayFirst,
  onStop,
}) {
  return (
    <div className="mt-4 space-y-3">
      <div>
        <SectionLabel>Acción</SectionLabel>
        <div className="flex flex-wrap gap-1.5">
          <PlayButton primary onClick={onPlayArpeggio}>
            ▶ Arpegio melódico
          </PlayButton>
          <PlayButton onClick={onPlayChord}>♫ Acorde en bloque</PlayButton>
          <PlayButton onClick={onPlayFirst}>● 1ª nota</PlayButton>
          <PlayButton onClick={onStop}>■ Detener</PlayButton>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <SectionLabel>Inversión</SectionLabel>
          <div className="flex flex-wrap gap-1.5">
            {chord.arpeggioInversions.map((inv, i) => (
              <button
                key={i}
                onClick={() => setInversionIdx(i)}
                className={`rounded-full border px-3 py-1 text-[11px] font-medium transition ${
                  inversionIdx === i
                    ? "border-mint-600 bg-mint-50 text-mint-800"
                    : "border-ink-300 bg-white text-ink-700 hover:border-ink-500"
                }`}
              >
                {inv.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <SectionLabel>Dirección</SectionLabel>
          <div className="flex flex-wrap gap-1.5">
            {[
              ["asc", "Asc"],
              ["desc", "Desc"],
              ["both", "Asc + Desc"],
            ].map(([k, label]) => (
              <button
                key={k}
                onClick={() => setDirection(k)}
                className={`rounded-full border px-3 py-1 text-[11px] font-medium transition ${
                  direction === k
                    ? "border-mint-600 bg-mint-50 text-mint-800"
                    : "border-ink-300 bg-white text-ink-700 hover:border-ink-500"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ApproachControls({
  chord,
  formulaIdx,
  setFormulaIdx,
  onPlayFormula,
  onPlayChord,
  onPlayBoth,
  onPlayFirst,
  onStop,
}) {
  return (
    <div className="mt-4 space-y-3">
      <div>
        <SectionLabel>Fórmula desde…</SectionLabel>
        <div className="flex flex-wrap gap-1.5">
          {chord.approachFormulas.map((f, i) => (
            <button
              key={i}
              onClick={() => setFormulaIdx(i)}
              className={`rounded-full border px-3 py-1 text-[11px] font-medium transition ${
                formulaIdx === i
                  ? "border-mint-600 bg-mint-50 text-mint-800"
                  : "border-ink-300 bg-white text-ink-700 hover:border-ink-500"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <SectionLabel>Acción</SectionLabel>
        <div className="flex flex-wrap gap-1.5">
          <PlayButton primary onClick={onPlayFormula}>
            ▶ Fórmula melódica
          </PlayButton>
          <PlayButton onClick={onPlayChord}>♫ Acorde en bloque</PlayButton>
          <PlayButton onClick={onPlayBoth}>♫ + ▶ Acorde → fórmula</PlayButton>
          <PlayButton onClick={onPlayFirst}>● 1ª nota</PlayButton>
          <PlayButton onClick={onStop}>■ Detener</PlayButton>
        </div>
      </div>
    </div>
  );
}
