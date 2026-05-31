import { useState, useRef, useCallback, useEffect } from "react";
import { Link } from "react-router-dom";
import { useI18n } from "@/contexts/I18nContext";
import { getEquipmentByTag } from "@/data";
import { ZoomIn, ZoomOut, RotateCcw, X, Layers, ExternalLink, BookOpen, Cpu } from "lucide-react";

/* ─── Supabase storage base ─────────────────────────────────────────────── */
const SB = "https://gdkqetzkhgllwbpmqmux.supabase.co/storage/v1/object/public/equipment-images";
const dcsUrl = (p: string) => `${SB}/${p.split("/").map(encodeURIComponent).join("/")}`;

/* ─── Section theme ─────────────────────────────────────────────────────── */
type Section = "treatment" | "dehydration" | "propane" | "liquefaction" | "fractionation" | "compressor";

const SECT: Record<Section, { label: string; labelFr: string; color: string; bg: string; border: string }> = {
  treatment:    { label:"Feed Treatment",     labelFr:"Traitement Gaz",      color:"#00e5a0", bg:"rgba(0,229,160,0.15)",  border:"rgba(0,229,160,0.5)"  },
  dehydration:  { label:"Dehydration",        labelFr:"Déshydratation",       color:"#38bdf8", bg:"rgba(56,189,248,0.15)", border:"rgba(56,189,248,0.5)" },
  propane:      { label:"Propane / Pre-cool", labelFr:"Propane / Pré-refr.", color:"#fb923c", bg:"rgba(251,146,60,0.15)", border:"rgba(251,146,60,0.5)" },
  liquefaction: { label:"Liquefaction",       labelFr:"Liquéfaction",         color:"#a78bfa", bg:"rgba(167,139,250,0.15)",border:"rgba(167,139,250,0.5)"},
  fractionation:{ label:"Fractionation",      labelFr:"Fractionnement",       color:"#ffb020", bg:"rgba(255,176,32,0.15)", border:"rgba(255,176,32,0.5)" },
  compressor:   { label:"Compression",        labelFr:"Compression",          color:"#ff4d6a", bg:"rgba(255,77,106,0.15)", border:"rgba(255,77,106,0.5)" },
};

/* ─── DCS panels ────────────────────────────────────────────────────────── */
const DCS = [
  { id:"general-train",      title:"General Train",         path:"dcs/general train.jpg"                       },
  { id:"decarbonation-01",   title:"Decarbonation MEA 1",   path:"dcs/decarbonation-01.jpg"                    },
  { id:"decarbonation-2",    title:"Decarbonation MEA 2",   path:"dcs/decarbonation-2.jpg"                     },
  { id:"dehydration-1",      title:"Dehydration 1",         path:"dcs/dehydration-1.jpg"                       },
  { id:"dehydration-2",      title:"Dehydration 2",         path:"dcs/dehydration-2.jpg"                       },
  { id:"dehydration-3",      title:"Dehydration 3",         path:"dcs/dehydration-3.jpg"                       },
  { id:"scrubber",           title:"Inlet Scrubber",        path:"dcs/scrubber.jpg"                            },
  { id:"propane-1",          title:"Propane Loop 1",        path:"dcs/propane-1.jpg"                           },
  { id:"propane-2",          title:"Propane Loop 2",        path:"dcs/propane-2.jpg"                           },
  { id:"propane-3",          title:"Propane Loop 3",        path:"dcs/propane-3.jpg"                           },
  { id:"liquefaction-1",     title:"Liquefaction 1",        path:"dcs/liquefaction-1.jpg"                      },
  { id:"liquefaction-2",     title:"Liquefaction 2",        path:"dcs/liquefaction-2.jpg"                      },
  { id:"mcr-1",              title:"MCR Refrigeration 1",   path:"dcs/MCR-1.jpg"                               },
  { id:"mcr-2",              title:"MCR Refrigeration 2",   path:"dcs/MCR-2.jpg"                               },
  { id:"mcr-3",              title:"MCR Refrigeration 3",   path:"dcs/MCR-3.jpg"                               },
  { id:"demethanisation",    title:"Demethaniser",          path:"dcs/demethanisation.jpg"                     },
  { id:"demethanisation-2",  title:"Demethaniser 2",        path:"dcs/demethanisation-2.jpg"                   },
  { id:"deethanisation",     title:"Deethaniser",           path:"dcs/deethanisation.jpg"                      },
  { id:"depropanisation",    title:"Depropaniser",          path:"dcs/depropanisation.jpg"                     },
  { id:"debutanisation",     title:"Debutaniser",           path:"dcs/debutanisation.jpg"                      },
  { id:"echangeur-recup-gpl",title:"GPL Recovery Exch.",    path:"dcs/echangeur de recuperation gpl.jpg"       },
  { id:"retour-condensat",   title:"Condensate Return",     path:"dcs/Retour Condensat train.jpg"              },
  { id:"fuel-gas",           title:"Fuel Gas System",       path:"dcs/fuel gas sys.jpg"                        },
];

/* ─── Manuals ───────────────────────────────────────────────────────────── */
const MANUALS = [
  { id:"S01", title:"MEA — Decarbonation",   driveId:"103T3eROqirYc2Go3xE0vbcr6i_9cjSDi" },
  { id:"S02", title:"Dehydration",            driveId:"19VBliziY8yD7_tM_81SbZIRe28kk7eNg"  },
  { id:"S03", title:"Propane Refrigeration",  driveId:"1g7KrNzjLyQM6Ijp29ISkv_uATUecADIN"  },
  { id:"S04", title:"Feed Separation",        driveId:"1nBATg7dpHHiFOf3qNXR9ZOU6hUqSedEQ"  },
  { id:"S05", title:"MCR Refrigeration",      driveId:"1sWLzexkdPf7w42D_GaPK7KY1CzhoemM8"  },
  { id:"S06", title:"Liquefaction",           driveId:"1yxKUQGBv1yAO6wR4bftRwJU9L0aibCMh"  },
  { id:"S07", title:"Demethanizer",           driveId:"1jY5d8TgWrXvAOaQXdS4D3IQmYB9Xe_N_"  },
  { id:"S08", title:"Deethanizer",            driveId:"1mpQ-cEh2cqfegsWBU7oFN7Y8NurZoLRn"  },
  { id:"S09", title:"Depropanizer",           driveId:"1uOjwdUaVrwG_TSfoa14GmZzrTs-jkYCI"  },
  { id:"S10", title:"Debutaniser",            driveId:"1HdmaZ0YTR9Es9G-TT3Acby_L6R8Dr0MC"  },
];

/* ─── Instrument tags per DCS panel ─────────────────────────────────────── */
const INSTR: Record<string, string[]> = {
  "decarbonation-01": ["FIC101205","XV-101-223","LIC101204","TI101101","AI10138","TIC10125","LIC10121","PIC101215","TI101141","PIC10104","FI10105"],
  "decarbonation-2":  ["TI101115","LIC101218","TI101108","LI10113","TI101106","PIC10107","FIC10078","LIC10119","XV-100-271","FIC10176"],
  "dehydration-1":    ["101-F502","LIC10201","XV-102248","HV102172","TI102215","PDI10204A","TI102122","KV-102-13","KV-102-14","TI102762","HV102173"],
  "dehydration-2":    ["TI102215","KV-10223","TI102214","KV-10222","TIC102208","PI102217","FIC102219","LIC10239","HIC102221","LIC102167"],
  "dehydration-3":    ["PI102149","PDI102153","PI102227","AAH102184","HIC102223","XV-102252","PDAH102229","PDALL102226"],
  "scrubber":         ["TI104102","TI104109","TIC10442","PI10412","LIC10417","FIC10409","TIC10413","LIC10421","LI10468","FIC10449"],
  "propane-1":        ["TIC10304","FIC10301","XV-103-116","SI103231A","PIC103114A","TIC10313","TI103103","PI10307A","FIC10314"],
  "propane-2":        ["PI10321A","PIC10400","TI104112","LV10424A","LIC10424","LIC10401","TI103106","FIC10428"],
  "propane-3":        ["LV10435A","LIC10435","TI104104","TI104103","LV10440A","LIC10440","TI104113","ZI10442"],
  "liquefaction-2":   ["TIC10612","TI106123","TIC10611","ZI10610","PIC10610","FI10616A","AI106164","LIC10605","HIC10604"],
  "mcr-1":            ["FIC10505","FIC10503","FIC10504","SIC105231","PI105212","TI105101","TI105102","FIC10519","AI106164"],
  "mcr-2":            ["PI105312","SIC105331","TI105103","FIC10529","TI105104","XV-105-127","TI104113","XV-105-118"],
  "mcr-3":            ["TI105102","PI105212","PI10515A","FIC10519","TI105101","HIC10519","FV-105-19"],
  "demethanisation":  ["XV-107-113","TI107101","TI107102","TIC10705","TI107106","LIC10709","FIC10713","FIC10715"],
  "deethanisation":   ["TI108106","PIC10802","TI108101","FIC10826","LIC10831","FIC10814","LIC10819","TIC10803"],
  "depropanisation":  ["PIC10901","PIC10912","TI109106","LIC10914","FIC10910","TI109101","TIC10902","LIC10916"],
  "debutanisation":   ["TI110106","PIC11009","FIC11000","TI110101","TIC11001","LIC11025","FIC11010","LIC11037","FIC11020"],
};

/* ─── Tag hotspot data ───────────────────────────────────────────────────── */
/*
  x / y = percentage offsets from top-left of the PFD image.
  Calibrated by reading label positions directly from Image 2 (1218×934 px).
  Each printed tag in the diagram becomes the clickable button.
*/
interface TagDef {
  id: string; diag: string; x: number; y: number;
  nameEn: string; nameFr: string;
  section: Section; dbTag: string | null;
  dcsPanels: string[]; manuals: string[];
  descEn: string;
  specs: Record<string, string>;
}

const TAGS: TagDef[] = [
  /* ── FEED TREATMENT ── */
  { id:"F502",   diag:"101-F502",    x:5.0,  y:20.5,
    nameEn:"MEA Absorber",            nameFr:"Absorbeur MEA",
    section:"treatment",  dbTag:"X01-F-502",
    dcsPanels:["decarbonation-01","decarbonation-2","scrubber","general-train"], manuals:["S01"],
    descEn:"High-pressure MEA absorber — 55.8 m × 5.5 m. Removes CO₂ from feed gas to <50 ppmv (LNG grade). 81 bar operating pressure. HIC carbon steel.",
    specs:{ Pressure:"81 bar", Mass:"147,050 kg", Volume:"173 m³", Serial:"35960-6", Status:"DEROGATION" } },

  { id:"F501",   diag:"101-F501",    x:13.0, y:32.5,
    nameEn:"MEA Regenerator",         nameFr:"Régénérateur MEA",
    section:"treatment",  dbTag:"X01-F-501",
    dcsPanels:["decarbonation-01","decarbonation-2"], manuals:["S01"],
    descEn:"MEA regenerator (stripper) — 21 valve trays. Steam-heated kettle reboiler X01-E-502 strips CO₂ from rich amine. 8.4 bar, 121 °C.",
    specs:{ Pressure:"8.4 bar", Mass:"22,950 kg", Volume:"27 m³", Serial:"35959-6", Status:"DEROGATION" } },

  { id:"G507",   diag:"101-G-507",   x:5.5,  y:58.5,
    nameEn:"MEA Flash Drum",          nameFr:"Ballon Flash MEA",
    section:"treatment",  dbTag:"X01-G-507",
    dcsPanels:["decarbonation-01"], manuals:["S01"],
    descEn:"Horizontal flash drum — rich amine pressure let-down before regenerator. Recovers dissolved hydrocarbons from rich MEA.",
    specs:{ Pressure:"7.8 bar", Mass:"300 kg", Serial:"V-2089-F", Status:"PREVENTIVE" } },

  /* ── DEHYDRATION ── */
  { id:"R0311",  diag:"102-R03.11",  x:18.5, y:15.0,
    nameEn:"Mol-Sieve Bed A",         nameFr:"Lit Tamis Moléculaire A",
    section:"dehydration", dbTag:"X02-R-03.12",
    dcsPanels:["dehydration-1","dehydration-2","dehydration-3"], manuals:["S02"],
    descEn:"Molecular sieve adsorption bed (4A zeolite). Dries feed gas to <1 ppmv H₂O. Twin-bed timed cycle — adsorption 8 h / regeneration 8 h at 280 °C.",
    specs:{ Mass:"8,000 kg", Status:"PREVENTIVE" } },

  { id:"R0310",  diag:"102-R03.10",  x:25.5, y:17.5,
    nameEn:"Mol-Sieve Bed B",         nameFr:"Lit Tamis Moléculaire B",
    section:"dehydration", dbTag:"X02-R-03.12",
    dcsPanels:["dehydration-2","dehydration-3"], manuals:["S02"],
    descEn:"Second mol-sieve bed — on regeneration cycle when Bed A is adsorbing. Regeneration gas heater raises temperature to ~280 °C.",
    specs:{ Mass:"8,000 kg", Status:"PREVENTIVE" } },

  { id:"R0312",  diag:"102-R03.12",  x:30.5, y:25.0,
    nameEn:"Mercury Guard Bed",       nameFr:"Lit de Démercurisation",
    section:"dehydration", dbTag:"X02-R-03.12",
    dcsPanels:["dehydration-3"], manuals:["S02"],
    descEn:"Sulphur-impregnated activated-carbon guard bed. Reduces mercury to <0.01 µg/Nm³ before cryogenic processing to protect aluminium MCHE.",
    specs:{ Status:"PREVENTIVE" } },

  /* ── PROPANE / SCRUBBING ── */
  { id:"E0540",  diag:"104-E05.40",  x:44.0, y:22.0,
    nameEn:"MCR / Feed Pre-Chiller",  nameFr:"Pré-refroidisseur MCR/Alim.",
    section:"propane",    dbTag:"X04-E-05.40",
    dcsPanels:["propane-1","propane-2","scrubber"], manuals:["S03","S04"],
    descEn:"Shell & tube pre-chiller. Cools feed gas and MCR liquid stream with propane refrigerant before scrub column and MCHE entry.",
    specs:{ Status:"DEROGATION" } },

  { id:"F0711",  diag:"104-F07.11",  x:37.5, y:37.0,
    nameEn:"Scrub Column",            nameFr:"Colonne de Lavage",
    section:"propane",    dbTag:"X04-F-07.11",
    dcsPanels:["scrubber","propane-1","echangeur-recup-gpl"], manuals:["S04"],
    descEn:"Scrub column — removes C₅+ heavy hydrocarbons from feed before the MCHE. Prevents freeze-out in the main cryogenic exchanger at −162 °C.",
    specs:{ Mass:"15,000 kg", Status:"DEROGATION" } },

  { id:"G0785",  diag:"104-G07.85",  x:42.0, y:58.5,
    nameEn:"Propane HP Accumulator",  nameFr:"Accumulateur Propane HP",
    section:"propane",    dbTag:"X04-G-07.85",
    dcsPanels:["propane-1","propane-2"], manuals:["S03"],
    descEn:"HP propane accumulator — receives condensed liquid propane from cooling-water condenser before HP expansion valve and MP chillers.",
    specs:{ Mass:"400 kg", Status:"DEROGATION" } },

  { id:"G0790",  diag:"104-G07.90",  x:49.5, y:58.0,
    nameEn:"Propane MP Flash Drum",   nameFr:"Ballon Flash Propane MP",
    section:"propane",    dbTag:"X04-G-07.90",
    dcsPanels:["propane-2","propane-3"], manuals:["S03"],
    descEn:"Medium-pressure propane flash drum — LP/MP separation stage. Flash gas returns to MP compressor suction; liquid feeds MP-level chillers.",
    specs:{ Mass:"400 kg", Status:"DEROGATION" } },

  { id:"G0791",  diag:"104-G07.91",  x:55.5, y:66.0,
    nameEn:"Propane LP Suction Drum", nameFr:"Ballon Aspiration BP Propane",
    section:"propane",    dbTag:"X04-G-07.91",
    dcsPanels:["propane-3"], manuals:["S03"],
    descEn:"LP propane suction drum — protects LP compressor stage from liquid carry-over at the coldest propane level (~−35 °C).",
    specs:{ Mass:"400 kg", Status:"DEROGATION" } },

  /* ── LIQUEFACTION / MCR ── */
  { id:"E0520",  diag:"106-E05.20",  x:53.0, y:17.5,
    nameEn:"Main Cryogenic Exch.",    nameFr:"Échangeur Cryogénique Princ.",
    section:"liquefaction", dbTag:"X06-E-05.30",
    dcsPanels:["liquefaction-1","liquefaction-2","mcr-1","mcr-2","mcr-3","general-train"], manuals:["S05","S06"],
    descEn:"MCHE — Main Cryogenic Heat Exchanger (coil-wound PFHE). Liquefies natural gas to −162 °C using mixed refrigerant (N₂/CH₄/C₂H₆/C₃H₈/C₄H₁₀). Core of the AP-C3MR™ process.",
    specs:{ Status:"DEROGATION" } },

  { id:"G0783",  diag:"106-G07.83",  x:69.5, y:16.5,
    nameEn:"MCR HP Separator",        nameFr:"Séparateur MCR HP",
    section:"liquefaction", dbTag:"X06-G-07.83",
    dcsPanels:["mcr-1","mcr-2","liquefaction-1"], manuals:["S05"],
    descEn:"HP MCR separator — splits the mixed refrigerant into vapour (light: N₂, CH₄, C₂H₆) fed to MCHE warm bundle, and liquid (C₃/C₄) fed separately.",
    specs:{ Mass:"400 kg", Status:"DEROGATION" } },

  { id:"G0788",  diag:"105-G07.88",  x:81.5, y:44.5,
    nameEn:"MCR LP Suction Drum",     nameFr:"Ballon Aspiration MCR BP",
    section:"liquefaction", dbTag:"X05-G-07.88",
    dcsPanels:["mcr-1","mcr-2"], manuals:["S05"],
    descEn:"MCR LP suction drum — separates mixed refrigerant vapour returning from MCHE warm end before LP compressor stage. Prevents liquid slugging.",
    specs:{ Mass:"400 kg", Status:"DEROGATION" } },

  { id:"G0789",  diag:"K05-G07.89",  x:90.0, y:56.0,
    nameEn:"MCR HP Suction Drum",     nameFr:"Ballon Aspiration MCR HP",
    section:"liquefaction", dbTag:"X05-G-07.89",
    dcsPanels:["mcr-3"], manuals:["S05"],
    descEn:"MCR HP suction drum — final liquid/vapour separation before HP compressor stage. Ensures dry gas enters HP impellers.",
    specs:{ Mass:"400 kg", Status:"DEROGATION" } },

  /* ── COMPRESSORS ── */
  { id:"K110",   diag:"103-K01.10",  x:62.0, y:47.0,
    nameEn:"Propane Compressor",      nameFr:"Compresseur Propane",
    section:"compressor", dbTag:null,
    dcsPanels:["propane-1","propane-2","propane-3"], manuals:["S03"],
    descEn:"4-stage centrifugal propane compressor driven by condensing steam turbine. Circulates propane refrigerant through HP/MP/LP chilling levels for feed pre-cooling.",
    specs:{} },

  { id:"G0786",  diag:"103-G07.86",  x:80.5, y:55.5,
    nameEn:"Propane LP Drum",         nameFr:"Ballon Propane BP",
    section:"propane",    dbTag:"X03-G-07.86",
    dcsPanels:["propane-3"], manuals:["S03"],
    descEn:"Propane LP suction drum — lowest-pressure level of the propane refrigeration loop, feeds LP stage of compressor K01.10.",
    specs:{ Mass:"400 kg", Status:"DEROGATION" } },

  { id:"K120",   diag:"105-K01.20",  x:81.5, y:34.0,
    nameEn:"MCR Compressor LP/MP",    nameFr:"Compresseur MCR BP/MP",
    section:"compressor", dbTag:null,
    dcsPanels:["mcr-1","mcr-2","mcr-3"], manuals:["S05"],
    descEn:"MCR centrifugal compressor LP and MP bodies — driven by steam turbine. First two compression stages of the mixed-refrigerant loop with intercooling.",
    specs:{} },

  { id:"K121",   diag:"105-K01.21",  x:90.0, y:30.0,
    nameEn:"MCR Compressor HP",       nameFr:"Compresseur MCR HP",
    section:"compressor", dbTag:null,
    dcsPanels:["mcr-3"], manuals:["S05"],
    descEn:"MCR HP compressor body — final stage, discharges at ~44 bar. HP MCR then passes through propane aftercooler before HP separator.",
    specs:{} },

  /* ── FRACTIONATION ── */
  { id:"F0721",  diag:"107-F07.21",  x:12.0, y:72.5,
    nameEn:"Demethaniser",            nameFr:"Déméthaniseur",
    section:"fractionation", dbTag:"X07-F-07.21",
    dcsPanels:["demethanisation","demethanisation-2","general-train"], manuals:["S07"],
    descEn:"Demethaniser column — separates methane (LNG product) from C₂+ NGL stream. Overhead CH₄ recycles to liquefaction; bottoms (ethane-rich) feeds de-ethaniser.",
    specs:{ Mass:"15,000 kg", Status:"DEROGATION" } },

  { id:"F0731",  diag:"108-F07.31",  x:24.0, y:72.5,
    nameEn:"De-ethaniser",            nameFr:"Dééthaniseur",
    section:"fractionation", dbTag:"X08-F-07.31",
    dcsPanels:["deethanisation"], manuals:["S08"],
    descEn:"De-ethaniser column — separates ethane (C₂) from propane/butane/gasoline. Ethane overhead exported or re-injected; bottoms feeds depropaniser.",
    specs:{ Mass:"15,000 kg", Status:"DEROGATION" } },

  { id:"F0741",  diag:"109-F07.41",  x:38.5, y:72.5,
    nameEn:"Depropaniser",            nameFr:"Dépropaniseur",
    section:"fractionation", dbTag:"X09-F-07.41",
    dcsPanels:["depropanisation"], manuals:["S09"],
    descEn:"Depropaniser — separates propane (LPG) from butanes and natural gasoline. Propane overhead condensed and pumped to LPG storage.",
    specs:{ Mass:"15,000 kg", Status:"DEROGATION" } },

  { id:"F0751",  diag:"110-F07.51",  x:52.5, y:72.5,
    nameEn:"Debutaniser",             nameFr:"Débutaniseur",
    section:"fractionation", dbTag:"X10-F-07.51",
    dcsPanels:["debutanisation"], manuals:["S10"],
    descEn:"Debutaniser — separates butane (C₄) from natural gasoline (C₅+). Butane overhead → LPG blending; gasoline bottoms → export.",
    specs:{ Mass:"15,000 kg", Status:"DEROGATION" } },
];

/* ─── Component ─────────────────────────────────────────────────────────── */
export default function SmartProcessFlow() {
  const { lang } = useI18n();
  const L = (en: string, fr: string) => lang === "fr" ? fr : en;

  const [selected, setSelected]   = useState<TagDef | null>(null);
  const [filter,   setFilterVal]  = useState<Section | "all">("all");
  const [hovered,  setHovered]    = useState<string | null>(null);
  const [lightbox, setLightbox]   = useState<{ url: string; title: string } | null>(null);
  const [scale,    setScale]      = useState(1);
  const [offset,   setOffset]     = useState({ x: 0, y: 0 });

  const isDragging = useRef(false);
  const dragStart  = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);
  const wrapRef    = useRef<HTMLDivElement>(null);

  /* pan/zoom */
  const applyZoom = useCallback((delta: number) => {
    setScale(s => Math.min(5, Math.max(0.35, s + delta)));
  }, []);

  const resetView = () => { setScale(1); setOffset({ x: 0, y: 0 }); };

  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    setScale(s => Math.min(5, Math.max(0.35, s - e.deltaY * 0.001)));
  }, []);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, [handleWheel]);

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    isDragging.current = false;
    dragStart.current = { x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y };
    (e.target as Element).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragStart.current) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) isDragging.current = true;
    setOffset({ x: dragStart.current.ox + dx, y: dragStart.current.oy + dy });
  };
  const onPointerUp = () => { dragStart.current = null; };

  /* keyboard */
  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setSelected(null); setLightbox(null); }
      if (e.key === "+" || e.key === "=") applyZoom(0.2);
      if (e.key === "-") applyZoom(-0.2);
      if (e.key === "0") resetView();
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [applyZoom]);

  const eq = selected?.dbTag ? getEquipmentByTag(selected.dbTag) : null;
  const sc = selected ? SECT[selected.section] : null;

  const visibleTags = filter === "all" ? TAGS : TAGS.filter(t => t.section === filter);

  return (
    <div className="flex flex-col" style={{ height: "calc(100vh - 3.5rem)", background: "#040d14", color: "#fff" }}>

      {/* ── TOP BAR ── */}
      <div style={{
        height: 48, flexShrink: 0, display: "flex", alignItems: "center", gap: 12,
        padding: "0 14px", borderBottom: "1px solid rgba(0,200,255,0.18)",
        background: "rgba(4,13,20,0.97)", backdropFilter: "blur(8px)", zIndex: 30,
      }}>
        <Layers size={15} style={{ color: "#00c8ff" }} />
        <span style={{ fontFamily: "monospace", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.12em", color: "rgba(255,255,255,0.4)" }}>
          GNL1Z · AP-C3MR™ · {L("Integrated Process Plan", "Plan Procédé Intégré")}
        </span>

        {/* section filters */}
        <div style={{ display: "flex", gap: 5, marginLeft: 12 }}>
          {(["all", ...Object.keys(SECT)] as (Section | "all")[]).map(s => {
            const active = filter === s;
            const color  = s === "all" ? "#fff" : SECT[s as Section].color;
            const bg     = s === "all" ? "rgba(255,255,255,0.1)" : SECT[s as Section].bg;
            const bord   = s === "all" ? "rgba(255,255,255,0.25)" : SECT[s as Section].border;
            const lbl    = s === "all" ? "ALL"
              : L(SECT[s as Section].label, SECT[s as Section].labelFr);
            return (
              <button key={s}
                onClick={() => setFilterVal(s)}
                style={{
                  fontFamily: "monospace", fontSize: 9, textTransform: "uppercase",
                  letterSpacing: "0.07em", padding: "3px 8px", borderRadius: 3, cursor: "pointer",
                  border: `1px solid ${active ? bord : "rgba(255,255,255,0.1)"}`,
                  background: active ? bg : "transparent",
                  color: active ? color : "rgba(255,255,255,0.35)",
                  transition: "all 0.12s",
                }}>
                {lbl}
              </button>
            );
          })}
        </div>

        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
          {[{ icon: <ZoomIn size={12}/>, fn: () => applyZoom(0.25) },
            { icon: <ZoomOut size={12}/>, fn: () => applyZoom(-0.25) },
            { icon: <RotateCcw size={12}/>, fn: resetView }].map((b, i) => (
            <button key={i} onClick={b.fn} style={{
              background: "transparent", border: "1px solid rgba(0,200,255,0.2)",
              borderRadius: 4, color: "rgba(255,255,255,0.5)", width: 26, height: 26,
              display: "grid", placeItems: "center", cursor: "pointer",
            }}>{b.icon}</button>
          ))}
          <span style={{ fontFamily: "monospace", fontSize: 10, color: "rgba(255,255,255,0.3)", width: 38, textAlign: "right" }}>
            {Math.round(scale * 100)}%
          </span>
        </div>
      </div>

      {/* ── BODY ── */}
      <div style={{ flex: 1, display: "flex", minHeight: 0 }}>

        {/* ── CANVAS ── */}
        <div ref={wrapRef} style={{ flex: 1, position: "relative", overflow: "hidden", cursor: "crosshair" }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
          onClick={() => { if (!isDragging.current) setSelected(null); }}
        >
          <div style={{
            position: "absolute", inset: 0,
            transform: `translate(${offset.x}px,${offset.y}px) scale(${scale})`,
            transformOrigin: "center center",
            transition: isDragging.current ? "none" : "transform 0.08s ease-out",
          }}>
            {/* PFD base image */}
            <img
              src="/pfd/gnl1z-pfd-labeled.png"
              alt="GNL1Z Process Flow Diagram"
              draggable={false}
              style={{ width: "100%", height: "100%", objectFit: "contain", display: "block",
                       filter: "brightness(0.88) contrast(1.06) saturate(0.92)", userSelect: "none" }}
              onError={e => { (e.target as HTMLImageElement).src = "/pfd/gnl1z-pfd.jpg"; }}
            />

            {/* ── TAG LABEL BUTTONS ── */}
            {visibleTags.map(t => {
              const isActive  = selected?.id === t.id;
              const isHov     = hovered === t.id;
              const c         = SECT[t.section];
              return (
                <button
                  key={t.id}
                  onMouseEnter={() => setHovered(t.id)}
                  onMouseLeave={() => setHovered(null)}
                  onClick={e => { e.stopPropagation(); if (!isDragging.current) setSelected(isActive ? null : t); }}
                  style={{
                    position: "absolute",
                    left: `${t.x}%`, top: `${t.y}%`,
                    transform: `translate(-50%,-50%) scale(${isActive ? 1.15 : isHov ? 1.08 : 1})`,
                    fontFamily: "monospace", fontSize: 10, lineHeight: 1.2,
                    whiteSpace: "nowrap", textAlign: "center",
                    padding: "2px 6px", borderRadius: 3, cursor: "pointer",
                    border: `1px solid ${isActive || isHov ? c.border : "rgba(0,200,255,0.28)"}`,
                    background: isActive ? c.bg : isHov ? "rgba(0,200,255,0.12)" : "rgba(4,13,20,0.8)",
                    color: isActive || isHov ? c.color : "rgba(255,255,255,0.7)",
                    backdropFilter: "blur(4px)",
                    boxShadow: isActive ? `0 0 14px ${c.border}` : isHov ? "0 0 8px rgba(0,200,255,0.3)" : "none",
                    transition: "all 0.12s",
                    zIndex: isActive ? 25 : isHov ? 20 : 10,
                    userSelect: "none",
                  }}>
                  {t.diag}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── DETAIL PANEL ── */}
        <div style={{
          width: selected ? 360 : 0, flexShrink: 0,
          borderLeft: "1px solid rgba(0,200,255,0.18)",
          background: "rgba(6,17,28,0.97)",
          overflow: "hidden", transition: "width 0.25s cubic-bezier(0.4,0,0.2,1)",
          display: "flex", flexDirection: "column",
        }}>
          {selected && sc && (
            <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}
              className="[&::-webkit-scrollbar]:w-[3px] [&::-webkit-scrollbar-thumb]:bg-white/10">

              {/* header */}
              <div style={{
                padding: "14px 16px", borderBottom: `1px solid ${sc.border}`,
                position: "sticky", top: 0, background: "rgba(6,17,28,0.98)",
                backdropFilter: "blur(8px)", zIndex: 5,
              }}>
                <button onClick={() => setSelected(null)} style={{
                  position: "absolute", top: 10, right: 10,
                  background: "transparent", border: "1px solid rgba(255,255,255,0.15)",
                  borderRadius: 3, color: "rgba(255,255,255,0.4)", width: 22, height: 22,
                  cursor: "pointer", display: "grid", placeItems: "center",
                }}><X size={12}/></button>

                <div style={{ fontFamily: "monospace", fontSize: 10, color: "rgba(255,255,255,0.35)", marginBottom: 4 }}>
                  {selected.diag}
                </div>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 19, lineHeight: 1.1, color: "#fff" }}>
                  {L(selected.nameEn, selected.nameFr)}
                </div>
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: 5,
                  fontFamily: "monospace", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.08em",
                  padding: "2px 7px", borderRadius: 2, marginTop: 8,
                  border: `1px solid ${sc.border}`, background: sc.bg, color: sc.color,
                }}>
                  <span style={{ width: 5, height: 5, borderRadius: "50%", background: sc.color, display: "inline-block" }}/>
                  {L(sc.label, sc.labelFr)}
                </div>
              </div>

              {/* description */}
              <Section_ title={L("Description", "Description")}>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", lineHeight: 1.65 }}>{selected.descEn}</p>
              </Section_>

              {/* specs */}
              {Object.keys(selected.specs).length > 0 && (
                <Section_ title={L("Technical Data", "Données Techniques")}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                    {Object.entries(selected.specs).map(([k, v]) => (
                      <div key={k} style={{ background: "#0b1f30", border: "1px solid rgba(0,200,255,0.1)", borderRadius: 4, padding: "6px 8px" }}>
                        <div style={{ fontFamily: "monospace", fontSize: 9, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", marginBottom: 2 }}>{k}</div>
                        <div style={{ fontFamily: "monospace", fontSize: 12, color: "#fff" }}>{v}</div>
                      </div>
                    ))}
                    {eq && (
                      <>
                        <div style={{ background: "#0b1f30", border: "1px solid rgba(0,200,255,0.1)", borderRadius: 4, padding: "6px 8px" }}>
                          <div style={{ fontFamily: "monospace", fontSize: 9, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", marginBottom: 2 }}>Spare Parts</div>
                          <div style={{ fontFamily: "monospace", fontSize: 12, color: "#fff" }}>{eq.spare_parts.count} refs</div>
                        </div>
                        <div style={{ background: "#0b1f30", border: "1px solid rgba(0,200,255,0.1)", borderRadius: 4, padding: "6px 8px" }}>
                          <div style={{ fontFamily: "monospace", fontSize: 9, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", marginBottom: 2 }}>Unit</div>
                          <div style={{ fontFamily: "monospace", fontSize: 12, color: "#fff" }}>{eq.unit}</div>
                        </div>
                      </>
                    )}
                  </div>
                </Section_>
              )}

              {/* equipment link */}
              <Section_ title={L("Equipment File", "Fiche Équipement")}>
                {selected.dbTag ? (
                  <Link to={`/equipment/${encodeURIComponent(selected.dbTag)}`}
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "9px 13px", borderRadius: 5, textDecoration: "none",
                      border: `1px solid ${sc.border}`, background: sc.bg, color: sc.color,
                      fontSize: 13, fontWeight: 600, transition: "all 0.12s",
                    }}>
                    <span>{L("Open Equipment File", "Ouvrir la Fiche")}</span>
                    <span style={{ fontFamily: "monospace", fontSize: 10 }}>{selected.dbTag}</span>
                  </Link>
                ) : (
                  <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", fontStyle: "italic" }}>
                    {L("No equipment record — refer to operational manuals.", "Pas de fiche — consulter les manuels opérationnels.")}
                  </p>
                )}
              </Section_>

              {/* DCS screens */}
              {selected.dcsPanels.length > 0 && (
                <Section_ title={<><Cpu size={10} style={{ display:"inline", marginRight:4 }}/>{L(`DCS Screens (${selected.dcsPanels.length})`, `Écrans DCS (${selected.dcsPanels.length})`)}</>}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                    {selected.dcsPanels.map(pid => {
                      const p = DCS.find(d => d.id === pid);
                      if (!p) return null;
                      const url = dcsUrl(p.path);
                      return (
                        <div key={pid}
                          onClick={() => setLightbox({ url, title: p.title })}
                          style={{
                            borderRadius: 4, overflow: "hidden",
                            border: "1px solid rgba(0,200,255,0.15)", background: "#071520",
                            cursor: "pointer", transition: "all 0.15s",
                          }}>
                          <img src={url} alt={p.title} loading="lazy"
                            style={{ width: "100%", aspectRatio: "16/9", objectFit: "cover", display: "block", filter: "brightness(0.82)" }}
                            onError={e => (e.target as HTMLElement).parentElement!.style.display = "none"}
                          />
                          <div style={{ padding: "3px 6px", fontFamily: "monospace", fontSize: 8, color: "rgba(255,255,255,0.35)" }}>
                            {p.title}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Section_>
              )}

              {/* instrument tags */}
              {selected.dcsPanels.length > 0 && (() => {
                const tags = [...new Set(selected.dcsPanels.flatMap(pid => INSTR[pid] || []))].slice(0, 24);
                return tags.length > 0 ? (
                  <Section_ title={L("Instrument Tags", "Tags Instruments")}>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                      {tags.map(t => (
                        <span key={t} style={{
                          fontFamily: "monospace", fontSize: 9, padding: "2px 6px", borderRadius: 2,
                          background: "rgba(0,200,255,0.08)", border: "1px solid rgba(0,200,255,0.2)",
                          color: "rgba(0,200,255,0.75)",
                        }}>{t}</span>
                      ))}
                    </div>
                  </Section_>
                ) : null;
              })()}

              {/* manuals */}
              {selected.manuals.length > 0 && (
                <Section_ title={<><BookOpen size={10} style={{ display:"inline", marginRight:4 }}/>{L("Operational Manuals", "Manuels Opérationnels")}</>}>
                  {selected.manuals.map(mid => {
                    const m = MANUALS.find(x => x.id === mid);
                    if (!m) return null;
                    return (
                      <a key={mid}
                        href={`https://drive.google.com/file/d/${m.driveId}/view`}
                        target="_blank" rel="noopener noreferrer"
                        style={{
                          display: "flex", alignItems: "center", gap: 8,
                          padding: "7px 10px", borderRadius: 4, marginBottom: 5,
                          border: "1px solid rgba(255,255,255,0.08)",
                          background: "#071520", color: "rgba(255,255,255,0.55)",
                          fontSize: 12, textDecoration: "none", transition: "all 0.12s",
                        }}>
                        <span style={{ fontFamily: "monospace", fontSize: 9, color: "#00c8ff", flexShrink: 0 }}>{m.id}</span>
                        <span style={{ flex: 1 }}>{m.title}</span>
                        <ExternalLink size={11} style={{ opacity: 0.4, flexShrink: 0 }}/>
                      </a>
                    );
                  })}
                </Section_>
              )}

            </div>
          )}
        </div>
      </div>

      {/* ── STATUS BAR ── */}
      <div style={{
        height: 30, flexShrink: 0, display: "flex", alignItems: "center", gap: 14,
        padding: "0 14px", borderTop: "1px solid rgba(0,200,255,0.1)",
        background: "rgba(4,13,20,0.9)",
        fontFamily: "monospace", fontSize: 9, color: "rgba(255,255,255,0.25)",
      }}>
        <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#00e5a0", animation: "pulse 2s infinite", flexShrink: 0 }}/>
        <span>AP-C3MR™ · 6 Trains · Arzew</span>
        <span style={{ color: "rgba(0,200,255,0.7)" }}>
          {hovered ? TAGS.find(t => t.id === hovered)?.diag ?? "" : ""}
        </span>
        <span style={{ marginLeft: "auto" }}>
          {L("Scroll=zoom · Drag=pan · Click tag=inspect", "Molette=zoom · Glisser=déplacer · Clic=inspecter")}
        </span>
      </div>

      {/* ── LIGHTBOX ── */}
      {lightbox && (
        <div onClick={() => setLightbox(null)} style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.93)",
          zIndex: 200, display: "grid", placeItems: "center", cursor: "zoom-out",
        }}>
          <img src={lightbox.url} alt={lightbox.title}
            style={{ maxWidth: "90vw", maxHeight: "85vh", borderRadius: 6, border: "1px solid rgba(0,200,255,0.25)" }}/>
          <div style={{
            position: "fixed", bottom: 22, left: "50%", transform: "translateX(-50%)",
            fontFamily: "monospace", fontSize: 11, color: "rgba(255,255,255,0.45)",
            background: "rgba(0,0,0,0.7)", padding: "4px 12px", borderRadius: 20,
          }}>{lightbox.title}</div>
        </div>
      )}

      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.25}}`}</style>
    </div>
  );
}

/* ─── tiny layout helper ─────────────────────────────────────────────────── */
function Section_({ title, children }: { title: React.ReactNode; children: React.ReactNode }) {
  return (
    <div style={{ padding: "11px 15px", borderBottom: "1px solid rgba(0,200,255,0.08)" }}>
      <div style={{ fontFamily: "monospace", fontSize: 9, textTransform: "uppercase",
        letterSpacing: "0.12em", color: "rgba(255,255,255,0.28)", marginBottom: 8 }}>
        {title}
      </div>
      {children}
    </div>
  );
    }
