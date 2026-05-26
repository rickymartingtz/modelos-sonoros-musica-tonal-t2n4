// Fórmulas de conducción a la tónica.
// Cada fórmula describe el camino melódico más corto desde un grado de la escala
// hasta la tónica.
//
// intervals: semitonos relativos a la tónica del modo.
// La nota inicial es el grado que se conduce; la última nota es la tónica
// (en cualquier octava). harmony es la sucesión de funciones armónicas asociadas
// (I, IV, V, etc.) que armonizan cada nota de la fórmula.

export const TONIC_MODES = {
  major: { label: "Modo mayor", scaleIntervals: [0, 2, 4, 5, 7, 9, 11] },
  harmonicMinor: { label: "Menor armónica", scaleIntervals: [0, 2, 3, 5, 7, 8, 11] },
  melodicMinorAsc: { label: "Menor melódica asc.", scaleIntervals: [0, 2, 3, 5, 7, 9, 11] },
  naturalMinor: { label: "Menor natural", scaleIntervals: [0, 2, 3, 5, 7, 8, 10] },
};

// Fórmulas básicas del modo mayor (7 grados → tónica)
export const TONIC_FORMULAS_MAJOR = [
  {
    id: "maj-1",
    label: "1° grado",
    degree: 1,
    intervals: [0],
    harmony: [["I"]],
    description: "La tónica misma, en redonda. Establecida.",
  },
  {
    id: "maj-2",
    label: "2° grado",
    degree: 2,
    intervals: [2, 0],
    harmony: [["V"], ["I"]],
    description: "Segunda mayor descendente, V → I.",
  },
  {
    id: "maj-3",
    label: "3° grado",
    degree: 3,
    intervals: [4, 2, 0],
    harmony: [["I"], ["V"], ["I"]],
    description: "Descenso por segundas: 3-2-1.",
  },
  {
    id: "maj-4",
    label: "4° grado",
    degree: 4,
    intervals: [5, 4, 2, 0],
    harmony: [["IV"], ["I"], ["V"], ["I"]],
    description: "Subdominante que desciende cromáticamente a la tónica.",
  },
  {
    id: "maj-5",
    label: "5° grado",
    degree: 5,
    intervals: [7, 0],
    harmony: [["V"], ["I"]],
    description: "Salto de quinta justa descendente: dominante → tónica.",
  },
  {
    id: "maj-6",
    label: "6° grado",
    degree: 6,
    intervals: [9, 7, 0],
    harmony: [["IV"], ["V"], ["I"]],
    description: "Sexta - quinta - octava.",
  },
  {
    id: "maj-7",
    label: "7° grado (sensible)",
    degree: 7,
    intervals: [11, 12],
    harmony: [["V"], ["I"]],
    description: "Sensible resolviendo a la tónica: gesto cadencial por excelencia.",
  },
];

// Fórmulas del modo menor armónico (con la sensible)
export const TONIC_FORMULAS_HARMONIC_MINOR = [
  { id: "hm-1", label: "1° grado", degree: 1, intervals: [0], harmony: [["i"]], description: "Tónica menor." },
  { id: "hm-2", label: "2° grado", degree: 2, intervals: [2, 0], harmony: [["V"], ["i"]], description: "Segunda descendente." },
  { id: "hm-3", label: "3° grado menor", degree: 3, intervals: [3, 2, 0], harmony: [["i"], ["V"], ["i"]], description: "b3 - 2 - 1." },
  { id: "hm-4", label: "4° grado", degree: 4, intervals: [5, 3, 2, 0], harmony: [["iv"], ["i"], ["V"], ["i"]], description: "Descenso 4-b3-2-1." },
  { id: "hm-5", label: "5° grado", degree: 5, intervals: [7, 0], harmony: [["V"], ["i"]], description: "Quinta descendente." },
  { id: "hm-6", label: "6° grado menor", degree: 6, intervals: [8, 7, 0], harmony: [["iv"], ["V"], ["i"]], description: "b6 - 5 - 1." },
  { id: "hm-7", label: "7° grado (sensible)", degree: 7, intervals: [11, 12], harmony: [["V"], ["i"]], description: "Sensible alzada del menor armónico." },
];

// Fórmulas del menor melódico ascendente (con 6 y 7 mayores)
export const TONIC_FORMULAS_MELODIC_MINOR_ASC = [
  { id: "mma-6", label: "6° grado (alzado)", degree: 6, intervals: [9, 11, 12], harmony: [["IV"], ["V"], ["i"]], description: "6-7-8 con 6 y 7 alzados." },
  { id: "mma-7", label: "7° grado (sensible)", degree: 7, intervals: [11, 12], harmony: [["V"], ["i"]], description: "Sensible del melódico ascendente." },
];

// Fórmulas del menor melódico descendente / natural (con 6 y 7 menores)
export const TONIC_FORMULAS_NATURAL_MINOR = [
  { id: "nm-6", label: "6° grado menor", degree: 6, intervals: [8, 7, 0], harmony: [["iv"], ["V"], ["i"]], description: "b6 - 5 - 1." },
  { id: "nm-7", label: "7° grado menor", degree: 7, intervals: [10, 8, 7, 0], harmony: [["v6"], ["iv6"], ["V"], ["i"]], description: "b7 - b6 - 5 - 1, característico del descenso natural." },
];

// Grados alterados — fórmulas de bordadura, nota de paso y apoyatura.
// La nota inicial es el grado alterado; resuelve por segunda menor al diatónico
// más cercano, y de ahí a la tónica.

export const ALTERED_DEGREES_MAJOR = [
  {
    id: "alt-1s-maj",
    label: "1° # (apoyatura)",
    formType: "apoyatura",
    intervals: [1, 0],
    harmony: [[], ["I"]],
    description: "1°# → 2° → 1°, vía apoyatura.",
  },
  {
    id: "alt-2b-maj",
    label: "2° b (nota de paso desc.)",
    formType: "nota de paso",
    intervals: [1, 0],
    harmony: [[], ["I"]],
    description: "b2 → 1, desciende cromáticamente.",
  },
  {
    id: "alt-2s-maj",
    label: "2° # (nota de paso asc.)",
    formType: "nota de paso",
    intervals: [3, 4, 0],
    harmony: [[], ["I"], ["V"], ["I"]],
    description: "#2 → 3 → tónica.",
  },
  {
    id: "alt-3b-maj",
    label: "3° b (bordadura)",
    formType: "bordadura",
    intervals: [3, 4, 0],
    harmony: [[], ["I"], ["V"], ["I"]],
    description: "b3 → 3 → tónica.",
  },
  {
    id: "alt-4s-maj",
    label: "4° # (nota de paso asc.)",
    formType: "nota de paso",
    intervals: [6, 7, 0],
    harmony: [[], ["V"], ["I"]],
    description: "#4 → 5 → tónica.",
  },
  {
    id: "alt-5b-maj",
    label: "5° b (bordadura desc.)",
    formType: "bordadura",
    intervals: [6, 7, 0],
    harmony: [[], ["V"], ["I"]],
    description: "b5 → 5 → tónica.",
  },
  {
    id: "alt-6b-maj",
    label: "6° b (nota de paso desc.)",
    formType: "nota de paso",
    intervals: [8, 7, 0],
    harmony: [[], ["V"], ["I"]],
    description: "b6 → 5 → tónica.",
  },
  {
    id: "alt-6s-maj",
    label: "6° # (apoyatura)",
    formType: "apoyatura",
    intervals: [10, 11, 12],
    harmony: [[], ["V"], ["I"]],
    description: "#6 → 7 → 8va, gesto ascendente con sensible.",
  },
  {
    id: "alt-7b-maj",
    label: "7° b (nota de paso desc.)",
    formType: "nota de paso",
    intervals: [10, 9, 12],
    harmony: [[], ["IV"], ["I"]],
    description: "b7 → 6 → 8va.",
  },
];

export const ALTERED_DEGREES_MINOR = [
  {
    id: "alt-1s-min",
    label: "1° # (apoyatura)",
    formType: "apoyatura",
    intervals: [1, 0],
    harmony: [[], ["i"]],
    description: "1°# → 2° → 1°.",
  },
  {
    id: "alt-2s-min",
    label: "2° # (apoyatura)",
    formType: "apoyatura",
    intervals: [3, 2, 0],
    harmony: [[], ["i"], ["V"], ["i"]],
    description: "#2 → b3 → 2 → 1.",
  },
  {
    id: "alt-4s-min",
    label: "4° # (nota de paso asc.)",
    formType: "nota de paso",
    intervals: [6, 7, 0],
    harmony: [[], ["V"], ["i"]],
    description: "#4 → 5 → tónica.",
  },
  {
    id: "alt-6s-min",
    label: "6° # (apoyatura)",
    formType: "apoyatura",
    intervals: [9, 11, 12],
    harmony: [[], ["V"], ["i"]],
    description: "Ascenso melódico 6-7-8 alzado.",
  },
  {
    id: "alt-7s-min",
    label: "7° # (sensible)",
    formType: "apoyatura",
    intervals: [11, 12],
    harmony: [["V"], ["i"]],
    description: "Sensible del menor armónico.",
  },
];
