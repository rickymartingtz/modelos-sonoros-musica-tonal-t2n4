// App.jsx — composición principal de Modelos Sonoros: Música Tonal.
// Mantiene el estado global (pilar activo, tónica, nivel, instrumento) y delega
// el render a las tarjetas de cada pilar.

import { useEffect, useState } from "react";
import TopBar from "./components/TopBar";
import ChordCard from "./components/ChordCard";
import ScaleCard from "./components/ScaleCard";
import FormulaCard from "./components/FormulaCard";
import { SectionLabel } from "./components/UI";
import { CHORDS } from "./theory/chords";
import { SCALES, SCALE_FAMILIES } from "./theory/scales";
import {
  TONIC_FORMULAS_MAJOR,
  TONIC_FORMULAS_HARMONIC_MINOR,
  TONIC_FORMULAS_MELODIC_MINOR_ASC,
  TONIC_FORMULAS_NATURAL_MINOR,
} from "./theory/formulas";
import { loadInstrument, unlockAudio } from "./audio/AudioEngine";

export default function App() {
  const [activePillar, setActivePillar] = useState("escalas");
  const [rootMidi, setRootMidi] = useState(60); // C4 por defecto
  const [level, setLevel] = useState(4);
  const [instrument, setInstrument] = useState("acoustic_grand_piano");
  const [tonicMode, setTonicMode] = useState("major"); // para fórmulas a la tónica
  const [audioReady, setAudioReady] = useState(false);

  // Carga inicial del instrumento (después del primer clic para evitar bloqueo del navegador)
  useEffect(() => {
    if (!audioReady) return;
    loadInstrument(instrument).catch((err) => {
      console.warn("No se pudo cargar el instrumento", err);
    });
  }, [instrument, audioReady]);

  const handleUnlock = () => {
    unlockAudio();
    setAudioReady(true);
  };

  return (
    <div className="min-h-screen bg-[#f5f4f0] pb-20" onClick={handleUnlock}>
      <TopBar
        activePillar={activePillar}
        onPillarChange={setActivePillar}
        rootMidi={rootMidi}
        onRootChange={setRootMidi}
        level={level}
        onLevelChange={setLevel}
        instrument={instrument}
        onInstrumentChange={setInstrument}
      />

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        {!audioReady ? (
          <div className="mb-6 rounded-2xl border border-mint-300 bg-mint-50 px-4 py-3 text-xs text-mint-800">
            Toca cualquier lugar para activar el audio. El soundfont (≈4 MB) se descarga la primera vez.
          </div>
        ) : null}

        {activePillar === "tonica" ? (
          <TonicaSection
            rootMidi={rootMidi}
            onRootChange={setRootMidi}
            tonicMode={tonicMode}
            onModeChange={setTonicMode}
          />
        ) : null}

        {activePillar === "fundamental" ? (
          <FundamentalSection
            rootMidi={rootMidi}
            onRootChange={setRootMidi}
            level={level}
          />
        ) : null}

        {activePillar === "escalas" ? (
          <EscalasSection rootMidi={rootMidi} onRootChange={setRootMidi} level={level} />
        ) : null}

        {activePillar === "arpegios" ? (
          <ArpegiosSection rootMidi={rootMidi} onRootChange={setRootMidi} level={level} />
        ) : null}
      </main>

      <footer className="mx-auto max-w-6xl px-4 pb-10 pt-6 text-center text-[10px] uppercase tracking-[0.16em] text-ink-500 sm:px-6">
        Método Aural · Modelos sonoros para música tonal
      </footer>
    </div>
  );
}

// ===== Sección: Fórmulas a la tónica =====
function TonicaSection({ rootMidi, onRootChange, tonicMode, onModeChange }) {
  const FORMULA_SETS = {
    major: { formulas: TONIC_FORMULAS_MAJOR, color: "ink" },
    harmonicMinor: { formulas: TONIC_FORMULAS_HARMONIC_MINOR, color: "mint" },
    melodicMinorAsc: { formulas: TONIC_FORMULAS_MELODIC_MINOR_ASC, color: "mint" },
    naturalMinor: { formulas: TONIC_FORMULAS_NATURAL_MINOR, color: "ink" },
  };
  const set = FORMULA_SETS[tonicMode];

  return (
    <section>
      <SectionHeader
        title="Fórmulas a la tónica"
        subtitle="Reconocer la gravedad melódica de cada grado hacia la tónica. Establece la tonalidad con la cadencia y canta la fórmula."
      />

      {/* Selector de modo */}
      <div className="mb-5 flex flex-wrap items-center gap-1.5">
        <span className="text-[10px] uppercase tracking-[0.12em] text-ink-500">Modo:</span>
        {[
          ["major", "Mayor"],
          ["harmonicMinor", "Menor armónica"],
          ["melodicMinorAsc", "Menor melódica asc."],
          ["naturalMinor", "Menor natural"],
        ].map(([k, label]) => (
          <button
            key={k}
            onClick={() => onModeChange(k)}
            className={`rounded-full border px-3 py-1 text-[11px] font-medium transition ${
              tonicMode === k
                ? "border-mint-600 bg-mint-50 text-mint-800"
                : "border-ink-300 bg-white text-ink-700 hover:border-ink-500"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {set.formulas.map((f) => (
          <FormulaCard
            key={f.id}
            formula={f}
            rootMidi={rootMidi}
            onRootChange={onRootChange}
            mode={tonicMode}
            color={set.color}
          />
        ))}
      </div>
    </section>
  );
}

// ===== Sección: Fórmulas a la fundamental =====
function FundamentalSection({ rootMidi, onRootChange, level }) {
  const chords = CHORDS.filter((c) => c.level <= level);
  return (
    <section>
      <SectionHeader
        title="Fórmulas a la fundamental"
        subtitle="Identificar cualquier nota de un acorde y conducirla hasta la fundamental. La fórmula puede tocarse sola, sólo con la armonía, o ambas simultáneamente."
      />
      <div className="grid gap-5 lg:grid-cols-2">
        {chords.map((chord) => (
          <ChordCard
            key={chord.id}
            chord={chord}
            rootMidi={rootMidi}
            onRootChange={onRootChange}
            pillarMode="approach"
          />
        ))}
      </div>
    </section>
  );
}

// ===== Sección: Escalas =====
function EscalasSection({ rootMidi, onRootChange, level }) {
  const scales = SCALES.filter((s) => s.level <= level);

  // Agrupar por familia
  const byFamily = {};
  scales.forEach((s) => {
    if (!byFamily[s.family]) byFamily[s.family] = [];
    byFamily[s.family].push(s);
  });

  const orderedFamilies = [
    "diatonic",
    "majorModes",
    "melodicMinorModes",
    "harmonicMinorModes",
    "pentatonic",
    "hexatonic",
    "octatonic",
    "messiaen",
    "synthetic",
    "worldApprox",
  ];

  return (
    <section>
      <SectionHeader
        title="Escalas"
        subtitle="Catálogo extendido: diatónicas, modos, pentatónicas, hexáfonas, octatónicas, modos de Messiaen, sintéticas y aproximaciones de tradiciones no-occidentales."
      />
      {orderedFamilies.map((fam) => {
        const items = byFamily[fam];
        if (!items?.length) return null;
        const family = SCALE_FAMILIES[fam];
        return (
          <div key={fam} className="mb-8">
            <div className="mb-3 flex items-center gap-3">
              <h2 className="font-display text-xl font-medium text-ink-900">
                {family.label}
              </h2>
              <span className="text-[10px] uppercase tracking-[0.12em] text-ink-500">
                {items.length} modelo{items.length === 1 ? "" : "s"}
              </span>
            </div>
            <div className="grid gap-5 lg:grid-cols-2">
              {items.map((scale) => (
                <ScaleCard
                  key={scale.id}
                  scale={scale}
                  rootMidi={rootMidi}
                  onRootChange={onRootChange}
                />
              ))}
            </div>
          </div>
        );
      })}
    </section>
  );
}

// ===== Sección: Arpegios =====
function ArpegiosSection({ rootMidi, onRootChange, level }) {
  const chords = CHORDS.filter((c) => c.level <= level);
  return (
    <section>
      <SectionHeader
        title="Arpegios"
        subtitle="Cantar el acorde nota por nota, en sus inversiones, en ambas direcciones. El acorde en bloque se reproduce con botón aparte para confirmar la sonoridad armónica."
      />
      <div className="grid gap-5 lg:grid-cols-2">
        {chords.map((chord) => (
          <ChordCard
            key={chord.id}
            chord={chord}
            rootMidi={rootMidi}
            onRootChange={onRootChange}
            pillarMode="arpeggio"
          />
        ))}
      </div>
    </section>
  );
}

function SectionHeader({ title, subtitle }) {
  return (
    <div className="mb-6">
      <h1 className="font-display text-3xl font-medium text-ink-950 sm:text-4xl">{title}</h1>
      <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ink-600">{subtitle}</p>
    </div>
  );
}
