// Panel teórico expandible (mismo formato para escalas y acordes).
// Tres microsecciones: Estructura · Contexto · Relaciones.

import { useState } from "react";

export default function TheoryPanel({
  aliases = [],
  formula,
  construction,
  origin,
  genres = [],
  works = [],
  relations = [],
  defaultOpen = false,
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="mt-3 rounded-2xl border border-ink-200 bg-ink-50/60">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between rounded-2xl px-4 py-2.5 text-xs font-medium text-ink-700 hover:bg-ink-100/50"
      >
        <span className="flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-[0.12em] text-ink-500">
            Información teórica
          </span>
        </span>
        <span className="text-ink-500">{open ? "−" : "+"}</span>
      </button>

      {open ? (
        <div className="grid gap-4 px-4 pb-4 pt-1 sm:grid-cols-3">
          {/* Estructura */}
          <div>
            <p className="mb-1.5 text-[10px] font-medium uppercase tracking-[0.12em] text-ink-500">
              Estructura
            </p>
            {formula ? (
              <p className="mb-2 font-mono text-[11px] text-ink-800">{formula}</p>
            ) : null}
            {construction ? (
              <p className="mb-2 text-[12px] leading-relaxed text-ink-700">{construction}</p>
            ) : null}
            {aliases.length ? (
              <div>
                <p className="mb-1 text-[10px] uppercase tracking-[0.08em] text-ink-500">
                  También llamada
                </p>
                <p className="text-[11px] leading-relaxed text-ink-700">
                  {aliases.join(" · ")}
                </p>
              </div>
            ) : null}
          </div>

          {/* Contexto */}
          <div>
            <p className="mb-1.5 text-[10px] font-medium uppercase tracking-[0.12em] text-ink-500">
              Contexto
            </p>
            {origin ? (
              <p className="mb-2 text-[12px] leading-relaxed text-ink-700">{origin}</p>
            ) : null}
            {genres.length ? (
              <div className="mb-2">
                <p className="mb-1 text-[10px] uppercase tracking-[0.08em] text-ink-500">
                  Géneros
                </p>
                <p className="text-[11px] leading-relaxed text-ink-700">
                  {genres.join(" · ")}
                </p>
              </div>
            ) : null}
            {works.length ? (
              <div>
                <p className="mb-1 text-[10px] uppercase tracking-[0.08em] text-ink-500">
                  Obras de referencia
                </p>
                <ul className="space-y-0.5">
                  {works.map((w, i) => (
                    <li key={i} className="text-[11px] leading-relaxed text-ink-700">
                      · {w}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>

          {/* Relaciones */}
          <div>
            <p className="mb-1.5 text-[10px] font-medium uppercase tracking-[0.12em] text-ink-500">
              Relaciones
            </p>
            {relations.length ? (
              <ul className="space-y-1.5">
                {relations.map((r, i) => (
                  <li key={i} className="text-[11px] leading-relaxed text-ink-700">
                    · {r}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-[11px] text-ink-500">—</p>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
