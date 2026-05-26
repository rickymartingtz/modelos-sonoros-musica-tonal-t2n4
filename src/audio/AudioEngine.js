// Motor de audio basado en soundfont-player.
// Carga el instrumento (piano por defecto) y reproduce secuencias
// melódicas o armónicas dadas en MIDI.

import Soundfont from "soundfont-player";

let audioContext = null;
let instrument = null;
let currentInstrumentName = null;
let loading = null;
let activeStops = [];

function ensureContext() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioContext;
}

export async function loadInstrument(name = "acoustic_grand_piano") {
  const ctx = ensureContext();
  if (instrument && currentInstrumentName === name) return instrument;
  if (loading) {
    try {
      await loading;
    } catch {
      // ignore
    }
  }
  loading = Soundfont.instrument(ctx, name, { soundfont: "MusyngKite" });
  try {
    instrument = await loading;
    currentInstrumentName = name;
  } finally {
    loading = null;
  }
  return instrument;
}

// Internal helper used by playback functions: usa el instrumento ya cargado
// (sea cual sea), o carga el default si todavía no hay ninguno. NO fuerza
// recarga si el usuario eligió otro sonido distinto al default.
async function getOrLoadInstrument() {
  if (instrument) return instrument;
  if (loading) {
    try {
      await loading;
    } catch {
      // ignore
    }
    if (instrument) return instrument;
  }
  return loadInstrument();
}

export function unlockAudio() {
  const ctx = ensureContext();
  if (ctx.state === "suspended") ctx.resume();
}

export function stopAll() {
  activeStops.forEach((stop) => {
    try {
      stop();
    } catch {
      // ignore
    }
  });
  activeStops = [];
  if (instrument && instrument.stop) instrument.stop();
}

// Toca una nota MIDI individual con duración (seg).
export async function playNote(midi, durationSec = 1.5, velocity = 0.85) {
  unlockAudio();
  const inst = await getOrLoadInstrument();
  const ctx = ensureContext();
  const player = inst.play(midi, ctx.currentTime, {
    duration: durationSec,
    gain: velocity,
  });
  const stop = () => player.stop && player.stop();
  activeStops.push(stop);
  setTimeout(() => {
    activeStops = activeStops.filter((s) => s !== stop);
  }, durationSec * 1000 + 200);
}

// Toca una secuencia melódica de MIDIs.
// notes: [{midi, duration}], duration en seg.
// gap: pequeño espacio entre notas.
export async function playMelodic(notes, { gap = 0.05, velocity = 0.85 } = {}) {
  unlockAudio();
  const inst = await getOrLoadInstrument();
  const ctx = ensureContext();
  let t = ctx.currentTime;
  const players = [];
  for (const n of notes) {
    const dur = n.duration ?? 0.6;
    const p = inst.play(n.midi, t, { duration: dur, gain: velocity });
    players.push(p);
    t += dur + gap;
  }
  const stop = () => players.forEach((p) => p.stop && p.stop());
  activeStops.push(stop);
}

// Toca un acorde simultáneo (todas las notas a la vez).
export async function playHarmonic(midis, { duration = 2.2, velocity = 0.7 } = {}) {
  unlockAudio();
  const inst = await getOrLoadInstrument();
  const ctx = ensureContext();
  const t = ctx.currentTime;
  const players = midis.map((m) =>
    inst.play(m, t, { duration, gain: velocity })
  );
  const stop = () => players.forEach((p) => p.stop && p.stop());
  activeStops.push(stop);
}

// Toca primero un acorde armónico, luego una melodía sobre el acorde sostenido.
export async function playHarmonyThenMelody(
  chordMidis,
  melodyNotes,
  { chordHold = 0.4, gap = 0.05, melodyVelocity = 0.85, chordVelocity = 0.55 } = {}
) {
  unlockAudio();
  const inst = await getOrLoadInstrument();
  const ctx = ensureContext();
  const t0 = ctx.currentTime;
  const totalMelodyDur =
    melodyNotes.reduce((s, n) => s + (n.duration ?? 0.6) + gap, 0) + chordHold;
  const chordPlayers = chordMidis.map((m) =>
    inst.play(m, t0, { duration: totalMelodyDur + 0.6, gain: chordVelocity })
  );
  let t = t0 + chordHold;
  const melodyPlayers = melodyNotes.map((n) => {
    const dur = n.duration ?? 0.6;
    const p = inst.play(n.midi, t, { duration: dur, gain: melodyVelocity });
    t += dur + gap;
    return p;
  });
  const stop = () =>
    [...chordPlayers, ...melodyPlayers].forEach((p) => p.stop && p.stop());
  activeStops.push(stop);
}

// Toca una sucesión de acordes (cadencia).
export async function playChordProgression(
  chords,
  { perChord = 0.9, velocity = 0.6 } = {}
) {
  unlockAudio();
  const inst = await getOrLoadInstrument();
  const ctx = ensureContext();
  let t = ctx.currentTime;
  const players = [];
  for (const chord of chords) {
    chord.forEach((m) => {
      const p = inst.play(m, t, { duration: perChord, gain: velocity });
      players.push(p);
    });
    t += perChord;
  }
  const stop = () => players.forEach((p) => p.stop && p.stop());
  activeStops.push(stop);
}
