// FormulaCard: tarjeta para Fórmulas a la tónica.
// Cada fórmula es una secuencia melódica que conduce a la tónica.
// Botones:
//  - ▶ Fórmula sola
//  - ♫ Armonía sola (cadencia I-IV-V-I que establece la tónica)
//  - ♫ → ▶ Cadencia + fórmula (establece la tónica con cadencia y luego canta la fórmula con la tónica sostenida)
//  - ● Primera nota (tónica)
//  - ■ Detener

import { useMemo } from "react";
import {
  applyIntervals,
  midiToName,
  clampToSinging,
  cadenceIvVI,
} from "../theory/utils";
import ScoreView from "./ScoreView";
import { PlayButton, FamilyChip, SectionLabel, TranspositionControls } from "./UI";
import TheoryPanel from "./TheoryPanel";
import {
  playMelodic,
  playChordProgression,
  playHarmonyThenMelody,
  playNote,
  stopAll,
} from "../audio/AudioEngine";

const NOTE_DURATION = 0.7;

export default function FormulaCard({ formula, rootMidi, onRootChange, mode = "major", color = "ink" }) {
  const tonicName = midiToName(rootMidi).replace(/-?\d+$/, "");

  // Notas de la fórmula en MIDI
  const formulaMidis = useMemo(
    () => applyIntervals(rootMidi, formula.intervals),
    [formula, rootMidi]
  );

  // Cadencia I-IV-V-I según el modo
  const cadenceChords = useMemo(
    () => cadenceIvVI(rootMidi, mode === "major" ? "major" : "minor"),
    [rootMidi, mode]
  );

  // Reproducción
  const playFormula = () => {
    const notes = formulaMidis.map((midi) => ({ midi, duration: NOTE_DURATION }));
    playMelodic(notes);
  };

  const playCadence = () => {
    playChordProgression(cadenceChords, { perChord: 0.7 });
  };

  const playCadenceThenFormula = () => {
    // Primero toca cadencia, luego fórmula sobre tónica sostenida.
    // Construyo: toco progresión, luego con un pequeño delay disparo la fórmula.
    playChordProgression(cadenceChords, { perChord: 0.65 });
    const totalCadenceMs = cadenceChords.length * 700 + 200;
    setTimeout(() => {
      const notes = formulaMidis.map((midi) => ({ midi, duration: NOTE_DURATION }));
      // Tónica sostenida en la octava grave
      const drone = [rootMidi - 12];
      playHarmonyThenMelody(drone, notes, { chordHold: 0.1 });
    }, totalCadenceMs);
  };

  const playFirst = () => playNote(clampToSinging(formulaMidis[0] ?? rootMidi), 3.0);
  const transpose = (n) => onRootChange(rootMidi + n);

  return (
    <div className="rounded-3xl border border-ink-200 bg-white p-5 transition hover:border-ink-300">
      {/* Encabezado */}
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <FamilyChip color={color}>
            {mode === "major"
              ? "Modo mayor"
              : mode === "harmonicMinor"
              ? "Menor armónica"
              : mode === "melodicMinorAsc"
              ? "Menor melódica asc."
              : "Menor natural"}
          </FamilyChip>
          <h3 className="mt-2 font-display text-2xl font-medium text-ink-950">
            {formula.label}
          </h3>
          <p className="mt-0.5 text-xs text-ink-600">
            En {tonicName} · {formula.description}
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
        <ScoreView midis={formulaMidis} tonicName={tonicName} duration="q" />
      </div>

      {/* Controles */}
      <div className="mt-4 space-y-3">
        <div>
          <SectionLabel>Acción</SectionLabel>
          <div className="flex flex-wrap gap-1.5">
            <PlayButton primary onClick={playFormula}>
              ▶ Fórmula sola
            </PlayButton>
            <PlayButton onClick={playCadence}>♫ Armonía sola</PlayButton>
            <PlayButton onClick={playCadenceThenFormula}>
              ♫ → ▶ Cadencia + fórmula
            </PlayButton>
            <PlayButton onClick={playFirst}>● 1ª nota</PlayButton>
            <PlayButton onClick={stopAll}>■ Detener</PlayButton>
          </div>
        </div>
      </div>

      {/* Panel teórico (más sencillo: estas son fórmulas, no escalas completas) */}
      <div className="mt-3 rounded-2xl border border-ink-200 bg-ink-50/60 px-4 py-3">
        <p className="mb-1 text-[10px] font-medium uppercase tracking-[0.12em] text-ink-500">
          Cómo escucharla
        </p>
        <p className="text-[12px] leading-relaxed text-ink-700">
          Establece primero la tonalidad con la cadencia. Luego canta la fórmula apoyado en la tónica
          sostenida. Las primeras veces puedes apoyarte en la nota; el objetivo es que la sensación de
          gravedad hacia la tónica se vuelva audible sin necesidad del piano.
        </p>
      </div>
    </div>
  );
}
