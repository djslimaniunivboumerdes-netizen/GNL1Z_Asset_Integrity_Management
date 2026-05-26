import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "@/contexts/I18nContext";
import { ArrowRight, Thermometer, Gauge, FileText, Activity, X, ChevronRight, FlaskConical } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }

type Lang = "en" | "fr";
type Status = "normal" | "alarm" | "standby" | "maintenance";

interface FlowStep {
  id: string;
  label: string;
  sublabel: string;
  description: Record<Lang, string>;
  temp: string;
  pressure: string;
  status: Status;
  pidId?: string;
  icon?: string;
}

interface PIDSection {
  id: string;
  title: Record<Lang, string>;
  sheets: number;
}

// ─── Data ───
const FLOW_STEPS: FlowStep[] = [
  {
    id: "feed",
    label: "Feed Gas",
    sublabel: "Inlet",
    description: { en: "Raw natural gas from Arzew field enters the train at ~48 bar, ambient temperature.", fr: "Gaz naturel brut du champ d'Arzew entre dans le train à ~48 bar, température ambiante." },
    temp: "Ambient", pressure: "48 bar", status: "normal", pidId: "PFD-001",
  },
  {
    id: "co2",
    label: "CO₂ Removal",
    sublabel: "Amine",
    description: { en: "MEA absorber strips CO₂ to <50 ppmv. Regenerator recovers lean amine.", fr: "L'absorbeur MEA élimine le CO₂ à <50 ppmv. Le régénérateur récupère l'amine pauvre." },
    temp: "40 °C", pressure: "48 bar", status: "normal", pidId: "PFD-002",
  },
  {
    id: "scrub",
    label: "Scrub Tower",
    sublabel: "Dehydr / Hg / C5+",
    description: { en: "Mol-sieve dehydration, mercury guard bed, and heavy-hydrocarbon scrubbing.", fr: "Déshydratation tamis moléculaire, lit de démercurisation, et lavage hydrocarbures lourds." },
    temp: "−35 °C", pressure: "47 bar", status: "alarm", pidId: "PFD-003",
  },
  {
    id: "main-exchanger",
    label: "MCHE",
    sublabel: "Liquefaction",
    description: { en: "Main Cryogenic Heat Exchanger liquefies gas to −162 °C using mixed refrigerant.", fr: "L'échangeur cryogénique principal liquéfie le gaz à −162 °C via réfrigérant mixte." },
    temp: "−162 °C", pressure: "44 bar", status: "normal", pidId: "PFD-004",
  },
  {
    id: "lng-storage",
    label: "LNG Storage",
    sublabel: "100 000 m³",
    description: { en: "Full-containment tank stores LNG at −162 °C before methanier loading.", fr: "Bac full-containment stocke le GNL à −162 °C avant chargement méthanier." },
    temp: "−162 °C", pressure: "1.1 bar", status: "normal", pidId: "PFD-005",
  },
];

const MCR_STEPS: FlowStep[] = [
  {
    id: "mcr",
    label: "MCR Loop",
    sublabel: "Mixed Refrigerant",
    description: { en: "Closed-loop mixed refrigerant (N₂, C1–C5) provides cooling duty for MCHE.", fr: "Boucle fermée réfrigérant mixte (N₂, C1–C5) fournit le froid pour le MCHE." },
    temp: "−162 °C → 38 °C", pressure: "1.4–44 bar", status: "maintenance", pidId: "PFD-MCR",
  },
];

const FRAC_STEPS: FlowStep[] = [
  {
    id: "demethanizer",
    label: "Demethanizer",
    sublabel: "C1 / C2+ split",
    description: { en: "Overhead methane recycled as fuel; bottoms C2+ to deethanizer.", fr: "Méthane de tête recyclé comme combustible ; fonds C2+ vers déethaniseur." },
    temp: "−95 °C", pressure: "28 bar", status: "normal", pidId: "PFD-FRAC-01",
  },
  {
    id: "de-ethanizer",
    label: "Deethanizer",
    sublabel: "C2 / C3+ split",
    description: { en: "Ethane recovered overhead; C3+ sent to depropanizer.", fr: "Éthane récupéré en tête ; C3+ envoyé au dépropaniseur." },
    temp: "−25 °C", pressure: "28 bar", status: "normal", pidId: "PFD-FRAC-02",
  },
  {
    id: "depropanizer",
    label: "Depropanizer",
    sublabel: "C3 / C4+ split",
    description: { en: "Commercial propane overhead; C4+ to debutanizer.", fr: "Propane commercial en tête ; C4+ vers débutaniseur." },
    temp: "45 °C", pressure: "18 bar", status: "normal", pidId: "PFD-FRAC-03",
  },
  {
    id: "debutanizer",
    label: "Debutanizer",
    sublabel: "C4 / C5+ split",
    description: { en: "Butane overhead; natural gasoline bottoms to rundown drum.", fr: "Butane en tête ; essence naturelle fonds vers ballon de soutirage." },
    temp: "65 °C", pressure: "8 bar", status: "normal", pidId: "PFD-FRAC-04",
  },
];

const PID_SECTIONS: PIDSection[] = [
  { id: "PFD-001", title: { en: "Feed & Decarbonation", fr: "Alimentation & Décarbonatation" }, sheets: 4 },
  { id: "PFD-002", title: { en: "Amine Regeneration", fr: "Régénération Amine" }, sheets: 3 },
  { id: "PFD-003", title: { en: "Dehydration & Mercury", fr: "Déshydratation & Démercurisation" }, sheets: 3 },
  { id: "PFD-004", title: { en: "Liquefaction (MCR)", fr: "Liquéfaction (MCR)" }, sheets: 5 },
  { id: "PFD-005", title: { en: "LNG Storage & Loading", fr: "Stockage & Chargement GNL" }, sheets: 2 },
  { id: "PFD-MCR", title: { en: "MCR Refrigeration", fr: "Réfrigération MCR" }, sheets: 4 },
  { id: "PFD-FRAC-01", title: { en: "Demethanizer", fr: "Déméthaniseur" }, sheets: 2 },
  { id: "PFD-FRAC-02", title: { en: "Deethanizer", fr: "Déethaniseur" }, sheets: 2 },
  { id: "PFD-FRAC-03", title: { en: "Depropanizer", fr: "Dépropaniseur" }, sheets: 2 },
  { id: "PFD-FRAC-04", title: { en: "Debutanizer", fr: "Débutaniseur" }, sheets: 2 },
];

const STATUS_META: Record<Status, { color: string; bg: string; border: string; label: Record<Lang, string> }> = {
  normal: { color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30", label: { en: "Normal", fr: "Normal" } },
  alarm: { color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/30", label: { en: "Alarm", fr: "Alarme" } },
  standby: { color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/30", label: { en: "Standby", fr: "Veille" } },
  maintenance: { color: "text-slate-400", bg: "bg-slate-500/10", border: "border-slate-500/30", label: { en: "Maintenance", fr: "Maintenance" } },
};

const PRODUCTS = [
  { label: "CH₄", sublabel: "LNG export", color: "text-teal-300 bg-teal-950 border-teal-600/40" },
  { label: "C₂H₆", sublabel: "Ethane", color: "text-sky-300 bg-sky-950 border-sky-600/40" },
  { label: "C₃H₈", sublabel: "Propane", color: "text-amber-300 bg-amber-950 border-amber-600/40" },
  { label: "C₄H₁₀", sublabel: "Butane", color: "text-orange-300 bg-orange-950 border-orange-600/40" },
  { label: "C₅+", sublabel: "Gasoline", color: "text-pink-300 bg-pink-950 border-pink-600/40" },
];

// ─── Sub-components ───

function StepCard({ step, isSelected, onClick, lang }: {
  step: FlowStep; isSelected: boolean; onClick: () => void; lang: Lang;
}) {
  const st = STATUS_META[step.status];
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative flex flex-col items-center text-center rounded-xl border px-4 py-3 min-w-[8.5rem] transition-all duration-200 hover:scale-[1.02]",
        isSelected
          ? "bg-white/10 border-teal-500/50 shadow-[0_0_20px_rgba(20,184,166,0.15)]"
          : "bg-white/5 border-white/10 hover:border-white/20"
      )}
    >
      {step.pidId && (
        <span className="absolute top-2 right-2 text-[10px] text-amber-400/80 flex items-center gap-0.5">
          <FileText size={10} /> P&ID
        </span>
      )}
      <div className={cn("text-xs font-bold uppercase tracking-wider mb-1", st.color)}>
        {step.label}
      </div>
      <div className="text-[10px] text-slate-400 mb-2">{step.sublabel}</div>
      <div className="flex items-center gap-3 text-[10px] text-slate-500">
        <span className="flex items-center gap-1"><Thermometer size={10} /> {step.temp}</span>
        <span className="flex items-center gap-1"><Gauge size={10} /> {step.pressure}</span>
      </div>
      <div className={cn("mt-2 px-2 py-0.5 rounded-full text-[10px] font-medium border", st.bg, st.border, st.color)}>
        {st.label[lang]}
      </div>
    </button>
  );
}

function DetailDrawer({ step, section, onClose, lang, onViewPID }: {
  step: FlowStep; section: PIDSection | null; onClose: () => void; lang: Lang; onViewPID: () => void;
}) {
  const st = STATUS_META[step.status];
  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-slate-900/98 border-l border-white/10 shadow-2xl backdrop-blur-xl animate-in slide-in-from-right duration-200 flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <FlaskConical size={18} className="text-teal-400" />
          <h2 className="text-lg font-bold text-white">{step.label}</h2>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-md hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
          <X size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className={cn("rounded-lg border px-3 py-2", st.bg, st.border)}>
          <div className="flex items-center justify-between">
            <span className={cn("text-sm font-semibold", st.color)}>{st.label[lang]}</span>
            <span className="text-xs text-slate-500">{step.sublabel}</span>
          </div>
        </div>

        <p className="text-sm text-slate-300 leading-relaxed">
          {step.description[lang]}
        </p>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-white/5 border border-white/10 p-3">
            <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Temperature</div>
            <div className="text-sm font-semibold text-white">{step.temp}</div>
          </div>
          <div className="rounded-lg bg-white/5 border border-white/10 p-3">
            <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Pressure</div>
            <div className="text-sm font-semibold text-white">{step.pressure}</div>
          </div>
        </div>

        {section && (
          <div className="rounded-lg bg-white/5 border border-white/10 p-3">
            <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-2">Linked P&ID</div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-white">{section.title[lang]}</div>
                <div className="text-xs text-slate-400">{section.sheets} sheet{section.sheets > 1 ? "s" : ""}</div>
              </div>
              <button
                onClick={onViewPID}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-500/15 border border-teal-500/30 text-teal-300 text-xs font-medium hover:bg-teal-500/25 transition-colors"
              >
                <FileText size={12} /> View
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main component ───
export default function LNGProcessFlow() {
  const navigate = useNavigate();
  const { lang: rawLang } = useI18n();
  const lang: Lang = rawLang?.startsWith("fr") ? "fr" : "en";

  const [selectedId, setSelectedId] = useState<string | null>(null);

  const stepById = useMemo(() => Object.fromEntries([...FLOW_STEPS, ...MCR_STEPS, ...FRAC_STEPS].map((s) => [s.id, s])), []);
  const sectionByPIDId = useMemo(() => Object.fromEntries(PID_SECTIONS.map((s) => [s.id, s])), []);

  const selectedStep = selectedId ? stepById[selectedId] : null;
  const selectedSection = selectedStep?.pidId ? (sectionByPIDId[selectedStep.pidId] ?? null) : null;

  const handleViewPID = useCallback(() => {
    navigate("/pid-viewer");
  }, [navigate]);

  const renderRow = (steps: FlowStep[], label?: string) => (
    <div className="flex flex-col gap-2">
      {label && (
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
          <span className="w-6 h-px bg-slate-700" />
          {label}
          <span className="flex-1 h-px bg-slate-800" />
        </div>
      )}
      <div className="flex flex-wrap items-stretch gap-3">
        {steps.map((step, idx) => {
          const isLast = idx === steps.length - 1;
          return (
            <div key={step.id} className="flex items-center gap-2">
              <StepCard
                step={step}
                isSelected={selectedId === step.id}
                onClick={() => setSelectedId((prev) => (prev === step.id ? null : step.id))}
                lang={lang}
              />
              {!isLast && <ArrowRight size={14} className="text-slate-600 shrink-0" />}
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Activity size={20} className="text-teal-400" />
            {lang === "en" ? "Process Overview" : "Vue d'Ensemble du Procédé"}
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            {lang === "en"
              ? "LNG Liquefaction Train — GL1/Z Sonatrach. High-level block diagram with operating conditions."
              : "Train de Liquéfaction GNL — GL1/Z Sonatrach. Diagramme de blocs avec conditions de fonctionnement."}
          </p>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs text-slate-400">
        {Object.entries(STATUS_META).map(([key, meta]) => (
          <div key={key} className="flex items-center gap-1.5">
            <span className={cn("w-2 h-2 rounded-full", meta.bg.replace("/10", ""))} style={{ background: key === "normal" ? "#34d399" : key === "alarm" ? "#f87171" : key === "standby" ? "#fbbf24" : "#94a3b8" }} />
            <span>{meta.label[lang]}</span>
          </div>
        ))}
      </div>

      {/* Diagram */}
      <div className="rounded-xl border border-white/10 bg-slate-900/40 p-4 sm:p-6 space-y-6">
        {/* MCR row */}
        {renderRow(MCR_STEPS, lang === "en" ? "MCR Refrigerant" : "Réfrigérant MCR")}

        {/* Connector */}
        <div className="flex items-center gap-2 pl-[4.5rem]">
          <div className="w-px h-6 bg-slate-700" />
          <ChevronRight size={12} className="text-slate-600 -rotate-90" />
          <span className="text-[10px] text-slate-500">{lang === "en" ? "Refrigerant to MCHE" : "Réfrigérant vers MCHE"}</span>
        </div>

        {/* Main flow */}
        {renderRow(FLOW_STEPS, lang === "en" ? "Main Process Train" : "Train Principal")}

        {/* Vertical drop */}
        <div className="flex items-center gap-2 pl-[28rem]">
          <div className="w-px h-6 bg-slate-700" />
          <ChevronRight size={12} className="text-slate-600 -rotate-90" />
          <span className="text-[10px] text-slate-500">NGL bottoms</span>
        </div>

        {/* Fractionation */}
        {renderRow(FRAC_STEPS, lang === "en" ? "Fractionation Train" : "Train de Fractionnement")}

        {/* Products */}
        <div className="pt-2">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
            <span className="w-6 h-px bg-slate-700" />
            {lang === "en" ? "Final Products" : "Produits Finaux"}
            <span className="flex-1 h-px bg-slate-800" />
          </div>
          <div className="flex flex-wrap gap-2">
            {PRODUCTS.map((p) => (
              <div key={p.label} className={cn("flex items-center gap-2 px-3 py-2 rounded-lg border text-xs", p.color)}>
                <span className="font-bold">{p.label}</span>
                <span className="opacity-70">{p.sublabel}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: lang === "en" ? "Feed Temp" : "Temp. Alim.", value: "Ambient", unit: "" },
          { label: lang === "en" ? "LNG Temp" : "Temp. GNL", value: "−162", unit: "°C" },
          { label: lang === "en" ? "Train" : "Train", value: "200", unit: "t/d" },
          { label: lang === "en" ? "P&IDs" : "P&IDs", value: PID_SECTIONS.length.toString(), unit: lang === "en" ? "sheets" : "feuilles" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-lg bg-white/5 border border-white/10 p-3 text-center">
            <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">{stat.label}</div>
            <div className="text-lg font-bold text-white">{stat.value}<span className="text-xs font-normal text-slate-400 ml-1">{stat.unit}</span></div>
          </div>
        ))}
      </div>

      {/* Detail drawer */}
      {selectedStep && (
        <DetailDrawer
          step={selectedStep}
          section={selectedSection}
          onClose={() => setSelectedId(null)}
          lang={lang}
          onViewPID={handleViewPID}
        />
      )}
    </div>
  );
            }
