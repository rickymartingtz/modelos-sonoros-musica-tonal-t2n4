// Componentes UI compartidos: botones, etiquetas, controles de transposición.

export function PlayButton({ children, onClick, primary, title, disabled }) {
  const base =
    "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium tracking-tight transition disabled:opacity-50";
  const cls = primary
    ? `${base} bg-ink-950 text-white border border-ink-950 hover:bg-ink-800`
    : `${base} border border-ink-300 bg-white text-ink-800 hover:border-ink-500 hover:bg-ink-50`;
  return (
    <button type="button" onClick={onClick} title={title} disabled={disabled} className={cls}>
      {children}
    </button>
  );
}

export function IconCircle({ children, onClick, title, active }) {
  const base =
    "inline-flex h-8 w-8 items-center justify-center rounded-full border text-xs transition";
  const cls = active
    ? `${base} border-mint-600 bg-mint-50 text-mint-800`
    : `${base} border-ink-300 bg-white text-ink-700 hover:border-ink-500`;
  return (
    <button type="button" onClick={onClick} title={title} className={cls}>
      {children}
    </button>
  );
}

export function FamilyChip({ children, color = "ink" }) {
  const palettes = {
    ink: "border-ink-300 bg-ink-50 text-ink-700",
    mint: "border-mint-300 bg-mint-50 text-mint-800",
    lime: "border-lime-300 bg-lime-50 text-lime-700",
  };
  return (
    <span
      className={`inline-block rounded-full border px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider ${palettes[color] ?? palettes.ink}`}
    >
      {children}
    </span>
  );
}

export function SectionLabel({ children }) {
  return (
    <p className="mb-1.5 text-[10px] font-medium uppercase tracking-[0.12em] text-ink-500">
      {children}
    </p>
  );
}

export function Divider() {
  return <div className="h-px w-full bg-ink-200" />;
}

// Botones de transposición agrupados: ±1/2 tono, ±8va, reset.
export function TranspositionControls({ onUp, onDown, onOctaveUp, onOctaveDown, onReset }) {
  return (
    <div className="flex items-center gap-1">
      <IconCircle onClick={onUp} title="Transportar ½ tono arriba">
        ▲
      </IconCircle>
      <IconCircle onClick={onDown} title="Transportar ½ tono abajo">
        ▼
      </IconCircle>
      <span className="mx-1 h-5 w-px bg-ink-200" />
      <button
        type="button"
        onClick={onOctaveUp}
        title="Una octava arriba"
        className="inline-flex h-8 items-center justify-center rounded-full border border-ink-300 bg-white px-2 text-[10px] font-bold text-ink-700 hover:border-ink-500"
      >
        8↑
      </button>
      <button
        type="button"
        onClick={onOctaveDown}
        title="Una octava abajo"
        className="inline-flex h-8 items-center justify-center rounded-full border border-ink-300 bg-white px-2 text-[10px] font-bold text-ink-700 hover:border-ink-500"
      >
        8↓
      </button>
      <span className="mx-1 h-5 w-px bg-ink-200" />
      <IconCircle onClick={onReset} title="Volver al centro">
        ⟲
      </IconCircle>
    </div>
  );
}
