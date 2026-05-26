// ScaleCard: tarjeta de escala con controles de estudio (ascendente, descendente,
// considerar como grado, fragmentos por segundas y por cuartas) y panel teórico.

import { useState, useMemo } from "react";
import {
  applyIntervals,
  midiToName,
  clampToSinging,
} from "../theory/utils";
import ScoreView from "./ScoreView";
import {
  PlayButton,
  FamilyChip,
  SectionLabel,
  TranspositionControls,
} from "./UI";
import TheoryPanel from "./TheoryPanel";
import { SCALE_FAMILIES } from "../theory/scales";
import { playMelodic, playNote, stopAll } from "../audio/AudioEngine";

const NOTE_DURATION = 0.55;

function asNotes(midis) {
  return midis.map((midi) => ({ midi, duration: NOTE_DURATION }));
}

export default function ScaleCard({ scale, rootMidi, onRootChange }) {
  const family = SCALE_FAMILIES[scale.family];
  const tonicName = midiToName(rootMidi).replace(/-?\d+$/, "");

  const [direction, setDirection] = useState("asc"); // asc | desc | both
  const [fragment, setFragment] = useState("full"); // full | seconds | fourths
  const [showModes, setShowModes] = useState(false);

  // Escala completa con octava
  const fullScale = useMemo(() => {
    const seq = applyIntervals(rootMidi, [...scale.intervals, 12]);
    if (direction === "desc") return [...seq].reverse();
    if (direction === "both") return [...seq, ...[...seq].slice(0, -1).reverse()];
    return seq;
  }, [scale, rootMidi, direction]);

  // Fragmentos por segundas (Ricky-Romero exercise): C-D, D-E, E-F, F-G, etc.
  const seconds = useMemo(() => {
    const seq = applyIntervals(rootMidi, [...scale.intervals, 12]);
    const pairs = [];
    for (let i = 0; i < seq.length - 1; i++) pairs.push([seq[i], seq[i + 1]]);
    return pairs.flat();
  }, [scale, rootMidi]);

  // Fragmentos por cuartas (tetracordes): grupos de 4 notas con superposición
  const fourths = useMemo(() => {
    const seq = applyIntervals(rootMidi, [...scale.intervals, 12]);
    const groups = [];
    for (let i = 0; i <= seq.length - 4; i++)
      groups.push(seq.slice(i, i + 4));
    return groups.flat();
  }, [scale, rootMidi]);

  const displayMidis =
    fragment === "seconds" ? seconds : fragment === "fourths" ? fourths : fullScale;

  // Modos derivados de esta escala (por rotación)
  const modes = useMemo(() => {
    const result = [];
    const n = scale.intervals.length;
    for (let i = 0; i < n; i++) {
      const rotated = [];
      const offset = scale.intervals[i];
      for (let j = 0; j < n; j++) {
        const idx = (i + j) % n;
        const semi = scale.intervals[idx] - offset;
        rotated.push(((semi % 12) + 12) % 12);
      }
      result.push({ degree: i + 1, intervals: rotated });
    }
    return result;
  }, [scale]);

  // Reproducción
  const playFull = () => playMelodic(asNotes(displayMidis));
  const playFirst = () => playNote(clampToSinging(rootMidi), 3.0);
  const transpose = (n) => onRootChange(rootMidi + n);

  return (
    <div className="rounded-3xl border border-ink-200 bg-white p-5 transition hover:border-ink-300">
      {/* Encabezado */}
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <FamilyChip color={family?.color}>{family?.label}</FamilyChip>
          <h3 className="mt-2 font-display text-2xl font-medium text-ink-950">
            {scale.name}
          </h3>
          <p className="mt-0.5 text-xs text-ink-600">
            En {tonicName} ·{" "}
            <span className="font-mono">{scale.formula}</span>
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
        <ScoreView midis={displayMidis} tonicName={tonicName} duration="q" />
      </div>

      {/* Controles */}
      <div className="mt-4 space-y-3">
        <div>
          <SectionLabel>Acción</SectionLabel>
          <div className="flex flex-wrap gap-1.5">
            <PlayButton primary onClick={playFull}>
              ▶ Reproducir
            </PlayButton>
            <PlayButton onClick={playFirst}>● 1ª nota</PlayButton>
            <PlayButton onClick={stopAll}>■ Detener</PlayButton>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
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
          <div>
            <SectionLabel>Estudio por fragmentos</SectionLabel>
            <div className="flex flex-wrap gap-1.5">
              {[
                ["full", "Completa"],
                ["seconds", "Por 2as"],
                ["fourths", "Por 4as"],
              ].map(([k, label]) => (
                <button
                  key={k}
                  onClick={() => setFragment(k)}
                  className={`rounded-full border px-3 py-1 text-[11px] font-medium transition ${
                    fragment === k
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

        {/* Modos derivados */}
        <div>
          <button
            type="button"
            onClick={() => setShowModes((v) => !v)}
            className="inline-flex items-center gap-1.5 rounded-full border border-ink-300 bg-white px-3 py-1 text-[11px] font-medium text-ink-700 hover:border-ink-500"
          >
            {showModes ? "Ocultar modos derivados" : "Ver modos derivados"} ({modes.length})
          </button>
          {showModes ? (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {modes.map((m, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    const seq = applyIntervals(rootMidi, [...m.intervals, 12]);
                    playMelodic(asNotes(seq));
                  }}
                  className="rounded-full border border-ink-200 bg-ink-50 px-2.5 py-0.5 text-[10px] text-ink-700 hover:border-ink-400"
                  title="Tocar modo"
                >
                  Modo {m.degree}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      {/* Panel teórico */}
      <TheoryPanel
        aliases={scale.aliases}
        formula={scale.formula}
        construction={scale.description}
        origin={scale.origin}
        genres={scale.genres}
        works={scale.works}
        relations={scale.relations}
      />
    </div>
  );
}
