import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useI18n } from "@/contexts/I18nContext";
import { Search, X, ZoomIn, ZoomOut, Maximize2, Minimize2, Move, Info } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// ─── Tailwind utils ───
function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }

// ─── Types ───
type Lang = "en" | "fr";
type Category = "absorber" | "exchanger" | "compressor" | "column" | "drum" | "turbine" | "pump" | "reactor" | "storage";
type Section = "decarb" | "dehydr" | "demerc" | "cooling" | "liquef" | "fract" | "fuel" | "storage";
type StreamKind = "feed" | "amine" | "c3" | "mcr" | "lng" | "fuel" | "lpg" | "cw";

interface Spec { label: string; value: string; }
interface NodeData {
  id: string;
  x: number;
  y: number;
  label: string;
  category: Category;
  section: Section;
  name: Record<Lang, string>;
  description: Record<Lang, string>;
  specs: Spec[];
  status?: "normal" | "alarm" | "standby" | "maintenance";
}

// ─── Category metadata ───
const CAT: Record<Category, { en: string; fr: string; color: string; shape: "tall-ellipse" | "wide-ellipse" | "diamond" | "rect" | "circle" }> = {
  absorber:   { en: "Absorber (LNG svc)",   fr: "Absorbeur (svc GNL)",  color: "#10b981", shape: "tall-ellipse" },
  exchanger:  { en: "Heat Exchanger",       fr: "Échangeur",            color: "#06b6d4", shape: "rect" },
  compressor: { en: "Compressor",           fr: "Compresseur",          color: "#a855f7", shape: "diamond" },
  column:     { en: "Fractionation Column", fr: "Colonne",              color: "#22c55e", shape: "tall-ellipse" },
  drum:       { en: "Drum / Vessel",        fr: "Capacité",             color: "#eab308", shape: "wide-ellipse" },
  turbine:    { en: "Gas Turbine",          fr: "Turbine",              color: "#ef4444", shape: "diamond" },
  pump:       { en: "Pump",                 fr: "Pompe",                color: "#ec4899", shape: "circle" },
  reactor:    { en: "Reactor (N₂ purge)",   fr: "Réacteur (purge N₂)",  color: "#a855f7", shape: "circle" },
  storage:    { en: "Storage",              fr: "Stockage",             color: "#94a3b8", shape: "wide-ellipse" },
};

const SECTION: Record<Section, { en: string; fr: string; band: string }> = {
  decarb:  { en: "Decarbonation (MEA)",      fr: "Décarbonatation (MEA)",      band: "from-emerald-900/40 to-emerald-900/10" },
  dehydr:  { en: "Dehydration",              fr: "Déshydratation",             band: "from-blue-900/40 to-blue-900/10" },
  demerc:  { en: "Mercury Removal",          fr: "Démercurisation",            band: "from-violet-900/40 to-violet-900/10" },
  cooling: { en: "Propane Pre-Cooling",      fr: "Pré-refroidissement Propane", band: "from-sky-900/40 to-sky-900/10" },
  liquef:  { en: "Liquefaction (MCR)",     fr: "Liquéfaction (MCR)",         band: "from-cyan-900/40 to-cyan-900/10" },
  fract:   { en: "Fractionation",            fr: "Fractionnement",             band: "from-lime-900/40 to-lime-900/10" },
  fuel:    { en: "Fuel Gas",                 fr: "Gaz Combustible",            band: "from-orange-900/40 to-orange-900/10" },
  storage: { en: "LNG Storage & Loading",    fr: "Stockage & Chargement GNL",  band: "from-slate-800/40 to-slate-800/10" },
};

const STREAM_COLOR: Record<StreamKind, string> = {
  feed: "#fbbf24", amine: "#22c55e", c3: "#60a5fa", mcr: "#a78bfa",
  lng: "#22d3ee", fuel: "#f97316", lpg: "#84cc16", cw: "#3b82f6",
};

const RADIUS: Record<Category, number> = {
  absorber: 2.6, exchanger: 2.6, compressor: 2.4, column: 2.4,
  drum: 1.8, turbine: 2.2, pump: 1.8, reactor: 2.2, storage: 2.8,
};

const STATUS_COLOR: Record<NonNullable<NodeData["status"]>, string> = {
  normal: "#22c55e", alarm: "#ef4444", standby: "#f59e0b", maintenance: "#64748b",
};

// ─── Equipment data ───
const NODES: NodeData[] = [
  // Decarbonation
  { id: "101-F501", x: 6, y: 38, label: "F501", category: "absorber", section: "decarb",
    name: { en: "MEA CO₂ Absorber", fr: "Absorbeur CO₂ MEA" },
    description: { en: "Counter-current MEA absorber removing CO₂ from feed gas to <50 ppmv before cryogenic stages.", fr: "Absorbeur MEA contre-courant éliminant le CO₂ du gaz d'alimentation à <50 ppmv avant les étages cryogéniques." },
    specs: [{ label: "Service", value: "Amine treating" }, { label: "Pressure", value: "48 bar" }, { label: "Diameter", value: '120"' }, { label: "Height", value: "32 m" }],
    status: "normal",
  },
  { id: "101-F502", x: 14, y: 18, label: "F502", category: "column", section: "decarb",
    name: { en: "MEA Regenerator", fr: "Régénérateur MEA" },
    description: { en: "Steam-stripped regenerator returning lean amine to the absorber.", fr: "Régénérateur stripé vapeur renvoyant l'amine pauvre vers l'absorbeur." },
    specs: [{ label: "Reboiler duty", value: "18 MW" }, { label: "Top T", value: "100 °C" }],
    status: "normal",
  },
  { id: "101-G-507", x: 6, y: 64, label: "G507", category: "drum", section: "decarb",
    name: { en: "Rich Amine Flash Drum", fr: "Ballon de Détente Amine Riche" },
    description: { en: "Flashes dissolved hydrocarbons from rich MEA before regeneration.", fr: "Détend les hydrocarbures dissous de la MEA riche avant régénération." },
    specs: [{ label: "Pressure", value: "5 bar" }],
    status: "normal",
  },
  // Dehydration
  { id: "102-G07.87", x: 22, y: 14, label: "G07.87", category: "drum", section: "dehydr",
    name: { en: "Dehydration Inlet KO Drum", fr: "Ballon Séparateur Déshydratation" },
    description: { en: "Removes free liquids upstream of mol-sieve beds.", fr: "Élimine les liquides libres en amont des tamis moléculaires." },
    specs: [{ label: "Pressure", value: "47 bar" }],
    status: "normal",
  },
  { id: "102-R03.10", x: 22, y: 32, label: "R03.10", category: "reactor", section: "dehydr",
    name: { en: "Mol-Sieve Bed A", fr: "Tamis Moléculaire A" },
    description: { en: "Adsorption of water on 4Å molecular sieves to <1 ppmv H₂O.", fr: "Adsorption d'eau sur tamis 4Å (<1 ppmv H₂O)." },
    specs: [{ label: "Cycle", value: "8 h" }, { label: "Regen T", value: "280 °C" }],
    status: "standby",
  },
  { id: "102-R03.11", x: 30, y: 32, label: "R03.11", category: "reactor", section: "dehydr",
    name: { en: "Mol-Sieve Bed B", fr: "Tamis Moléculaire B" },
    description: { en: "Parallel adsorber bed (rotating cycle: ads / regen / cool).", fr: "Lit adsorbeur parallèle (cycle: ads / régén / refroidissement)." },
    specs: [{ label: "Cycle", value: "8 h" }],
    status: "normal",
  },
  // Mercury
  { id: "102-R03.12", x: 38, y: 28, label: "R03.12", category: "reactor", section: "demerc",
    name: { en: "Mercury Guard Bed", fr: "Lit de Démercurisation" },
    description: { en: "Sulphur-impregnated activated-carbon bed removing Hg to <0.01 µg/Nm³.", fr: "Lit charbon actif soufré éliminant le Hg à <0,01 µg/Nm³." },
    specs: [{ label: "Outlet Hg", value: "<0.01 µg/Nm³" }],
    status: "normal",
  },
  // Propane pre-cooling
  { id: "104-E05.20", x: 46, y: 22, label: "E05.20", category: "exchanger", section: "cooling",
    name: { en: "Feed Gas / Propane Chiller", fr: "Chiller Gaz / Propane" },
    description: { en: "Kettle-type chiller cools dry feed gas with propane refrigerant.", fr: "Chiller type kettle refroidissant le gaz sec via propane." },
    specs: [{ label: "Outlet T", value: "−35 °C" }, { label: "Duty", value: "85 MW" }],
    status: "normal",
  },
  { id: "104-E07.11", x: 52, y: 14, label: "E07.11", category: "exchanger", section: "cooling",
    name: { en: "Propane Aftercooler (CW)", fr: "Aéroréfrigérant Propane (Eau)" },
    description: { en: "Cooling-water aftercooler condensing HP propane discharge before the accumulator.", fr: "Aéroréfrigérant à eau condensant le refoulement HP propane avant l'accumulateur." },
    specs: [{ label: "Service", value: "CW G1" }, { label: "Duty", value: "60 MW" }, { label: "Outlet T", value: "38 °C" }],
    status: "normal",
  },
  { id: "104-F07.11", x: 38, y: 52, label: "F07.11", category: "column", section: "cooling",
    name: { en: "Scrub Column", fr: "Colonne de Lavage" },
    description: { en: "Removes heavy hydrocarbons (C5+) before MCHE to prevent freeze-out.", fr: "Élimine les hydrocarbures lourds (C5+) avant le MCHE pour éviter le gel." },
    specs: [{ label: "Trays", value: "20" }, { label: "Bottom T", value: "−25 °C" }],
    status: "alarm",
  },
  { id: "103-K01.10", x: 46, y: 70, label: "K01.10", category: "compressor", section: "cooling",
    name: { en: "Propane Compressor (C3)", fr: "Compresseur Propane (C3)" },
    description: { en: "4-stage centrifugal compressor driving the propane pre-cooling loop.", fr: "Compresseur centrifuge 4 étages, boucle propane." },
    specs: [{ label: "Stages", value: "4" }, { label: "Power", value: "32 MW" }, { label: "Driver", value: "GE Frame 5" }],
    status: "normal",
  },
  { id: "103-G07.86", x: 56, y: 76, label: "G07.86", category: "drum", section: "cooling",
    name: { en: "Propane Suction Drum", fr: "Ballon d'Aspiration Propane" },
    description: { en: "K.O. drum protecting propane compressor suction stages.", fr: "Ballon K.O. protégeant l'aspiration du compresseur propane." },
    specs: [{ label: "Pressure", value: "1.4 bar" }],
    status: "normal",
  },
  { id: "104-G07.85", x: 38, y: 78, label: "G07.85", category: "drum", section: "cooling",
    name: { en: "Propane Accumulator (HP)", fr: "Accumulateur Propane (HP)" },
    description: { en: "High-pressure propane condensate receiver.", fr: "Accumulateur HP condensat propane." },
    specs: [{ label: "Pressure", value: "16 bar" }],
    status: "normal",
  },
  { id: "104-G07.90", x: 30, y: 78, label: "G07.90", category: "drum", section: "cooling",
    name: { en: "Propane Economizer (MP)", fr: "Économiseur Propane (MP)" },
    description: { en: "Mid-pressure flash stage of propane refrigeration.", fr: "Étage de détente moyenne pression propane." },
    specs: [{ label: "Pressure", value: "5 bar" }],
    status: "normal",
  },
  { id: "104-G07.91", x: 30, y: 88, label: "G07.91", category: "drum", section: "cooling",
    name: { en: "Propane Economizer (LP)", fr: "Économiseur Propane (BP)" },
    description: { en: "Low-pressure flash drum producing coldest propane stream.", fr: "Ballon BP produisant le propane le plus froid." },
    specs: [{ label: "Pressure", value: "1.4 bar" }],
    status: "normal",
  },
  // Liquefaction
  { id: "106-E05.20", x: 58, y: 28, label: "MCHE", category: "exchanger", section: "liquef",
    name: { en: "Main Cryogenic Heat Exchanger", fr: "Échangeur Cryogénique Principal" },
    description: { en: "Air Products coil-wound exchanger liquefying treated gas to −162 °C using mixed-component refrigerant.", fr: "Échangeur bobiné Air Products liquéfiant le gaz traité à −162 °C via réfrigérant mixte (MCR)." },
    specs: [{ label: "Type", value: "Coil-wound" }, { label: "Outlet T", value: "−162 °C" }, { label: "Height", value: "55 m" }, { label: "Duty", value: "180 MW" }],
    status: "normal",
  },
  { id: "106-G07.83", x: 70, y: 22, label: "G07.83", category: "drum", section: "liquef",
    name: { en: "MCR HP Separator", fr: "Séparateur MCR HP" },
    description: { en: "Splits MCR into liquid (MR-L) and vapour (MR-V) streams feeding MCHE.", fr: "Sépare le MCR en liquide (MR-L) et vapeur (MR-V) alimentant le MCHE." },
    specs: [{ label: "Pressure", value: "44 bar" }],
    status: "normal",
  },
  { id: "105-K01.20", x: 78, y: 38, label: "K01.20", category: "compressor", section: "liquef",
    name: { en: "MCR Compressor LP/MP", fr: "Compresseur MCR BP/MP" },
    description: { en: "Low/medium-pressure body of the mixed-refrigerant compressor train.", fr: "Corps BP/MP du train compresseur réfrigérant mixte." },
    specs: [{ label: "Stages", value: "3" }, { label: "Power", value: "40 MW" }],
    status: "normal",
  },
  { id: "105-K01.21", x: 86, y: 38, label: "K01.21", category: "compressor", section: "liquef",
    name: { en: "MCR Compressor HP", fr: "Compresseur MCR HP" },
    description: { en: "High-pressure body — final stage of the MCR loop.", fr: "Corps HP — étage final boucle MCR." },
    specs: [{ label: "Stages", value: "2" }, { label: "Power", value: "55 MW" }, { label: "Driver", value: "GE Frame 6" }],
    status: "maintenance",
  },
  { id: "105-G07.88", x: 72, y: 50, label: "G07.88", category: "drum", section: "liquef",
    name: { en: "MCR Suction Drum", fr: "Ballon Aspiration MCR" },
    description: { en: "Knock-out drum upstream of MCR compressor LP suction.", fr: "Ballon K.O. en amont aspiration BP compresseur MCR." },
    specs: [{ label: "Pressure", value: "3.5 bar" }],
    status: "normal",
  },
  { id: "K05-G07.89", x: 86, y: 56, label: "G07.89", category: "drum", section: "liquef",
    name: { en: "MCR Discharge Drum", fr: "Ballon Refoulement MCR" },
    description: { en: "Inter-stage K.O. between MCR HP discharge and aftercooler.", fr: "Ballon K.O. inter-étage refoulement HP MCR / aéroréfrigérant." },
    specs: [{ label: "Pressure", value: "44 bar" }],
    status: "normal",
  },
  // Fractionation
  { id: "107-F07.21", x: 8, y: 86, label: "F07.21", category: "column", section: "fract",
    name: { en: "Demethaniser", fr: "Déméthaniseur" },
    description: { en: "Strips methane overhead from C2+ liquids recovered in scrub column.", fr: "Strippe le méthane en tête des liquides C2+ du scrub." },
    specs: [{ label: "Trays", value: "32" }, { label: "Top T", value: "−95 °C" }],
    status: "normal",
  },
  { id: "108-F07.31", x: 18, y: 86, label: "F07.31", category: "column", section: "fract",
    name: { en: "Deethaniser", fr: "Déethaniseur" },
    description: { en: "Recovers ethane overhead, sends C3+ to depropaniser.", fr: "Récupère l'éthane en tête, envoie C3+ au dépropaniseur." },
    specs: [{ label: "Trays", value: "40" }, { label: "Pressure", value: "28 bar" }],
    status: "normal",
  },
  { id: "109-F07.41", x: 28, y: 86, label: "F07.41", category: "column", section: "fract",
    name: { en: "Depropaniser", fr: "Dépropaniseur" },
    description: { en: "Produces commercial propane overhead (LPG cut).", fr: "Produit du propane commercial en tête (coupe LPG)." },
    specs: [{ label: "Trays", value: "45" }, { label: "Pressure", value: "18 bar" }],
    status: "normal",
  },
  { id: "110-F07.51", x: 38, y: 86, label: "F07.51", category: "column", section: "fract",
    name: { en: "Debutaniser", fr: "Débutaniseur" },
    description: { en: "Separates butane (top) from natural gasoline (bottom).", fr: "Sépare le butane (tête) de l'essence naturelle (fond)." },
    specs: [{ label: "Trays", value: "38" }, { label: "Pressure", value: "8 bar" }],
    status: "normal",
  },
  { id: "7E2-G07.65", x: 60, y: 92, label: "G07.65", category: "drum", section: "fract",
    name: { en: "Gasoline Run-Down Drum", fr: "Ballon de Soutirage Essence" },
    description: { en: "Collects natural gasoline before storage / export.", fr: "Reçoit l'essence naturelle avant stockage / export." },
    specs: [{ label: "Service", value: "Gasoline export" }],
    status: "normal",
  },
  // Fuel + Storage
  { id: "102-K01.30", x: 92, y: 14, label: "K01.30", category: "compressor", section: "fuel",
    name: { en: "Fuel Gas Compressor", fr: "Compresseur Gaz Combustible" },
    description: { en: "Boosts BOG / fuel gas to plant fuel header (turbines, boilers).", fr: "Comprime le BOG / gaz combustible vers le collecteur (turbines, chaudières)." },
    specs: [{ label: "Discharge P", value: "28 bar" }],
    status: "normal",
  },
  { id: "LNG-TK", x: 92, y: 30, label: "LNG", category: "storage", section: "storage",
    name: { en: "LNG Storage Tank", fr: "Bac de Stockage GNL" },
    description: { en: "Full-containment cryogenic tank feeding the methaniers loading jetty.", fr: "Bac cryogénique full-containment alimentant le quai méthaniers." },
    specs: [{ label: "Capacity", value: "100 000 m³" }, { label: "Temp", value: "−162 °C" }],
    status: "normal",
  },
];

const EDGES: [string, string, StreamKind?][] = [
  ["101-F501", "101-F502", "amine"], ["101-F502", "101-F501", "amine"], ["101-F501", "101-G-507", "amine"],
  ["101-F501", "102-G07.87", "feed"],
  ["102-G07.87", "102-R03.10", "feed"], ["102-R03.10", "102-R03.11", "feed"], ["102-R03.11", "102-R03.12", "feed"],
  ["102-R03.12", "104-F07.11", "feed"], ["102-R03.12", "104-E05.20", "feed"],
  ["104-E05.20", "106-E05.20", "feed"], ["104-F07.11", "106-E05.20", "feed"],
  ["104-G07.85", "104-G07.90", "c3"], ["104-G07.90", "104-G07.91", "c3"], ["104-G07.91", "103-G07.86", "c3"],
  ["103-G07.86", "103-K01.10", "c3"], ["103-K01.10", "104-E07.11", "c3"], ["104-E07.11", "104-G07.85", "c3"],
  ["103-K01.10", "104-E05.20", "c3"],
  ["104-E07.11", "104-E05.20", "cw"], ["K05-G07.89", "104-E07.11", "cw"],
  ["106-E05.20", "106-G07.83", "mcr"], ["106-G07.83", "105-G07.88", "mcr"], ["105-G07.88", "105-K01.20", "mcr"],
  ["105-K01.20", "105-K01.21", "mcr"], ["105-K01.21", "K05-G07.89", "mcr"], ["K05-G07.89", "106-E05.20", "mcr"],
  ["106-E05.20", "LNG-TK", "lng"], ["106-E05.20", "102-K01.30", "fuel"],
  ["104-F07.11", "107-F07.21", "lpg"], ["107-F07.21", "108-F07.31", "lpg"], ["108-F07.31", "109-F07.41", "lpg"],
  ["109-F07.41", "110-F07.51", "lpg"], ["110-F07.51", "7E2-G07.65", "lpg"],
];

// ─── Sub-components ───

function NodeShape({ category, r, color }: { category: Category; r: number; color: string }) {
  const shape = CAT[category].shape;
  if (shape === "tall-ellipse") return <ellipse cx={0} cy={0} rx={r * 0.7} ry={r * 1.3} fill={color} stroke="rgba(255,255,255,0.2)" strokeWidth={0.15} />;
  if (shape === "wide-ellipse") return <ellipse cx={0} cy={0} rx={r * 1.3} ry={r * 0.7} fill={color} stroke="rgba(255,255,255,0.2)" strokeWidth={0.15} />;
  if (shape === "diamond") return <polygon points={`0,-${r} ${r},0 0,${r} -${r},0`} fill={color} stroke="rgba(255,255,255,0.2)" strokeWidth={0.15} />;
  if (shape === "rect") return <rect x={-r} y={-r * 0.7} width={r * 2} height={r * 1.4} rx={0.3} fill={color} stroke="rgba(255,255,255,0.2)" strokeWidth={0.15} />;
  return <circle cx={0} cy={0} r={r} fill={color} stroke="rgba(255,255,255,0.2)" strokeWidth={0.15} />;
}

function FlowEdge({ a, b, kind, i, nodeMap, isDimmed, selectedId, hoverId }: {
  a: string; b: string; kind: StreamKind; i: number;
  nodeMap: Record<string, NodeData>;
  isDimmed: (n: NodeData) => boolean;
  selectedId: string | null; hoverId: string | null;
}) {
  const na = nodeMap[a], nb = nodeMap[b];
  if (!na || !nb) return null;
  const dimmed = isDimmed(na) || isDimmed(nb);
  const active = selectedId === a || selectedId === b || hoverId === a || hoverId === b;
  const color = STREAM_COLOR[kind];
  const delay = `${(i % 6) * -0.2}s`;
  return (
    <g opacity={dimmed ? 0.12 : active ? 1 : 0.55}>
      <line x1={na.x} y1={na.y} x2={nb.x} y2={nb.y} stroke={color} strokeWidth={0.25} strokeLinecap="round" />
      <line x1={na.x} y1={na.y} x2={nb.x} y2={nb.y} stroke={color} strokeWidth={0.35} strokeDasharray="1.2 1.8" strokeLinecap="round"
        style={{ animation: `flowDash 1.2s linear infinite`, animationDelay: delay }} />
      {active && <line x1={na.x} y1={na.y} x2={nb.x} y2={nb.y} stroke={color} strokeWidth={0.8} strokeOpacity={0.25} strokeLinecap="round" filter="blur(0.3px)" />}
    </g>
  );
}

function DetailPanel({ node, onClose, lang }: { node: NodeData; onClose: () => void; lang: Lang }) {
  const c = CAT[node.category];
  const s = SECTION[node.section];
  const st = node.status ? STATUS_COLOR[node.status] : null;
  return (
    <div className="fixed bottom-4 right-4 z-50 w-[22rem] max-w-[92vw] rounded-xl border border-white/10 bg-slate-900/95 backdrop-blur-md shadow-2xl p-4 text-sm animate-in slide-in-from-bottom-4 fade-in duration-200">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{node.id}</span>
            {st && <span className="inline-block w-2 h-2 rounded-full" style={{ background: st, boxShadow: `0 0 6px ${st}` }} />}
          </div>
          <h3 className="text-base font-bold text-white mt-0.5">{lang === "en" ? node.name.en : node.name.fr}</h3>
        </div>
        <button onClick={onClose} className="p-1 rounded-md hover:bg-white/10 text-slate-400 hover:text-white transition-colors"><X size={16} /></button>
      </div>
      <p className="text-slate-300 leading-relaxed mb-3">{lang === "en" ? node.description.en : node.description.fr}</p>
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="rounded-lg bg-white/5 px-3 py-2">
          <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-0.5">{lang === "en" ? "Category" : "Catégorie"}</div>
          <div className="text-slate-200 font-medium">{lang === "en" ? c.en : c.fr}</div>
        </div>
        <div className="rounded-lg bg-white/5 px-3 py-2">
          <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-0.5">{lang === "en" ? "Section" : "Section"}</div>
          <div className="text-slate-200 font-medium">{lang === "en" ? s.en : s.fr}</div>
        </div>
      </div>
      <div className="border-t border-white/10 pt-3">
        <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-2">{lang === "en" ? "Technical Specifications" : "Spécifications Techniques"}</div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
          {node.specs.map((sp, idx) => (
            <div key={idx} className="flex justify-between items-baseline">
              <span className="text-slate-400 text-xs">{sp.label}</span>
              <span className="text-slate-100 text-xs font-medium">{sp.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Minimap({ nodes, edges, nodeMap, activeSection, selectedId, hoverId, viewBox, onClick }: {
  nodes: NodeData[]; edges: typeof EDGES; nodeMap: Record<string, NodeData>;
  activeSection: Section | "all"; selectedId: string | null; hoverId: string | null;
  viewBox: { x: number; y: number; w: number; h: number };
  onClick: (x: number, y: number) => void;
}) {
  return (
    <div className="absolute bottom-4 left-4 z-40 w-40 h-24 rounded-lg border border-white/10 bg-slate-900/80 backdrop-blur shadow-lg overflow-hidden cursor-pointer"
      onClick={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width;
        const py = (e.clientY - rect.top) / rect.height;
        onClick(px * 100, py * 100);
      }}>
      <svg viewBox="0 0 100 62.5" className="w-full h-full">
        {edges.map(([a, b, kind = "feed"], i) => {
          const na = nodeMap[a], nb = nodeMap[b];
          if (!na || !nb) return null;
          const dimmed = activeSection !== "all" && na.section !== activeSection && nb.section !== activeSection;
          return <line key={i} x1={na.x} y1={na.y} x2={nb.x} y2={nb.y} stroke={STREAM_COLOR[kind]} strokeWidth={0.4} opacity={dimmed ? 0.15 : 0.4} />;
        })}
        {nodes.map((n) => {
          const dimmed = activeSection !== "all" && n.section !== activeSection;
          const active = selectedId === n.id || hoverId === n.id;
          return <circle key={n.id} cx={n.x} cy={n.y} r={active ? 1.2 : 0.7} fill={active ? "#fff" : CAT[n.category].color} opacity={dimmed ? 0.2 : 0.8} />;
        })}
        {/* viewport rect */}
        <rect x={viewBox.x} y={viewBox.y} width={viewBox.w} height={viewBox.h} fill="none" stroke="#fff" strokeWidth={0.5} strokeOpacity={0.6} />
      </svg>
    </div>
  );
}

// ─── Main component ───
export default function ProcessFlow() {
  const { lang: rawLang } = useI18n();
  const lang: Lang = rawLang?.startsWith("fr") ? "fr" : "en";

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<Section | "all">("all");
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [fullscreen, setFullscreen] = useState(false);
  const [search, setSearch] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{ x: number; y: number; px: number; py: number } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const nodeMap = useMemo(() => Object.fromEntries(NODES.map((n) => [n.id, n])), []);
  const selected = selectedId ? nodeMap[selectedId] : null;

  const filteredNodes = useMemo(() => {
    if (!search.trim()) return NODES;
    const q = search.toLowerCase();
    return NODES.filter((n) =>
      n.id.toLowerCase().includes(q) ||
      n.label.toLowerCase().includes(q) ||
      n.name.en.toLowerCase().includes(q) ||
      n.name.fr.toLowerCase().includes(q)
    );
  }, [search]);

  const isDimmed = useCallback((n: NodeData) => {
    if (activeSection !== "all" && n.section !== activeSection) return true;
    if (search.trim() && !filteredNodes.some((fn) => fn.id === n.id)) return true;
    return false;
  }, [activeSection, search, filteredNodes]);

  const sectionList: (Section | "all")[] = ["all", "decarb", "dehydr", "demerc", "cooling", "liquef", "fract", "fuel", "storage"];

  // Camera
  const vbW = 100 / zoom;
  const vbH = 62.5 / zoom;
  const vbX = (100 - vbW) / 2 - pan.x / zoom;
  const vbY = (62.5 - vbH) / 2 - pan.y / zoom;

  // Pan / zoom handlers
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as Element).closest("[data-node]")) return;
    dragRef.current = { x: e.clientX, y: e.clientY, px: pan.x, py: pan.y };
    setIsDragging(false);
  }, [pan]);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.x;
    const dy = e.clientY - dragRef.current.y;
    if (Math.hypot(dx, dy) > 3) setIsDragging(true);
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const scaleX = 100 / rect.width;
    const scaleY = 62.5 / rect.height;
    setPan({
      x: dragRef.current.px + dx * scaleX * 0.6,
      y: dragRef.current.py + dy * scaleY * 0.6,
    });
  }, []);

  const onMouseUp = useCallback(() => { dragRef.current = null; }, []);

  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.12 : 1 / 1.12;
    setZoom((z) => Math.min(Math.max(z * factor, 0.6), 5));
  }, []);

  const handleNodeClick = useCallback((id: string) => {
    if (isDragging) { setIsDragging(false); return; }
    setSelectedId((prev) => (prev === id ? null : id));
  }, [isDragging]);

  const resetView = useCallback(() => { setZoom(1); setPan({ x: 0, y: 0 }); }, []);

  useEffect(() => {
    if (!fullscreen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setFullscreen(false); };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [fullscreen]);

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedId(null);
      if (e.key === "0" && e.ctrlKey) { e.preventDefault(); resetView(); }
      if (e.key === "f" && e.ctrlKey) { e.preventDefault(); setFullscreen((v) => !v); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [resetView]);

  return (
    <div className={cn("flex flex-col gap-4", fullscreen && "fixed inset-0 z-[100] bg-slate-950")}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Info size={20} className="text-teal-400" />
            {lang === "en" ? "Process Flow · GNL1Z Train" : "Schéma Procédé · Train GNL1Z"}
          </h1>
          <p className="text-slate-400 text-sm mt-1 max-w-xl">
            {lang === "en"
              ? "Interactive mimic of the Sonatrach GNL1Z general process view (AP-C3MR™). Tap any equipment to inspect. Filter by section or search by tag."
              : "Mimic interactif de la vue générale du procédé GNL1Z (AP-C3MR™). Cliquez un équipement pour inspecter. Filtrez par section ou recherchez par tag."}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={lang === "en" ? "Search tag or name…" : "Rechercher tag ou nom…"}
              className="pl-8 pr-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-teal-500 w-48"
            />
            {search && <button onClick={() => setSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"><X size={12} /></button>}
          </div>
          <button onClick={() => setFullscreen((v) => !v)} className="p-2 rounded-lg bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition-colors" title={fullscreen ? "Exit fullscreen" : "Fullscreen"}>
            {fullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>
      </div>

      {/* Section filters */}
      <div className="flex flex-wrap gap-1.5">
        {sectionList.map((s) => {
          const active = activeSection === s;
          const label = s === "all" ? (lang === "en" ? "All sections" : "Toutes sections") : (lang === "en" ? SECTION[s].en : SECTION[s].fr);
          return (
            <button
              key={s}
              onClick={() => setActiveSection(active ? "all" : s)}
              className={cn(
                "px-3 py-1 rounded-full text-xs font-medium border transition-all",
                active
                  ? "bg-teal-500/20 border-teal-500/40 text-teal-300 shadow-[0_0_10px_rgba(20,184,166,0.15)]"
                  : "bg-white/5 border-white/10 text-slate-400 hover:text-slate-200 hover:bg-white/10"
              )}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Stream legend */}
      <div className="flex flex-wrap gap-3 text-xs text-slate-400">
        {(["feed", "amine", "c3", "mcr", "lng", "lpg", "fuel", "cw"] as StreamKind[]).map((k) => (
          <div key={k} className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-0.5 rounded-full" style={{ background: STREAM_COLOR[k] }} />
            <span>
              {k === "feed" ? (lang === "en" ? "Feed gas" : "Gaz d'alim.") :
               k === "cw" ? (lang === "en" ? "Cooling water (G1)" : "Eau de refroidissement (G1)") :
               k === "fuel" ? (lang === "en" ? "Fuel gas" : "Gaz comb.") :
               k === "lpg" ? "LPG / NGL" :
               k === "c3" ? (lang === "en" ? "Propane (C3)" : "Propane (C3)") :
               k.toUpperCase()}
            </span>
          </div>
        ))}
      </div>

      {/* Diagram */}
      <div
        ref={containerRef}
        className={cn(
          "relative rounded-xl border border-white/10 bg-slate-900/50 overflow-hidden select-none",
          fullscreen ? "flex-1" : "h-[28rem] sm:h-[32rem] lg:h-[36rem]"
        )}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onWheel={onWheel}
      >
        {/* Zoom controls */}
        <div className="absolute top-3 right-3 z-30 flex flex-col gap-1">
          <button onClick={() => setZoom((z) => Math.min(z * 1.2, 5))} className="p-1.5 rounded-md bg-slate-800/80 border border-white/10 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"><ZoomIn size={14} /></button>
          <button onClick={() => setZoom((z) => Math.max(z / 1.2, 0.6))} className="p-1.5 rounded-md bg-slate-800/80 border border-white/10 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"><ZoomOut size={14} /></button>
          <button onClick={resetView} className="p-1.5 rounded-md bg-slate-800/80 border border-white/10 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors" title="Reset view"><Move size={14} /></button>
        </div>

        <div className="absolute top-3 left-3 z-30 text-[10px] text-slate-500 select-none pointer-events-none">
          Scroll to zoom · drag to pan · click to inspect{fullscreen ? " · Esc to exit" : ""}
        </div>

        <svg ref={svgRef} viewBox={`${vbX} ${vbY} ${vbW} ${vbH}`} className="w-full h-full cursor-grab active:cursor-grabbing">
          <defs>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <style>{`
              @keyframes flowDash { to { stroke-dashoffset: -3; } }
              @keyframes pulseNode { 0%,100%{opacity:0.6} 50%{opacity:1} }
            `}</style>
          </defs>

          {/* Section background bands */}
          {activeSection === "all" ? (
            <>
              <rect x={0} y={0} width={18} height={62.5} fill="url(#band-decarb)" opacity={0.06} />
              <rect x={18} y={0} width={20} height={62.5} fill="url(#band-dehydr)" opacity={0.06} />
              <rect x={36} y={0} width={22} height={62.5} fill="url(#band-cooling)" opacity={0.06} />
              <rect x={54} y={0} width={30} height={62.5} fill="url(#band-liquef)" opacity={0.06} />
              <rect x={0} y={80} width={50} height={18} fill="url(#band-fract)" opacity={0.06} />
              <rect x={84} y={0} width={16} height={62.5} fill="url(#band-fuel)" opacity={0.06} />
            </>
          ) : (
            NODES.filter((n) => n.section === activeSection).map((n) => (
              <rect key={n.id} x={n.x - 4} y={n.y - 4} width={8} height={8} rx={1} fill={CAT[n.category].color} fillOpacity={0.03} />
            ))
          )}

          {/* Section labels */}
          {activeSection === "all" && (
            <>
              <text x={9} y={4} textAnchor="middle" fill="#94a3b8" fontSize={1.8} fontWeight={600} opacity={0.35}>DECARB</text>
              <text x={28} y={4} textAnchor="middle" fill="#94a3b8" fontSize={1.8} fontWeight={600} opacity={0.35}>DEHYDR/DEMERC</text>
              <text x={47} y={4} textAnchor="middle" fill="#94a3b8" fontSize={1.8} fontWeight={600} opacity={0.35}>PRE-COOL</text>
              <text x={69} y={4} textAnchor="middle" fill="#94a3b8" fontSize={1.8} fontWeight={600} opacity={0.35}>LIQUEFACTION (MCR)</text>
              <text x={25} y={98} textAnchor="middle" fill="#94a3b8" fontSize={1.8} fontWeight={600} opacity={0.35}>FRACTIONATION</text>
              <text x={92} y={4} textAnchor="middle" fill="#94a3b8" fontSize={1.8} fontWeight={600} opacity={0.35}>FUEL / LNG</text>
            </>
          )}

          {/* Title watermark */}
          <text x={50} y={58} textAnchor="middle" fill="#334155" fontSize={4} fontWeight={700} opacity={0.15} style={{ userSelect: "none" }}>
            VUE GÉNÉRALE DU PROCÉDÉ — GNL1Z
          </text>

          {/* Edges */}
          {EDGES.map(([a, b, kind = "feed"], i) => (
            <FlowEdge key={i} a={a} b={b} kind={kind} i={i} nodeMap={nodeMap} isDimmed={isDimmed} selectedId={selectedId} hoverId={hoverId} />
          ))}

          {/* Nodes */}
          {NODES.map((n) => {
            const isSel = selectedId === n.id;
            const isHov = hoverId === n.id;
            const dimmed = isDimmed(n);
            const r = RADIUS[n.category];
            const color = CAT[n.category].color;
            const stColor = n.status ? STATUS_COLOR[n.status] : null;
            return (
              <g
                key={n.id}
                transform={`translate(${n.x},${n.y})`}
                data-node={n.id}
                onClick={() => handleNodeClick(n.id)}
                onMouseEnter={() => setHoverId(n.id)}
                onMouseLeave={() => setHoverId(null)}
                style={{ cursor: isDragging ? "grabbing" : "pointer" }}
                opacity={dimmed ? 0.15 : 1}
              >
                {/* Selection / hover ring */}
                {(isSel || isHov) && (
                  <circle cx={0} cy={0} r={r + 0.6} fill="none" stroke={isSel ? "#fff" : color} strokeWidth={0.25} strokeDasharray={isSel ? undefined : "0.5 0.5"} opacity={0.8} />
                )}
                {/* Glow */}
                {(isSel || isHov) && <circle cx={0} cy={0} r={r + 1.5} fill={color} opacity={0.12} filter="url(#glow)" />}
                {/* Status pulse */}
                {stColor && n.status !== "normal" && (
                  <circle cx={0} cy={0} r={r + 0.8} fill="none" stroke={stColor} strokeWidth={0.3} opacity={0.6} style={{ animation: "pulseNode 2s ease-in-out infinite" }} />
                )}
                {/* Shape */}
                <NodeShape category={n.category} r={r} color={color} />
                {/* Exchanger detail lines */}
                {n.category === "exchanger" && !isSel && (
                  <>
                    <line x1={-r * 0.6} y1={-r * 0.3} x2={r * 0.6} y2={-r * 0.3} stroke="rgba(0,0,0,0.25)" strokeWidth={0.2} />
                    <line x1={-r * 0.6} y1={0} x2={r * 0.6} y2={0} stroke="rgba(0,0,0,0.25)" strokeWidth={0.2} />
                    <line x1={-r * 0.6} y1={r * 0.3} x2={r * 0.6} y2={r * 0.3} stroke="rgba(0,0,0,0.25)" strokeWidth={0.2} />
                  </>
                )}
                {/* Label */}
                <text y={r + 1.6} textAnchor="middle" fill={dimmed ? "#64748b" : "#e2e8f0"} fontSize={1.6} fontWeight={600} style={{ pointerEvents: "none", userSelect: "none" }}>
                  {n.label}
                </text>
                {/* Tag */}
                <text y={r + 3.2} textAnchor="middle" fill={dimmed ? "#475569" : "#94a3b8"} fontSize={1.2} style={{ pointerEvents: "none", userSelect: "none" }}>
                  {n.id}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Minimap */}
        <Minimap
          nodes={NODES} edges={EDGES} nodeMap={nodeMap}
          activeSection={activeSection} selectedId={selectedId} hoverId={hoverId}
          viewBox={{ x: vbX, y: vbY, w: vbW, h: vbH }}
          onClick={(x, y) => { setPan({ x: x - 50 / zoom, y: y - 31.25 / zoom }); }}
        />

        {/* Detail panel */}
        {selected && <DetailPanel node={selected} onClose={() => setSelectedId(null)} lang={lang} />}
      </div>

      {/* Footer stats */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>{NODES.length} {lang === "en" ? "equipment items" : "équipements"} · {EDGES.length} {lang === "en" ? "streams" : "courants"}</span>
        <span>{lang === "en" ? "AP-C3MR™ process mimic" : "Mimic procédé AP-C3MR™"}</span>
      </div>
    </div>
  );
  }
