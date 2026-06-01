import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { useI18n } from "@/contexts/I18nContext";
import { getCoordinate } from "@/utils/processFlowCoordinates";
import {
  ZoomIn, ZoomOut, RotateCcw, X, Search,
  Layers, ExternalLink, BookOpen, Menu,
} from "lucide-react";

/* ─── DEBUG MODE TOGGLE ─────────────────────────────────────────────────── */
const DEBUG_COORDINATES = false; // Set to true to render red targeting anchors

/* ─── Supabase storage ───────────────────────────────────────────────────── */
const SB  = "https://gdkqetzkhgllwbpmqmux.supabase.co/storage/v1/object/public/equipment-images";
const dcsUrl = (p: string) =>
  `${SB}/${p.split("/").map(encodeURIComponent).join("/")}`;

/* ─── Section theme ──────────────────────────────────────────────────────── */
type Section =
  | "treatment" | "dehydration" | "propane"
  | "liquefaction" | "fractionation" | "compressor";

const SECT: Record<Section, { en: string; fr: string; color: string; bg: string; border: string }> = {
  treatment:    { en:"Treatment",    fr:"Traitement",    color:"#00e5a0", bg:"rgba(0,229,160,.16)",   border:"rgba(0,229,160,.5)"   },
  dehydration:  { en:"Dehydration",  fr:"Déshydratation",color:"#38bdf8", bg:"rgba(56,189,248,.16)",  border:"rgba(56,189,248,.5)"  },
  propane:      { en:"Propane",      fr:"Propane",       color:"#fb923c", bg:"rgba(251,146,60,.16)",  border:"rgba(251,146,60,.5)"  },
  liquefaction: { en:"Liquefaction", fr:"Liquéfaction",  color:"#a78bfa", bg:"rgba(167,139,250,.16)", border:"rgba(167,139,250,.5)" },
  fractionation:{ en:"Fractionation",fr:"Fractionnement",color:"#ffb020", bg:"rgba(255,176,32,.16)",  border:"rgba(255,176,32,.5)"  },
  compressor:   { en:"Compression",  fr:"Compression",   color:"#ff4d6a", bg:"rgba(255,77,106,.16)",  border:"rgba(255,77,106,.5)"  },
};

/* ─── DCS panels ─────────────────────────────────────────────────────────── */
const DCS = [
  { id:"general-train",      title:"General Train",        path:"dcs/general train.jpg"                      },
  { id:"decarbonation-01",   title:"Decarbonation MEA 1",  path:"dcs/decarbonation-01.jpg"                   },
  { id:"decarbonation-2",    title:"Decarbonation MEA 2",  path:"dcs/decarbonation-2.jpg"                    },
  { id:"dehydration-1",      title:"Dehydration 1",        path:"dcs/dehydration-1.jpg"                      },
  { id:"dehydration-2",      title:"Dehydration 2",        path:"dcs/dehydration-2.jpg"                      },
  { id:"dehydration-3",      title:"Dehydration 3",        path:"dcs/dehydration-3.jpg"                      },
  { id:"scrubber",           title:"Inlet Scrubber",       path:"dcs/scrubber.jpg"                           },
  { id:"propane-1",          title:"Propane Loop 1",       path:"dcs/propane-1.jpg"                          },
  { id:"propane-2",          title:"Propane Loop 2",       path:"dcs/propane-2.jpg"                          },
  { id:"propane-3",          title:"Propane Loop 3",       path:"dcs/propane-3.jpg"                          },
  { id:"liquefaction-1",     title:"Liquefaction 1",       path:"dcs/liquefaction-1.jpg"                     },
  { id:"liquefaction-2",     title:"Liquefaction 2",       path:"dcs/liquefaction-2.jpg"                     },
  { id:"mcr-1",              title:"MCR Refrigeration 1",  path:"dcs/MCR-1.jpg"                              },
  { id:"mcr-2",              title:"MCR Refrigeration 2",  path:"dcs/MCR-2.jpg"                              },
  { id:"mcr-3",              title:"MCR Refrigeration 3",  path:"dcs/MCR-3.jpg"                              },
  { id:"demethanisation",    title:"Demethaniser",         path:"dcs/demethanisation.jpg"                    },
  { id:"demethanisation-2",  title:"Demethaniser 2",       path:"dcs/demethanisation-2.jpg"                  },
  { id:"deethanisation",     title:"Deethaniser",          path:"dcs/deethanisation.jpg"                     },
  { id:"depropanisation",    title:"Depropaniser",         path:"dcs/depropanisation.jpg"                    },
  { id:"debutanisation",     title:"Debutaniser",          path:"dcs/debutanisation.jpg"                     },
  { id:"echangeur-recup-gpl",title:"GPL Recovery Exch.",   path:"dcs/echangeur de recuperation gpl.jpg"      },
  { id:"retour-condensat",   title:"Condensate Return",    path:"dcs/Retour Condensat train.jpg"             },
  { id:"fuel-gas",           title:"Fuel Gas System",      path:"dcs/fuel gas sys.jpg"                       },
];

/* ─── Manuals ────────────────────────────────────────────────────────────── */
const MANUALS = [
  { id:"S01", title:"MEA — Decarbonation",  driveId:"103T3eROqirYc2Go3xE0vbcr6i_9cjSDi" },
  { id:"S02", title:"Dehydration",           driveId:"19VBliziY8yD7_tM_81SbZIRe28kk7eNg"  },
  { id:"S03", title:"Propane Refrigeration", driveId:"1g7KrNzjLyQM6Ijp29ISkv_uATUecADIN"  },
  { id:"S04", title:"Feed Separation",       driveId:"1nBATg7dpHHiFOf3qNXR9ZOU6hUqSedEQ"  },
  { id:"S05", title:"MCR Refrigeration",     driveId:"1sWLzexkdPf7w42D_GaPK7KY1CzhoemM8"  },
  { id:"S06", title:"Liquefaction",          driveId:"1yxKUQGBv1yAO6wR4bftRwJU9L0aibCMh"  },
  { id:"S07", title:"Demethanizer",          driveId:"1jY5d8TgWrXvAOaQXdS4D3IQmYB9Xe_N_"  },
  { id:"S08", title:"Deethanizer",           driveId:"1mpQ-cEh2cqfegsWBU7oFN7Y8NurZoLRn"  },
  { id:"S09", title:"Depropanizer",          driveId:"1uOjwdUaVrwG_TSfoa14GmZzrTs-jkYCI"  },
  { id:"S10", title:"Debutaniser",           driveId:"1HdmaZ0YTR9Es9G-TT3Acby_L6R8Dr0MC"  },
];

/* ─── Instrument tags per DCS panel ─────────────────────────────────────── */
const INSTR: Record<string, string[]> = {
  "decarbonation-01": ["FIC101205","XV-101-223","LIC101204","TI101101","AI10138","TIC10125","LIC10121","PIC101215","TI101141","PIC10104","FI10105"],
  "decarbonation-2":  ["TI101115","LIC101218","TI101108","LI10113","TI101106","PIC10107","FIC10078","LIC10119","XV-100-271","FIC10176"],
  "dehydration-1":    ["101-F502","LIC10201","XV-102248","HV102172","TI102215","PDI10204A","TI102122","KV-102-13","KV-102-14","TI102762"],
  "dehydration-2":    ["TI102215","KV-10223","TI102214","KV-10222","TIC102208","PI102217","FIC102219","LIC10239","HIC102221"],
  "dehydration-3":    ["PI102149","PDI102153","PI102227","AAH102184","HIC102223","XV-102252","PDAH102229","PDALL102226"],
  "scrubber":         ["TI104102","TI104109","TIC10442","PI10412","LIC10417","FIC10409","TIC10413","LIC10421","FIC10449"],
  "propane-1":        ["TIC10304","FIC10301","XV-103-116","PIC103114A","TIC10313","TI103103","PI10307A","FIC10314"],
  "propane-2":        ["PI10321A","PIC10400","TI104112","LV10424A","LIC10424","LIC10401","TI103106","FIC10428"],
  "propane-3":        ["LV10435A","LIC10435","TI104104","TI104103","LV10440A","LIC10440","TI104113","ZI10442"],
  "liquefaction-2":   ["TIC10612","TI106123","TIC10611","ZI10610","PIC10610","FI10616A","AI106164","LIC10605"],
  "mcr-1":            ["FIC10505","FIC10503","FIC10504","SIC105231","PI105212","TI105101","TI105102","FIC10519","AI106164"],
  "mcr-2":            ["PI105312","SIC105331","TI105103","FIC10529","TI105104","XV-105-127","TI104113"],
  "mcr-3":            ["TI105102","PI105212","PI10515A","FIC10519","TI105101","HIC10519","FV-105-19"],
  "demethanisation":  ["XV-107-113","TI107101","TI107102","TIC10705","TI107106","LIC10709","FIC10713","FIC10715"],
  "deethanisation":   ["TI108106","PIC10802","TI108101","FIC10826","LIC10831","FIC10814","LIC10819","TIC10803"],
  "depropanisation":  ["PIC10901","PIC10912","TI109106","LIC10914","FIC10910","TI109101","TIC10902","LIC10916"],
  "debutanisation":   ["TI110106","PIC11009","FIC11000","TI110101","TIC11001","LIC11025","FIC11010","LIC11037"],
};

interface TagDef {
  id: string; diag: string; x: number; y: number;
  nameEn: string; nameFr: string;
  section: Section; dbTag: string | null;
  dcsPanels: string[]; manuals: string[];
  descEn: string; specs: Record<string, string>;
}

/* ══════════════════════════════════════════════════════════════════════════
   FULL EQUIPMENT LIST (25 tags)
   ══════════════════════════════════════════════════════════════════════════ */
const TAGS: TagDef[] = [
  /* ── FEED TREATMENT ──────────────────────────────── */
  {
    id:"F502", diag:"101-F502", x:4.5, y:21.2,
    nameEn:"MEA Absorber",          nameFr:"Absorbeur MEA",
    section:"treatment", dbTag:"X01-F-502",
    dcsPanels:["decarbonation-01","decarbonation-2","scrubber","general-train"],
    manuals:["S01"],
    descEn:"High-pressure MEA absorber — 55.8 m × 5.5 m. Removes CO₂ from feed gas to <50 ppmv (LNG grade). 81 bar, HIC carbon steel.",
    specs:{ Pressure:"81 bar", Mass:"147 050 kg", Volume:"173 m³", Serial:"35960-6", Status:"DEROGATION" },
  },
  {
    id:"F501", diag:"101-F501", x:11.3, y:32.3,
    nameEn:"MEA Regenerator",       nameFr:"Régénérateur MEA",
    section:"treatment", dbTag:"X01-F-501",
    dcsPanels:["decarbonation-01","decarbonation-2"],
    manuals:["S01"],
    descEn:"MEA regenerator (stripper) — 21 valve trays. Steam-heated kettle reboiler X01-E-502 strips CO₂ from rich amine at 8.4 bar / 121 °C.",
    specs:{ Pressure:"8.4 bar", Mass:"22 950 kg", Volume:"27 m³", Serial:"35959-6", Status:"DEROGATION" },
  },
  {
    id:"G507", diag:"101-G-507", x:5.5, y:55.9,
    nameEn:"MEA Flash Drum",        nameFr:"Ballon Flash MEA",
    section:"treatment", dbTag:"X01-G-507",
    dcsPanels:["decarbonation-01"],
    manuals:["S01"],
    descEn:"Horizontal flash drum — rich amine pressure let-down before regenerator. Recovers dissolved hydrocarbons from rich MEA.",
    specs:{ Pressure:"7.8 bar", Mass:"300 kg", Serial:"V-2089-F", Status:"PREVENTIVE" },
  },
  /* ── DEHYDRATION ─────────────────────────────────── */
  {
    id:"R0311", diag:"102-R03.11", x:16.8, y:15.3,
    nameEn:"Mol-Sieve Bed A",       nameFr:"Lit Tamis Mol. A",
    section:"dehydration", dbTag:"X02-R-03.12",
    dcsPanels:["dehydration-1","dehydration-2","dehydration-3"],
    manuals:["S02"],
    descEn:"Molecular sieve adsorption bed A (4A zeolite). Dries feed gas to <1 ppmv H₂O. Timed 8 h adsorption / 8 h regeneration cycle at 280 °C.",
    specs:{ Mass:"8 000 kg", Status:"PREVENTIVE" },
  },
  {
    id:"R0310", diag:"102-R03.10", x:21.7, y:16.8,
    nameEn:"Mol-Sieve Bed B",       nameFr:"Lit Tamis Mol. B",
    section:"dehydration", dbTag:"X02-R-03.12",
    dcsPanels:["dehydration-2","dehydration-3"],
    manuals:["S02"],
    descEn:"Molecular sieve bed B — on regeneration cycle while Bed A adsorbs. Hot regeneration gas at ~280 °C desorbs water.",
    specs:{ Mass:"8 000 kg", Status:"PREVENTIVE" },
  },
  {
    id:"R0312", diag:"102-R03.12", x:24.8, y:25.9,
    nameEn:"Mercury Guard Bed",     nameFr:"Lit de Démercurisation",
    section:"dehydration", dbTag:"X02-R-03.12",
    dcsPanels:["dehydration-3"],
    manuals:["S02"],
    descEn:"Sulphur-impregnated activated-carbon guard bed. Reduces mercury to <0.01 µg/Nm³ before cryogenic processing — protects aluminium MCHE.",
    specs:{ Status:"PREVENTIVE" },
  },
  /* ── PROPANE / SCRUBBING ─────────────────────────── */
  {
    id:"E0540", diag:"104-E05.40", x:41.1, y:22.2,
    nameEn:"MCR / Feed Pre-Chiller", nameFr:"Pré-refroidisseur MCR/Alim.",
    section:"propane", dbTag:"X04-E-05.40",
    dcsPanels:["propane-1","propane-2","scrubber"],
    manuals:["S03","S04"],
    descEn:"Shell & tube pre-chiller. Cools feed gas and MCR stream with propane refrigerant before scrub column and MCHE entry.",
    specs:{ Status:"DEROGATION" },
  },
  {
    id:"F0711", diag:"104-F07.11", x:33.5, y:36.6,
    nameEn:"Scrub Column",          nameFr:"Colonne de Lavage",
    section:"propane", dbTag:"X04-F-07.11",
    dcsPanels:["scrubber","propane-1","echangeur-recup-gpl"],
    manuals:["S04"],
    descEn:"Scrub column — removes C₅+ heavy hydrocarbons from feed before the MCHE. Prevents freeze-out in the main cryogenic exchanger at −162 °C.",
    specs:{ Mass:"15 000 kg", Status:"DEROGATION" },
  },
  {
    id:"G0785", diag:"104-G07.85", x:40.2, y:59.3,
    nameEn:"Propane HP Accumulator", nameFr:"Accumulateur Propane HP",
    section:"propane", dbTag:"X04-G-07.85",
    dcsPanels:["propane-1","propane-2"],
    manuals:["S03"],
    descEn:"HP propane accumulator — receives condensed liquid propane from CW condenser before HP expansion valve and MP chillers.",
    specs:{ Mass:"400 kg", Status:"DEROGATION" },
  },
  {
    id:"G0790", diag:"104-G07.90", x:46.9, y:59.3,
    nameEn:"Propane MP Flash Drum", nameFr:"Ballon Flash Propane MP",
    section:"propane", dbTag:"X04-G-07.90",
    dcsPanels:["propane-2","propane-3"],
    manuals:["S03"],
    descEn:"Medium-pressure propane flash drum — LP/MP separation stage. Flash gas returns to MP compressor suction; liquid feeds MP-level chillers.",
    specs:{ Mass:"400 kg", Status:"DEROGATION" },
  },
  {
    id:"G0791", diag:"104-G07.91", x:51.8, y:66.7,
    nameEn:"Propane LP Suction Drum", nameFr:"Ballon Aspiration BP Propane",
    section:"propane", dbTag:"X04-G-07.91",
    dcsPanels:["propane-3"],
    manuals:["S03"],
    descEn:"LP propane suction drum — protects LP compressor stage from liquid carry-over at the coldest propane level (~−35 °C).",
    specs:{ Mass:"400 kg", Status:"DEROGATION" },
  },
  /* ── LIQUEFACTION / MCR ──────────────────────────── */
  {
    id:"E0520", diag:"106-E05.20", x:50.6, y:17.3,
    nameEn:"Main Cryogenic Exch.",  nameFr:"Échangeur Cryogénique Princ.",
    section:"liquefaction", dbTag:"X06-E-05.30",
    dcsPanels:["liquefaction-1","liquefaction-2","mcr-1","mcr-2","mcr-3","general-train"],
    manuals:["S05","S06"],
    descEn:"MCHE — coil-wound cryogenic heat exchanger. Liquefies feed gas to −162 °C using mixed refrigerant (N₂/CH₄/C₂H₆/C₃H₈/C₄H₁₀). Core of the AP-C3MR™ process.",
    specs:{ Status:"DEROGATION" },
  },
  {
    id:"G0783", diag:"106-G07.83", x:65.7, y:15.2,
    nameEn:"MCR HP Separator",      nameFr:"Séparateur MCR HP",
    section:"liquefaction", dbTag:"X06-G-07.83",
    dcsPanels:["mcr-1","mcr-2","liquefaction-1"],
    manuals:["S05"],
    descEn:"HP MCR separator — splits mixed refrigerant into light vapour (N₂/CH₄/C₂H₆) fed to MCHE warm bundle and heavy liquid (C₃/C₄) fed separately.",
    specs:{ Mass:"400 kg", Status:"DEROGATION" },
  },
  {
    id:"G0788", diag:"105-G07.88", x:77.8, y:43.1,
    nameEn:"MCR LP Suction Drum",   nameFr:"Ballon Aspiration MCR BP",
    section:"liquefaction", dbTag:"X05-G-07.88",
    dcsPanels:["mcr-1","mcr-2"],
    manuals:["S05"],
    descEn:"MCR LP suction drum — separates mixed-refrigerant vapour returning from MCHE warm end before LP compressor stage.",
    specs:{ Mass:"400 kg", Status:"DEROGATION" },
  },
  {
    id:"G0789", diag:"K05-G07.89", x:87.2, y:49.0,
    nameEn:"MCR HP Suction Drum",   nameFr:"Ballon Aspiration MCR HP",
    section:"liquefaction", dbTag:"X05-G-07.89",
    dcsPanels:["mcr-3"],
    manuals:["S05"],
    descEn:"MCR HP suction drum — final liquid/vapour separation before HP compressor stage. Ensures dry gas enters HP impellers.",
    specs:{ Mass:"400 kg", Status:"DEROGATION" },
  },
  /* ── COMPRESSORS ─────────────────────────────────── */
  {
    id:"K110", diag:"103-K01.10", x:59.5, y:46.7,
    nameEn:"Propane Compressor",    nameFr:"Compresseur Propane",
    section:"compressor", dbTag:null,
    dcsPanels:["propane-1","propane-2","propane-3"],
    manuals:["S03"],
    descEn:"4-stage centrifugal propane compressor driven by condensing steam turbine. Circulates propane refrigerant through HP/MP/LP chilling levels.",
    specs:{},
  },
  {
    id:"G0786", diag:"103-G07.86", x:78.7, y:55.0,
    nameEn:"Propane LP Drum",       nameFr:"Ballon Propane BP",
    section:"propane", dbTag:"X03-G-07.86",
    dcsPanels:["propane-3"],
    manuals:["S03"],
    descEn:"Propane LP suction drum — lowest-pressure level of the propane refrigeration loop, feeds LP stage of compressor K01.10.",
    specs:{ Mass:"400 kg", Status:"DEROGATION" },
  },
  {
    id:"K120", diag:"105-K01.20", x:77.6, y:31.9,
    nameEn:"MCR Compressor LP/MP",  nameFr:"Compresseur MCR BP/MP",
    section:"compressor", dbTag:null,
    dcsPanels:["mcr-1","mcr-2","mcr-3"],
    manuals:["S05"],
    descEn:"MCR centrifugal compressor LP/MP bodies driven by steam turbine — first two compression stages of the mixed-refrigerant loop, with intercooling.",
    specs:{},
  },
  {
    id:"K121", diag:"105-K01.21", x:87.2, y:29.2,
    nameEn:"MCR Compressor HP",     nameFr:"Compresseur MCR HP",
    section:"compressor", dbTag:null,
    dcsPanels:["mcr-3"],
    manuals:["S05"],
    descEn:"MCR HP compressor body — final stage, discharges at ~44 bar. HP MCR passes through propane aftercooler before HP separator.",
    specs:{},
  },
  /* ── FRACTIONATION ───────────────────────────────── */
  {
    id:"F0721", diag:"107-F07.21", x:10.2, y:69.4,
    nameEn:"Demethaniser",          nameFr:"Déméthaniseur",
    section:"fractionation", dbTag:"X07-F-07.21",
    dcsPanels:["demethanisation","demethanisation-2","general-train"],
    manuals:["S07"],
    descEn:"Demethaniser — separates methane (LNG product) from C₂+ NGL. Overhead CH₄ recycles to liquefaction; bottoms feeds de-ethaniser.",
    specs:{ Mass:"15 000 kg", Status:"DEROGATION" },
  },
  {
    id:"F0731", diag:"108-F07.31", x:19.8, y:69.4,
    nameEn:"De-ethaniser",          nameFr:"Dééthaniseur",
    section:"fractionation", dbTag:"X08-F-07.31",
    dcsPanels:["deethanisation"],
    manuals:["S08"],
    descEn:"De-ethaniser — separates ethane (C₂) from propane/butane/gasoline. Ethane overhead is exported or re-injected; bottoms feeds depropaniser.",
    specs:{ Mass:"15 000 kg", Status:"DEROGATION" },
  },
  {
    id:"F0741", diag:"109-F07.41", x:34.8, y:69.4,
    nameEn:"Depropaniser",          nameFr:"Dépropaniseur",
    section:"fractionation", dbTag:"X09-F-07.41",
    dcsPanels:["depropanisation"],
    manuals:["S09"],
    descEn:"Depropaniser — separates propane (LPG) from butanes and natural gasoline. Propane overhead condensed and pumped to LPG storage.",
    specs:{ Mass:"15 000 kg", Status:"DEROGATION" },
  },
  {
    id:"F0751", diag:"110-F07.51", x:47.4, y:69.4,
    nameEn:"Debutaniser",           nameFr:"Débutaniseur",
    section:"fractionation", dbTag:"X10-F-07.51",
    dcsPanels:["debutanisation"],
    manuals:["S10"],
    descEn:"Debutaniser — separates butane (C₄) from natural gasoline (C₅+). Butane overhead → LPG blending; gasoline bottoms → export.",
    specs:{ Mass:"15 000 kg", Status:"DEROGATION" },
  },
];

/* ══════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════════════════════════════════ */
export default function SmartProcessFlow() {
  const { lang } = useI18n();
  const L = (en: string, fr: string) => lang === "fr" ? fr : en;

  const [selected,  setSelected]  = useState<TagDef | null>(null);
  const [filter,    setFilter]    = useState<Section | "all">("all");
  const [search,    setSearch]    = useState("");
  const [hovered,   setHovered]   = useState<string | null>(null);
  const [lightbox,  setLightbox]  = useState<{ url: string; title: string } | null>(null);
  const [scale,     setScale]     = useState(1);
  const [offset,    setOffset]    = useState({ x: 0, y: 0 });
  const [isMobile,  setIsMobile]  = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dashOpen,  setDashOpen]  = useState(false);

  const dragStart  = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);
  const wrapRef    = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const [viewportSize, setViewportSize] = useState({ w: 0, h: 0 });

  /* ── Detect mobile ── */
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  /* ── Viewport size observer (for pan clamping) ── */
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const ro = new ResizeObserver(entries => {
      for (const entry of entries) {
        setViewportSize({
          w: entry.contentRect.width,
          h: entry.contentRect.height,
        });
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  /* ── Zoom ── */
  const applyZoom = useCallback((delta: number) => {
    setScale(s => Math.min(6, Math.max(0.3, s + delta)));
  }, []);
  const resetView = () => { setScale(1); setOffset({ x: 0, y: 0 }); };

  /* ── Wheel ── */
  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    setScale(s => Math.min(6, Math.max(0.3, s - e.deltaY * 0.001)));
  }, []);
  
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, [handleWheel]);

  /* ── Pan clamping (keep diagram visible) ── */
  const clampOffset = useCallback((newOffset: { x: number; y: number }) => {
    const imgW = 1218;
    const imgH = 934;
    const containerW = viewportSize.w;
    const containerH = viewportSize.h;
    if (containerW === 0 || containerH === 0) return newOffset;

    const displayedW = imgW * scale;
    const displayedH = imgH * scale;
    const minVisible = 0.1;

    const maxX = (displayedW - containerW) * (1 - minVisible) + containerW * minVisible;
    const maxY = (displayedH - containerH) * (1 - minVisible) + containerH * minVisible;

    return {
      x: Math.max(-maxX, Math.min(maxX, newOffset.x)),
      y: Math.max(-maxY, Math.min(maxY, newOffset.y)),
    };
  }, [scale, viewportSize]);

  /* ── Pointer handlers ── */
  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    setIsDragging(false);
    dragStart.current = { x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y };
    (e.target as Element).setPointerCapture(e.pointerId);
  };
  
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragStart.current) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    const threshold = isMobile ? 12 : 4;
    if (Math.abs(dx) > threshold || Math.abs(dy) > threshold) {
      setIsDragging(true);
    }
    setOffset(clampOffset({
      x: dragStart.current.ox + dx,
      y: dragStart.current.oy + dy,
    }));
  };
  
  const onPointerUp = () => {
    dragStart.current = null;
    setTimeout(() => setIsDragging(false), 0);
  };

  /* ── Keyboard shortcuts ── */
  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setSelected(null); setLightbox(null); }
      if ((e.key === "+" || e.key === "=") && !e.ctrlKey) { e.preventDefault(); applyZoom(0.2); }
      if (e.key === "-" && !e.ctrlKey) { e.preventDefault(); applyZoom(-0.2); }
      if (e.key === "0") { e.preventDefault(); resetView(); }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [applyZoom]);

  const sc = selected ? SECT[selected.section] : null;

  /* ── Filter & search ── */
  const visibleTags = useMemo(() => {
    return TAGS.filter(t => {
      const matchSection = filter === "all" || t.section === filter;
      const query = search.toLowerCase().trim();
      const matchSearch = !query || 
        t.diag.toLowerCase().includes(query) || 
        t.id.toLowerCase().includes(query) ||
        t.nameEn.toLowerCase().includes(query) ||
        t.nameFr.toLowerCase().includes(query);
      return matchSection && matchSearch;
    });
  }, [filter, search]);

  /* ── Memoized coordinate map ── */
  const coordMap = useMemo(() => {
    const map = new Map<string, { x: number; y: number }>();
    TAGS.forEach(t => {
      const coord = getCoordinate(t.diag) ?? { x: t.x, y: t.y };
      map.set(t.id, coord);
    });
    return map;
  }, []);

  /* ── Dashboard search state ── */
  const [dashSearch, setDashSearch] = useState("");
  const dashboardTags = useMemo(() => {
    if (!dashSearch.trim()) return TAGS;
    const q = dashSearch.toLowerCase();
    return TAGS.filter(t =>
      t.diag.toLowerCase().includes(q) ||
      t.nameEn.toLowerCase().includes(q) ||
      t.nameFr.toLowerCase().includes(q) ||
      t.section.toLowerCase().includes(q)
    );
  }, [dashSearch]);

  return (
    <div
      style={{
        display: "flex", flexDirection: "column",
        height: "calc(100vh - 3.5rem)",
        background: "#030b12", color: "#fff",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      {/* ═══ TOP CONTROL SYSTEMS BAR ═══ */}
      <div style={{
        height: isMobile ? 84 : 48, flexShrink: 0,
        display: "flex", flexDirection: isMobile ? "column" : "row",
        alignItems: isMobile ? "stretch" : "center", gap: 10,
        padding: "6px 14px",
        borderBottom: "1px solid rgba(0,200,255,0.18)",
        background: "rgba(3,11,18,0.98)", backdropFilter: "blur(8px)",
        zIndex: 30,
      }}>
        {/* Hamburger button */}
        <button
          onClick={() => setDashOpen(prev => !prev)}
          style={{
            background: "rgba(0,200,255,0.05)",
            border: `1px solid ${dashOpen ? "#00c8ff" : "rgba(0,200,255,0.3)"}`,
            borderRadius: 4,
            color: "#00c8ff",
            padding: 4,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            flexShrink: 0,
            width: 32,
            height: 32,
          }}
          aria-label={L("Dashboard", "Tableau de bord")}
        >
          <Menu size={16} />
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1 }}>
          <div style={{ display:"flex", alignItems:"center", gap:6, flexShrink:0 }}>
            <Layers size={13} style={{ color:"#00c8ff" }} />
            {!isMobile && (
              <span style={{ fontFamily:"monospace", fontSize:9, textTransform:"uppercase",
                letterSpacing:"0.12em", color:"rgba(255,255,255,0.35)", whiteSpace:"nowrap" }}>
                GNL1Z · AP-C3MR™
              </span>
            )}
          </div>

          <div style={{ position: "relative", flex: isMobile ? "1" : "none", width: isMobile ? "auto" : "210px" }}>
            <Search size={12} style={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.3)" }} />
            <input 
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={L("Search engineering tags...", "Filtrer les repères...")}
              style={{
                width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(0,200,255,0.15)",
                borderRadius: 4, padding: "4px 8px 4px 26px", fontSize: 11, color: "#fff", outline: "none",
                fontFamily: "monospace"
              }}
            />
            {search && (
              <button onClick={() => setSearch("")} style={{ position: "absolute", right: 6, top: "50%", transform: "translateY(-50%)", background: "transparent", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer" }}>
                <X size={10} />
              </button>
            )}
          </div>
        </div>

        <div style={{ display:"flex", gap:4, overflowX:"auto", flexShrink:1, alignItems: "center",
          scrollbarWidth:"none", msOverflowStyle:"none" }}>
          {(["all", ...Object.keys(SECT)] as (Section | "all")[]).map(s => {
            const active = filter === s;
            const color  = s === "all" ? "#fff"         : SECT[s as Section].color;
            const bg     = s === "all" ? "rgba(255,255,255,0.1)" : SECT[s as Section].bg;
            const bord   = s === "all" ? "rgba(255,255,255,0.2)" : SECT[s as Section].border;
            const lbl    = s === "all" ? "ALL" : L(SECT[s as Section].en, SECT[s as Section].fr);
            return (
              <button key={s} onClick={() => setFilter(s)}
                style={{
                  fontFamily: "monospace", fontSize: 9,
                  textTransform: "uppercase", letterSpacing: "0.06em",
                  padding: "3px 8px", borderRadius: 3, cursor: "pointer", flexShrink: 0,
                  border: `1px solid ${active ? bord : "rgba(255,255,255,0.1)"}`,
                  background: active ? bg : "transparent",
                  color: active ? color : "rgba(255,255,255,0.3)",
                  transition: "all 0.12s",
                }}>
                {lbl}
              </button>
            );
          })}

          <div style={{ display:"flex", alignItems:"center", gap:4, marginLeft: isMobile ? 12 : "auto", flexShrink:0 }}>
            {[
              { icon:<ZoomIn size={11}/>,    fn:() => applyZoom(0.25) },
              { icon:<ZoomOut size={11}/>,   fn:() => applyZoom(-0.25) },
              { icon:<RotateCcw size={11}/>, fn:resetView },
            ].map((b, i) => (
              <button key={i} onClick={b.fn} style={{
                background:"transparent", border:"1px solid rgba(0,200,255,0.2)",
                borderRadius:3, color:"rgba(255,255,255,0.45)",
                width:24, height:24, display:"grid", placeItems:"center", cursor:"pointer",
              }}>{b.icon}</button>
            ))}
            {!isMobile && (
              <span style={{ fontFamily:"monospace", fontSize:9, color:"rgba(255,255,255,0.25)", width:36, textAlign:"right" }}>
                {Math.round(scale * 100)}%
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ═══ INTERACTIVE PROCESS VIEWPORT CANVAS ═══ */}
      <div style={{ flex:1, display:"flex", minHeight:0, position:"relative" }} ref={viewportRef}>
        
        <div
          ref={wrapRef}
          style={{
            flex:1, position:"relative", overflow:"hidden",
            cursor: isDragging ? "grabbing" : "crosshair",
            touchAction: "none",
          }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
          onClick={() => { if (!isDragging) setSelected(null); }}
        >
          <div style={{
            position:"absolute", inset:0,
            transform:`translate(${offset.x}px,${offset.y}px) scale(${scale})`,
            transformOrigin:"center center",
            transition: isDragging ? "none" : "transform 0.06s ease-out",
            display: "grid",
            placeItems: "center"
          }}>
            
            <div style={{
              position: "relative",
              width: "100%",
              maxWidth: "1218px",
              aspectRatio: "1218 / 934",
              boxShadow: "0 20px 60px rgba(0,0,0,0.5)"
            }}>
              <img
                src="/pfd/gnl1z-pfd-labeled.png"
                alt="GNL1Z Labeled Process Flow Diagram"
                draggable={false}
                onError={e => {
                  if ((e.target as HTMLImageElement).src !== "/pfd/gnl1z-pfd.jpg") {
                    (e.target as HTMLImageElement).src = "/pfd/gnl1z-pfd.jpg";
                  }
                }}
                style={{
                  width:"100%", height:"100%", display:"block",
                  filter:"brightness(0.85) contrast(1.08) saturate(0.9)",
                  userSelect:"none", pointerEvents:"none",
                }}
              />

              {/* ═══ VECTOR TAG OVERLAY ═══ */}
              {visibleTags.map(t => {
                const isActive = selected?.id === t.id;
                const isHov    = hovered === t.id;
                const c        = SECT[t.section];
                const coord     = coordMap.get(t.id);
                if (!coord || coord.x === undefined || coord.y === undefined) return null;

                return (
                  <div 
                    key={t.id}
                    style={{
                      position: "absolute",
                      left: `${coord.x}%`,
                      top: `${coord.y}%`,
                      transform: "translate(-50%, -50%)",
                      zIndex: isActive ? 25 : isHov ? 20 : 10,
                    }}
                  >
                    {DEBUG_COORDINATES && (
                      <div style={{
                        position: "absolute", left: 0, top: 0, width: 6, height: 6,
                        borderRadius: "50%", background: "#ff4d6a", transform: "translate(-50%, -50%)",
                        boxShadow: "0 0 4px #ff4d6a", pointerEvents: "none"
                      }} />
                    )}

                    <button
                      onMouseEnter={() => setHovered(t.id)}
                      onMouseLeave={() => setHovered(null)}
                      onPointerDown={e => e.stopPropagation()}
                      onClick={e => {
                        e.stopPropagation();
                        setSelected(isActive ? null : t);
                      }}
                      aria-label={t.diag + ' – ' + L(t.nameEn, t.nameFr)}
                      style={{
                        fontFamily: "monospace",
                        fontSize: isMobile ? 9 : 10,
                        lineHeight: 1.25,
                        whiteSpace: "nowrap",
                        padding: isMobile ? "3px 7px" : "2px 6px",
                        borderRadius: 3,
                        cursor: "pointer",
                        border: `1px solid ${isActive || isHov ? c.border : "rgba(0,200,255,0.3)"}`,
                        background: isActive ? c.bg : isHov ? "rgba(0,200,255,0.12)" : "rgba(3,11,18,0.85)",
                        color: isActive || isHov ? c.color : "rgba(255,255,255,0.75)",
                        backdropFilter: "blur(4px)",
                        boxShadow: isActive ? `0 0 14px ${c.border}` : isHov ? "0 0 8px rgba(0,200,255,0.28)" : "none",
                        transition: "all 0.12s",
                        userSelect: "none",
                        WebkitTapHighlightColor: "transparent",
                        transform: `scale(${isActive ? 1.12 : isHov ? 1.05 : 1})`,
                      }}
                    >
                      {t.diag}
                    </button>
                  </div>
                );
              })}
            </div>

          </div>
        </div>

        {/* ── DESKTOP EQUIPMENT PANEL ── */}
        {!isMobile && selected && sc && (
          <div style={{
            width: 380, borderLeft: "1px solid rgba(0,200,255,0.15)",
            background: "rgba(4,12,22,0.98)", backdropFilter: "blur(12px)",
            display: "flex", flexDirection: "column", zIndex: 28,
          }}>
            <div style={{ padding: 16, borderBottom: "1px solid rgba(255,255,255,0.08)", display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
              <div>
                <span style={{ fontFamily:"monospace", fontSize:10, color:sc.color }}>{selected.diag}</span>
                <h2 style={{ fontSize:18, fontWeight:600, margin:"4px 0" }}>{L(selected.nameEn, selected.nameFr)}</h2>
                <span style={{ fontSize:10, padding:"2px 6px", borderRadius:2, border:`1px solid ${sc.border}`, background:sc.bg, color:sc.color, textTransform:"uppercase", fontFamily:"monospace" }}>
                  {L(sc.en, sc.fr)}
                </span>
              </div>
              <button onClick={() => setSelected(null)} style={{ background:"transparent", border:"none", color:"rgba(255,255,255,0.4)", cursor:"pointer" }}><X size={16}/></button>
            </div>
            <div style={{ flex:1, overflowY:"auto", padding:16 }}>
              <PanelContent tag={selected} lang={lang} onPreviewDcs={(title, path) => setLightbox({ url: dcsUrl(path), title })} />
            </div>
          </div>
        )}

        {/* ── MOBILE BOTTOM SHEET ── */}
        {isMobile && selected && sc && (
          <div
            style={{
              position: "absolute", bottom: 0, left: 0, right: 0,
              background: "rgba(5,14,24,0.98)", borderTop: `2px solid ${sc.border}`,
              borderRadius: "14px 14px 0 0", zIndex: 40, maxHeight: "62vh",
              display: "flex", flexDirection: "column", backdropFilter: "blur(12px)",
              boxShadow: "0 -8px 32px rgba(0,0,0,0.6)",
            }}
          >
            <div style={{ display:"flex", justifyContent:"center", padding:"8px 0 4px" }}>
              <div style={{ width:36, height:4, borderRadius:2, background:"rgba(255,255,255,0.2)" }}/>
            </div>
            <div style={{ padding:"0 16px 10px", display:"flex", alignItems:"flex-start", justifyContent:"space-between" }}>
              <div>
                <div style={{ fontFamily:"monospace", fontSize:9, color:"rgba(255,255,255,0.35)" }}>{selected.diag}</div>
                <div style={{ fontWeight:700, fontSize:17 }}>{L(selected.nameEn, selected.nameFr)}</div>
              </div>
              <button onClick={() => setSelected(null)} style={{ background:"transparent", border:"1px solid rgba(255,255,255,0.15)", borderRadius:4, color:"rgba(255,255,255,0.4)", width:26, height:26, display:"grid", placeItems:"center" }}><X size={12}/></button>
            </div>
            <div style={{ flex:1, overflowY:"auto", padding:"0 16px 20px" }}>
              <PanelContent tag={selected} lang={lang} onPreviewDcs={(title, path) => setLightbox({ url: dcsUrl(path), title })} />
            </div>
          </div>
        )}
      </div>

      {/* ═══ DASHBOARD DRAWER ═══ */}
      {dashOpen && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            bottom: 0,
            width: isMobile ? "100%" : 320,
            background: "rgba(4,12,22,0.98)",
            backdropFilter: "blur(12px)",
            borderRight: "1px solid rgba(0,200,255,0.2)",
            zIndex: 50,
            display: "flex",
            flexDirection: "column",
            boxShadow: "2px 0 20px rgba(0,0,0,0.5)",
          }}
        >
          <div style={{ padding: 12, borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontFamily: "monospace", fontSize: 12, textTransform: "uppercase", color: "#00c8ff", fontWeight: "bold" }}>
              {L("Equipment Dashboard", "Tableau de Bord")}
            </span>
            <button onClick={() => setDashOpen(false)} style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer" }}>
              <X size={14} />
            </button>
          </div>

          <div style={{ padding: "6px 12px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
            <div style={{ position: "relative" }}>
              <Search size={12} style={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.3)" }} />
              <input
                type="text"
                value={dashSearch}
                onChange={e => setDashSearch(e.target.value)}
                placeholder={L("Search all equipment...", "Rechercher un équipement...")}
                style={{
                  width: "100%",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(0,200,255,0.15)",
                  borderRadius: 4,
                  padding: "4px 8px 4px 26px",
                  fontSize: 11,
                  color: "#fff",
                  outline: "none",
                  fontFamily: "monospace"
                }}
              />
            </div>
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: 8, display: "flex", flexDirection: "column", gap: 12 }}>
            {(["treatment","dehydration","propane","liquefaction","fractionation","compressor"] as Section[]).map(section => {
              const tags = dashboardTags.filter(t => t.section === section);
              if (tags.length === 0) return null;
              const secColor = SECT[section].color;
              return (
                <div key={section} style={{ marginBottom: 4 }}>
                  <div style={{ fontSize: 10, fontFamily: "monospace", color: secColor, textTransform: "uppercase", padding: "4px 6px", borderBottom: `1px solid ${secColor}22`, fontWeight: "bold", marginBottom: 4 }}>
                    {L(SECT[section].en, SECT[section].fr)}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    {tags.map(t => {
                      const isSelected = selected?.id === t.id;
                      return (
                        <button
                          key={t.id}
                          onClick={() => { 
                            setSelected(t); 
                            setDashOpen(false); 
                          }}
                          style={{
                            display: "flex",
                            width: "100%",
                            alignItems: "center",
                            justifyContent: "space-between",
                            textAlign: "left",
                            background: isSelected ? "rgba(0,200,255,0.1)" : "rgba(255,255,255,0.01)",
                            border: `1px solid ${isSelected ? "rgba(0,200,255,0.25)" : "transparent"}`,
                            color: isSelected ? "#00c8ff" : "rgba(255,255,255,0.85)",
                            padding: "6px 8px",
                            cursor: "pointer",
                            borderRadius: 4,
                            fontSize: 12,
                            fontFamily: "monospace",
                            transition: "all 0.1s",
                          }}
                          onMouseEnter={() => setHovered(t.id)}
                          onMouseLeave={() => setHovered(null)}
                        >
                          <span style={{ fontWeight: "bold" }}>{t.diag}</span>
                          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", fontFamily: "sans-serif", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "60%" }}>
                            {L(t.nameEn, t.nameFr)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ═══ LIGHTBOX FOR DCS SCREENSHOTS ═══ */}
      {lightbox && (
        <div 
          onClick={() => setLightbox(null)}
          style={{
            position:"fixed", inset:0, background:"rgba(2,6,12,0.94)",
            display:"grid", placeItems:"center", zIndex:200, padding:20, backdropFilter:"blur(6px)"
          }}
        >
          <div style={{ position:"relative", maxWidth:"95vw", maxHeight:"90vh" }} onClick={e => e.stopPropagation()}>
            <div style={{ position:"absolute", top:-32, left:0, right:0, display:"flex", justifyContent:"space-between", color:"#fff" }}>
              <span style={{ fontFamily:"monospace", fontSize:12 }}>{lightbox.title}</span>
              <button onClick={() => setLightbox(null)} style={{ background:"transparent", border:"none", color:"#fff", cursor:"pointer" }}><X size={16}/></button>
            </div>
            <img src={lightbox.url} alt="DCS Console Screen Preview" style={{ width:"100%", height:"100%", objectFit:"contain", border:"1px solid rgba(255,255,255,0.12)", borderRadius:4 }} />
          </div>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   FULL DETAIL PANEL (PanelContent)
   ══════════════════════════════════════════════════════════════════════════ */
function PanelContent({ tag, lang, onPreviewDcs }: { tag: TagDef; lang: string; onPreviewDcs: (title: string, path: string) => void }) {
  const L = (en: string, fr: string) => lang === "fr" ? fr : en;
  
  const filteredDcs = useMemo(() => DCS.filter(d => tag.dcsPanels.includes(d.id)), [tag.dcsPanels]);
  const filteredManuals = useMemo(() => MANUALS.filter(m => tag.manuals.includes(m.id)), [tag.manuals]);
  const linkedInstruments = useMemo(() => {
    return [...new Set(tag.dcsPanels.flatMap(pid => INSTR[pid] ?? []))].slice(0, 24);
  }, [tag.dcsPanels]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Description */}
      <div>
        <h4 style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontFamily: "monospace", textTransform: "uppercase", marginBottom: 4 }}>
          {L("Equipment Description", "Description de l'Équipement")}
        </h4>
        <p style={{ fontSize: 13, lineHeight: 1.4, color: "rgba(255,255,255,0.85)" }}>{tag.descEn}</p>
      </div>

      {/* Specs table */}
      {Object.keys(tag.specs).length > 0 && (
        <div>
          <h4 style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontFamily: "monospace", textTransform: "uppercase", marginBottom: 6 }}>
            {L("Technical Details", "Détails Techniques")}
          </h4>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {Object.entries(tag.specs).map(([key, val]) => (
              <div key={key} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, borderBottom: "1px solid rgba(255,255,255,0.04)", paddingBottom: 3 }}>
                <span style={{ color: "rgba(255,255,255,0.5)" }}>{key}</span>
                <span style={{ fontFamily: "monospace", fontWeight: 500, color: key === "Status" && val === "DEROGATION" ? "#ff4d6a" : "#fff" }}>{val}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DCS panels */}
      {filteredDcs.length > 0 && (
        <div>
          <h4 style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontFamily: "monospace", textTransform: "uppercase", marginBottom: 6 }}>
            {L("Linked DCS Panels", "Écrans DCS Associés")} ({filteredDcs.length})
          </h4>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
            {filteredDcs.map(d => (
              <button
                key={d.id}
                onClick={() => onPreviewDcs(d.title, d.path)}
                style={{
                  background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 4, padding: "6px 8px", textAlign: "left", cursor: "pointer",
                  color: "#00c8ff", display: "flex", alignItems: "center", justifyContent: "space-between"
                }}
              >
                <span style={{ fontSize: 11, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginRight: 4 }}>{d.title}</span>
                <ExternalLink size={10} style={{ opacity: 0.7, flexShrink: 0 }} />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Telemetry tags */}
      {linkedInstruments.length > 0 && (
        <div>
          <h4 style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontFamily: "monospace", textTransform: "uppercase", marginBottom: 6 }}>
            {L("Telemetry Tags", "Instruments de Télémesure")}
          </h4>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4, maxHeight: "110px", overflowY: "auto", paddingRight: 4 }}>
            {linkedInstruments.map(ins => (
              <span key={ins} style={{ fontFamily: "monospace", fontSize: 10, background: "rgba(0,229,160,0.08)", border: "1px solid rgba(0,229,160,0.2)", color: "#00e5a0", padding: "1px 4px", borderRadius: 2 }}>
                {ins}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Manuals */}
      {filteredManuals.length > 0 && (
        <div>
          <h4 style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontFamily: "monospace", textTransform: "uppercase", marginBottom: 6 }}>
            {L("Operational Manuals", "Manuels Opérationnels")}
          </h4>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {filteredManuals.map(m => (
              <a
                key={m.id}
                href={`https://drive.google.com/file/d/${m.driveId}/view`}
                target="_blank" rel="noopener noreferrer"
                style={{
                  display: "flex", alignItems: "center", gap: 8, fontSize: 12,
                  color: "#fb923c", textDecoration: "none", background: "rgba(251,146,60,0.05)",
                  border: "1px solid rgba(251,146,60,0.15)", borderRadius: 4, padding: "6px 10px"
                }}
              >
                <BookOpen size={12} />
                <span style={{ flex: 1 }}>{m.title}</span>
                <ExternalLink size={10} />
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
    }
