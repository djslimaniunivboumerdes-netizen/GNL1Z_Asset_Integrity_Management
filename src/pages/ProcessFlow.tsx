import React, { useState, useCallback, useEffect } from "react";
import { Link } from "react-router-dom";
import { useI18n } from "@/contexts/I18nContext";
import {
  X, ExternalLink, FileText, ChevronRight,
  PanelRightClose, PanelRightOpen, ZoomIn, ZoomOut,
  RotateCcw, Maximize2, Minimize2,
} from "lucide-react";

/* ─── constants ─────────────────────────────────────────────── */
const ACCENT = "#f97316";
const VW = 141;   // viewBox width  (= 953/676 * 100)
const VH = 100;   // viewBox height

/* ─── types ─────────────────────────────────────────────────── */
type Shape = "tall-col" | "short-col" | "h-drum" | "v-drum" | "hex" | "diamond" | "rect" | "circle";
type Section = "decarb" | "dehydr" | "demerc" | "cooling" | "liquef" | "fract" | "fuel" | "storage";

interface PID {
  driveId: string;
  drawing: string;   // e.g. "85-X01-10.3"
  title: { en: string; fr: string };
}

interface Equip {
  id: string;            // canonical tag e.g. "101-F501"
  display: string;       // what the DCS shows e.g. "101-\nF501"
  x: number; y: number;  // centre in SVG coords
  w: number; h: number;  // hotspot size in SVG units
  shape: Shape;
  color: string;         // highlight tint
  section: Section;
  name: { en: string; fr: string };
  desc: { en: string; fr: string };
  specs: { label: string; value: string }[];
  pids: PID[];
}

/* ─── section meta ───────────────────────────────────────────── */
const SEC: Record<Section,{en:string;fr:string;color:string}> = {
  decarb:  { en:"Decarbonation (MEA)",  fr:"Décarbonatation (MEA)",   color:"#10b981" },
  dehydr:  { en:"Dehydration",          fr:"Déshydratation",           color:"#a78bfa" },
  demerc:  { en:"Mercury Removal",      fr:"Démercurisation",          color:"#a78bfa" },
  cooling: { en:"Propane Pre-Cooling",  fr:"Pré-refroidissement C₃",   color:"#60a5fa" },
  liquef:  { en:"Liquefaction (MCR)",   fr:"Liquéfaction (MCR)",       color:"#c084fc" },
  fract:   { en:"Fractionation",        fr:"Fractionnement",           color:"#22c55e" },
  fuel:    { en:"Fuel Gas",             fr:"Gaz Combustible",          color:"#f97316" },
  storage: { en:"LNG Storage",          fr:"Stockage GNL",             color:"#94a3b8" },
};

/* ─── equipment master ───────────────────────────────────────── */
// x,y = centre; w,h = bounding box — all in SVG units (141×100)
// Positions mapped pixel-perfect from the DCS mimic image
const EQUIP: Equip[] = [

  /* ══ DECARBONATION ══════════════════════════════════════════ */
  {
    id:"101-F501", display:"101-F501", x:16.5, y:39, w:5, h:18, shape:"tall-col", color:"#ec4899",
    section:"decarb",
    name:{ en:"MEA CO₂ Absorber", fr:"Absorbeur CO₂ MEA" },
    desc:{ en:"Counter-current MEA absorber removing CO₂ to <50 ppmv before cryogenic stages.",
           fr:"Absorbeur MEA contre-courant éliminant le CO₂ à <50 ppmv avant les étages cryogéniques." },
    specs:[{label:"Service",value:"Amine treating"},{label:"Pressure",value:"48 bar"},{label:"Diameter",value:'120"'},{label:"Height",value:"32 m"}],
    pids:[
      {driveId:"1XnQlsFf0j5eNlUDr9rKZfZkr3h2tGNDi", drawing:"85-X01-10.3",  title:{en:"MEA CO₂ Absorber",   fr:"Absorbeur CO₂ MEA"}},
      {driveId:"1DRydZxIMQCB7dy5I5C_nnVdQyjEzV4mn", drawing:"85-X01-10.15", title:{en:"MEA Absorber System",fr:"Système Absorbeur MEA"}},
    ],
  },
  {
    id:"101-F502", display:"101-F502", x:10.5, y:28, w:4.5, h:14, shape:"tall-col", color:"#f43f5e",
    section:"decarb",
    name:{ en:"MEA Regenerator", fr:"Régénérateur MEA" },
    desc:{ en:"Steam-stripped regenerator that recovers lean amine for recycle to the absorber.",
           fr:"Régénérateur stripé vapeur récupérant l'amine pauvre pour recyclage vers l'absorbeur." },
    specs:[{label:"Reboiler duty",value:"18 MW"},{label:"Top T",value:"100 °C"},{label:"Reflux ratio",value:"0.8"}],
    pids:[
      {driveId:"1DRydZxIMQCB7dy5I5C_nnVdQyjEzV4mn", drawing:"85-X01-10.15", title:{en:"MEA Absorber System",fr:"Système Absorbeur MEA"}},
    ],
  },
  {
    id:"101-G507", display:"101-G\n507", x:10.5, y:62, w:6, h:4, shape:"h-drum", color:"#10b981",
    section:"decarb",
    name:{ en:"Rich Amine Flash Drum", fr:"Ballon Détente Amine Riche" },
    desc:{ en:"Flashes dissolved hydrocarbons from rich MEA before regeneration.",
           fr:"Détend les hydrocarbures dissous de la MEA riche avant régénération." },
    specs:[{label:"Pressure",value:"5 bar"},{label:"Temperature",value:"65 °C"}],
    pids:[
      {driveId:"1XnQlsFf0j5eNlUDr9rKZfZkr3h2tGNDi", drawing:"85-X01-10.3", title:{en:"MEA CO₂ Absorber",fr:"Absorbeur CO₂ MEA"}},
    ],
  },

  /* ══ DEHYDRATION ════════════════════════════════════════════ */
  {
    id:"102-G787", display:"102-G07.87", x:5.5, y:14, w:5, h:3.5, shape:"h-drum", color:"#a78bfa",
    section:"dehydr",
    name:{ en:"Dehydration Inlet KO Drum", fr:"Ballon Séparateur Déshydratation" },
    desc:{ en:"Removes free liquids upstream of the molecular sieve dryer beds.",
           fr:"Élimine les liquides libres en amont des tamis moléculaires." },
    specs:[{label:"Pressure",value:"47 bar"},{label:"Temperature",value:"20 °C"}],
    pids:[
      {driveId:"1s-HhZ9SDd9IrC54FoJgW3qgctdfKyBR4", drawing:"85-X02-10.1", title:{en:"Dryer Section — Sheet 1",fr:"Section Sécheur — Feuille 1"}},
    ],
  },
  {
    id:"102-R310", display:"102-R03.10", x:21.5, y:16, w:5, h:8, shape:"v-drum", color:"#8b5cf6",
    section:"dehydr",
    name:{ en:"Mol-Sieve Dryer — Bed A", fr:"Sécheur Tamis Moléculaire — Lit A" },
    desc:{ en:"Adsorption of residual water on 4 Å molecular sieves to achieve <1 ppmv H₂O.",
           fr:"Adsorption de l'eau résiduelle sur tamis 4 Å pour atteindre <1 ppmv H₂O." },
    specs:[{label:"Cycle",value:"8 h"},{label:"Regen T",value:"280 °C"},{label:"Adsorbent",value:"Mol sieve 4Å"}],
    pids:[
      {driveId:"1s-HhZ9SDd9IrC54FoJgW3qgctdfKyBR4", drawing:"85-X02-10.1", title:{en:"Dryer Section — Sheet 1",fr:"Section Sécheur — Feuille 1"}},
      {driveId:"1iBYssKKcfcQFf28qmZqLcuhhpY3n6c43", drawing:"85-X02-10.4", title:{en:"Dryer Reactivation",     fr:"Réactivation Sécheur"}},
    ],
  },
  {
    id:"102-R311", display:"102-R03.11", x:29, y:16, w:5, h:8, shape:"v-drum", color:"#8b5cf6",
    section:"dehydr",
    name:{ en:"Mol-Sieve Dryer — Bed B", fr:"Sécheur Tamis Moléculaire — Lit B" },
    desc:{ en:"Parallel bed rotating on adsorb / regeneration / cooling cycle.",
           fr:"Lit parallèle tournant sur cycle adsorption / régénération / refroidissement." },
    specs:[{label:"Cycle",value:"8 h"},{label:"Phase",value:"Adsorb / Regen / Cool"}],
    pids:[
      {driveId:"1s-HhZ9SDd9IrC54FoJgW3qgctdfKyBR4", drawing:"85-X02-10.1", title:{en:"Dryer Section — Sheet 1",fr:"Section Sécheur — Feuille 1"}},
      {driveId:"1iBYssKKcfcQFf28qmZqLcuhhpY3n6c43", drawing:"85-X02-10.4", title:{en:"Dryer Reactivation",     fr:"Réactivation Sécheur"}},
    ],
  },

  /* ══ MERCURY REMOVAL ════════════════════════════════════════ */
  {
    id:"102-R312", display:"102-R03.12", x:24, y:30, w:5, h:7, shape:"v-drum", color:"#7c3aed",
    section:"demerc",
    name:{ en:"Mercury Guard Bed", fr:"Lit de Démercurisation" },
    desc:{ en:"Sulphur-impregnated activated carbon bed removing Hg to <0.01 µg/Nm³.",
           fr:"Lit charbon actif soufré éliminant le Hg à <0,01 µg/Nm³." },
    specs:[{label:"Outlet Hg",value:"<0.01 µg/Nm³"},{label:"Adsorbent",value:"S-AC"}],
    pids:[
      {driveId:"17Ixt5YVT0PCuNO0tQdt__ruax58T3o8x", drawing:"85-X02-10.2", title:{en:"Dryer — Mercury Removal",fr:"Sécheur — Démercurisation"}},
      {driveId:"1s-HhZ9SDd9IrC54FoJgW3qgctdfKyBR4", drawing:"85-X02-10.1", title:{en:"Dryer Section — Sheet 1",fr:"Section Sécheur — Feuille 1"}},
    ],
  },

  /* ══ PRE-COOLING / SCRUB ════════════════════════════════════ */
  {
    id:"104-F711", display:"104-F07.11", x:34, y:41, w:4.5, h:15, shape:"tall-col", color:"#38bdf8",
    section:"cooling",
    name:{ en:"Scrub Column", fr:"Colonne de Lavage" },
    desc:{ en:"Removes heavy hydrocarbons (C5+) from feed before MCHE to prevent freeze-out at cryogenic temperatures.",
           fr:"Élimine les hydrocarbures lourds (C5+) de l'alimentation avant le MCHE pour éviter le gel à température cryogénique." },
    specs:[{label:"Trays",value:"20"},{label:"Bottom T",value:"−25 °C"},{label:"Pressure",value:"44 bar"}],
    pids:[
      {driveId:"1aNlMZ1PutUuOBqEh70GRxyyy7RF8wM9w", drawing:"85-X04-10.1", title:{en:"Scrub Tower Section",        fr:"Section Tour de Lavage"}},
      {driveId:"1iStV_uflAm7IosS2RzVGWR-i4cU9nEFM", drawing:"85-X04-10.3", title:{en:"MCR & Feed Chilling — Sh.3",fr:"Refroidissement MCR — F.3"}},
    ],
  },
  {
    id:"104-E540", display:"104-E05.40", x:43, y:14, w:7, h:3.5, shape:"hex", color:"#06b6d4",
    section:"cooling",
    name:{ en:"Scrub Column Condenser / Reflux Chiller", fr:"Condenseur / Refroidisseur Reflux Scrub" },
    desc:{ en:"Propane-cooled condenser providing reflux to scrub column top tray.",
           fr:"Condenseur refroidi au propane fournissant le reflux en tête de la colonne de lavage." },
    specs:[{label:"Coolant",value:"Propane"},{label:"Outlet T",value:"−40 °C"}],
    pids:[
      {driveId:"18tZeKQIV2gkVqp7FtaJouHbiXmCGTl3r", drawing:"85-X04-10.4", title:{en:"Scrub Reflux Chiller",fr:"Refroidisseur Reflux Scrub"}},
    ],
  },
  {
    id:"103-K110", display:"103-K01.10", x:51.5, y:52, w:9, h:7, shape:"diamond", color:"#818cf8",
    section:"cooling",
    name:{ en:"Propane Refrigerant Compressor", fr:"Compresseur Frigorigène Propane" },
    desc:{ en:"4-stage centrifugal compressor driven by GE Frame 5 gas turbine, providing propane refrigeration for pre-cooling loop.",
           fr:"Compresseur centrifuge 4 étages entraîné par turbine GE Frame 5, fournissant la réfrigération propane pour la boucle de pré-refroidissement." },
    specs:[{label:"Stages",value:"4"},{label:"Power",value:"32 MW"},{label:"Driver",value:"GE Frame 5"},{label:"Discharge P",value:"16 bar"}],
    pids:[
      {driveId:"1ptzlIPKMw4oC6aT5tbhw--LcivaqSt6c", drawing:"85-X03-10.1", title:{en:"Propane Compression",    fr:"Compression Propane"}},
      {driveId:"1UX683Oz0fNogWftWMBUUtitF7ye8VB2s", drawing:"85-X03-10.2", title:{en:"Propane Condensers",     fr:"Condenseurs Propane"}},
      {driveId:"1li0MiuwYTB0l1J6r5J7jz9RPV0XBTe4I", drawing:"85-X03-10.4", title:{en:"C3 & MCR — Oil Flow",   fr:"C3 & MCR — Flux Huile"}},
    ],
  },
  {
    id:"104-G785", display:"104-G07.85", x:36, y:60, w:5.5, h:3.5, shape:"h-drum", color:"#60a5fa",
    section:"cooling",
    name:{ en:"Propane HP Accumulator", fr:"Accumulateur Propane HP" },
    desc:{ en:"High-pressure propane condensate receiver downstream of air-cooled condenser.",
           fr:"Accumulateur HP condensat propane en aval du condenseur à air." },
    specs:[{label:"Pressure",value:"16 bar"},{label:"Temperature",value:"40 °C"}],
    pids:[
      {driveId:"1UX683Oz0fNogWftWMBUUtitF7ye8VB2s", drawing:"85-X03-10.2", title:{en:"Propane Condensers",fr:"Condenseurs Propane"}},
    ],
  },
  {
    id:"104-G790", display:"104-G07.90", x:43, y:60, w:5.5, h:3.5, shape:"h-drum", color:"#60a5fa",
    section:"cooling",
    name:{ en:"Propane MP Economizer", fr:"Économiseur Propane MP" },
    desc:{ en:"Medium-pressure flash drum in the propane refrigeration loop — improves COP.",
           fr:"Ballon de détente moyenne pression dans la boucle propane — améliore le COP." },
    specs:[{label:"Pressure",value:"5.5 bar"}],
    pids:[
      {driveId:"1l2sSD2QO7VU29tmAFciLRJKUra7HCUiC", drawing:"85-X04-10.25", title:{en:"MCR & Feed Chilling",fr:"Refroidissement MCR & Alim."}},
    ],
  },
  {
    id:"104-G791", display:"104-G07.91", x:57, y:59, w:5, h:3.5, shape:"h-drum", color:"#60a5fa",
    section:"cooling",
    name:{ en:"Propane LP Economizer", fr:"Économiseur Propane BP" },
    desc:{ en:"Low-pressure propane flash drum — third stage of the refrigeration loop.",
           fr:"Ballon de détente basse pression propane — 3ème étage de la boucle de réfrigération." },
    specs:[{label:"Pressure",value:"1.8 bar"}],
    pids:[
      {driveId:"1l2sSD2QO7VU29tmAFciLRJKUra7HCUiC", drawing:"85-X04-10.25", title:{en:"MCR & Feed Chilling",fr:"Refroidissement MCR & Alim."}},
    ],
  },
  {
    id:"103-G786", display:"103-G07.86", x:63, y:54, w:6, h:3.5, shape:"h-drum", color:"#60a5fa",
    section:"cooling",
    name:{ en:"Propane Suction Drum (LP)", fr:"Ballon Aspiration Propane (BP)" },
    desc:{ en:"Liquid knockout drum on LP suction of propane compressor.",
           fr:"Ballon K.O. sur aspiration BP du compresseur propane." },
    specs:[{label:"Pressure",value:"1.5 bar"}],
    pids:[
      {driveId:"1ptzlIPKMw4oC6aT5tbhw--LcivaqSt6c", drawing:"85-X03-10.1", title:{en:"Propane Compression",fr:"Compression Propane"}},
    ],
  },

  /* ══ LIQUEFACTION ═══════════════════════════════════════════ */
  {
    id:"106-E520", display:"106-E05.20", x:48, y:27, w:5, h:20, shape:"tall-col", color:"#c084fc",
    section:"liquef",
    name:{ en:"Main Cryogenic Heat Exchanger (MCHE)", fr:"Échangeur Cryogénique Principal (MCHE)" },
    desc:{ en:"Air Products coil-wound MCHE liquefying treated feed to −162 °C using mixed-component refrigerant (MCR). Heart of the AP-C3MR™ process.",
           fr:"MCHE bobiné Air Products liquéfiant l'alimentation traitée à −162 °C via réfrigérant mixte (MCR). Cœur du procédé AP-C3MR™." },
    specs:[{label:"Type",value:"Coil-wound"},{label:"Outlet T",value:"−162 °C"},{label:"Height",value:"55 m"},{label:"Duty",value:"180 MW"},{label:"Pressure",value:"44 bar"}],
    pids:[
      {driveId:"1HZw_f38-vQEkcDh5GmrROaYUsv7_Gs-s", drawing:"85-X06-10.1", title:{en:"MCHE — Sheet 1",        fr:"MCHE — Feuille 1"}},
      {driveId:"1Sn9BM5N_0EbgZE1AlFhNGlgFG_yDOMx4", drawing:"85-X06-10.2", title:{en:"MCHE — HP Separator",   fr:"MCHE — Séparateur HP"}},
      {driveId:"1hKdpV7rH_te70GxsECbuKJsDZQ38lhBi", drawing:"85-X06-10.3", title:{en:"Flash Drum & LNG Pumps",fr:"Ballon Flash & Pompes GNL"}},
    ],
  },
  {
    id:"106-G783", display:"106-G07.83", x:63, y:14, w:5.5, h:3.5, shape:"h-drum", color:"#a78bfa",
    section:"liquef",
    name:{ en:"MCR HP Separator", fr:"Séparateur MCR HP" },
    desc:{ en:"Splits MCR into vapour (MR-V) and liquid (MR-L) streams that feed separate passes of the MCHE.",
           fr:"Sépare le MCR en vapeur (MR-V) et liquide (MR-L) alimentant les passes distinctes du MCHE." },
    specs:[{label:"Pressure",value:"44 bar"},{label:"Temperature",value:"−35 °C"}],
    pids:[
      {driveId:"1Sn9BM5N_0EbgZE1AlFhNGlgFG_yDOMx4", drawing:"85-X06-10.2", title:{en:"MCHE — HP Separator",fr:"MCHE — Séparateur HP"}},
    ],
  },
  {
    id:"105-K120", display:"105-K01.20", x:73.5, y:37, w:8, h:6, shape:"diamond", color:"#c084fc",
    section:"liquef",
    name:{ en:"MCR Compressor — LP/MP Body", fr:"Compresseur MCR — Corps BP/MP" },
    desc:{ en:"Low/medium pressure body of the mixed-refrigerant compressor, 3 impeller stages.",
           fr:"Corps basse/moyenne pression du compresseur de réfrigérant mixte, 3 étages." },
    specs:[{label:"Stages",value:"3"},{label:"Power",value:"40 MW"},{label:"Suction P",value:"3.5 bar"}],
    pids:[
      {driveId:"1JL1cUAjnwklIzAgssF8Lfjpyxy46Znvs", drawing:"85-X05-10.1", title:{en:"MCR Compression — 1st Stage",fr:"Compression MCR — 1er Étage"}},
    ],
  },
  {
    id:"105-K121", display:"105-K01.21", x:83.5, y:37, w:8, h:6, shape:"diamond", color:"#c084fc",
    section:"liquef",
    name:{ en:"MCR Compressor — HP Body", fr:"Compresseur MCR — Corps HP" },
    desc:{ en:"High-pressure body — final compression stage before MCR condensation. Driven by GE Frame 6.",
           fr:"Corps haute pression — dernier étage avant condensation du MCR. Entraîné par GE Frame 6." },
    specs:[{label:"Stages",value:"2"},{label:"Power",value:"55 MW"},{label:"Driver",value:"GE Frame 6"},{label:"Discharge P",value:"44 bar"}],
    pids:[
      {driveId:"12zjL0ltBTQyidegHSUYcbNioA3RLIXEB", drawing:"85-X05-10.2", title:{en:"MCR Compression — 2nd Stage",fr:"Compression MCR — 2ème Étage"}},
    ],
  },
  {
    id:"105-G788", display:"105-G07.88", x:68.5, y:50, w:5.5, h:3.5, shape:"h-drum", color:"#a78bfa",
    section:"liquef",
    name:{ en:"MCR LP Suction Drum", fr:"Ballon Aspiration MCR BP" },
    desc:{ en:"Knockout drum on LP suction of MCR compressor — protects impellers from liquid carry-over.",
           fr:"Ballon K.O. aspiration BP compresseur MCR — protège les roues du carry-over liquide." },
    specs:[{label:"Pressure",value:"3.5 bar"}],
    pids:[
      {driveId:"1JL1cUAjnwklIzAgssF8Lfjpyxy46Znvs", drawing:"85-X05-10.1", title:{en:"MCR Compression — 1st Stage",fr:"Compression MCR — 1er Étage"}},
    ],
  },
  {
    id:"K05-G789", display:"K05-G07.89", x:82, y:50, w:5.5, h:3.5, shape:"h-drum", color:"#a78bfa",
    section:"liquef",
    name:{ en:"MCR HP Suction Drum", fr:"Ballon Aspiration MCR HP" },
    desc:{ en:"Knockout drum on HP suction of MCR compressor second body.",
           fr:"Ballon K.O. aspiration HP corps haute pression du compresseur MCR." },
    specs:[{label:"Pressure",value:"12 bar"}],
    pids:[
      {driveId:"12zjL0ltBTQyidegHSUYcbNioA3RLIXEB", drawing:"85-X05-10.2", title:{en:"MCR Compression — 2nd Stage",fr:"Compression MCR — 2ème Étage"}},
    ],
  },

  /* ══ FRACTIONATION ══════════════════════════════════════════ */
  {
    id:"107-F721", display:"107-F07.21", x:8.5, y:80, w:5, h:15, shape:"tall-col", color:"#22c55e",
    section:"fract",
    name:{ en:"Demethaniser", fr:"Déméthaniseur" },
    desc:{ en:"Strips methane overhead from C2+ NGL liquids recovered in the scrub column bottoms.",
           fr:"Strippe le méthane en tête des liquides NGL C2+ récupérés en fond de la colonne de lavage." },
    specs:[{label:"Trays",value:"32"},{label:"Top T",value:"−95 °C"},{label:"Pressure",value:"35 bar"}],
    pids:[
      {driveId:"10tqueQZHEfRYAZPEa3XVQLygMibHwkJo", drawing:"85-X07-10", title:{en:"Demethaniser",fr:"Déméthaniseur"}},
    ],
  },
  {
    id:"108-F731", display:"108-F07.31", x:18.5, y:80, w:5, h:15, shape:"tall-col", color:"#4ade80",
    section:"fract",
    name:{ en:"De-ethaniser", fr:"Dééthaniseur" },
    desc:{ en:"Recovers ethane overhead for fuel/export; C3+ bottoms sent to depropaniser.",
           fr:"Récupère l'éthane en tête pour combustible/export ; fond C3+ envoyé au dépropaniseur." },
    specs:[{label:"Trays",value:"40"},{label:"Pressure",value:"28 bar"},{label:"Reboiler",value:"Steam"}],
    pids:[
      {driveId:"16JOnZ04Stw9vnQXcSTTreby_gctLwmFb", drawing:"85-X08-10", title:{en:"De-ethaniser",fr:"Dééthaniseur"}},
    ],
  },
  {
    id:"109-F741", display:"109-F07.41", x:28.5, y:80, w:5, h:15, shape:"tall-col", color:"#86efac",
    section:"fract",
    name:{ en:"Depropaniser", fr:"Dépropaniseur" },
    desc:{ en:"Produces commercial propane overhead (LPG cut); C4+ bottoms to debutaniser.",
           fr:"Produit du propane commercial en tête (coupe GPL) ; fond C4+ au débutaniseur." },
    specs:[{label:"Trays",value:"45"},{label:"Pressure",value:"18 bar"},{label:"Product",value:"Propane LPG"}],
    pids:[
      {driveId:"1uaKCbX73t0udB6xVd89r_wSHEdGMm61f", drawing:"85-X09-10", title:{en:"Depropaniser",fr:"Dépropaniseur"}},
    ],
  },
  {
    id:"110-F751", display:"110-F07.51", x:38.5, y:80, w:5, h:15, shape:"tall-col", color:"#eab308",
    section:"fract",
    name:{ en:"Debutaniser", fr:"Débutaniseur" },
    desc:{ en:"Separates butane (LPG, overhead) from natural gasoline (bottom condensate).",
           fr:"Sépare le butane (GPL, tête) de l'essence naturelle (condensat fond)." },
    specs:[{label:"Trays",value:"38"},{label:"Pressure",value:"8 bar"},{label:"Top product",value:"Butane LPG"},{label:"Bottom",value:"Gasoline C5+"}],
    pids:[
      {driveId:"1YShEFvAQ7uczpYvz0Ek25XsvqVnjo5Lt", drawing:"85-X10-10.1", title:{en:"Debutaniser",         fr:"Débutaniseur"}},
      {driveId:"1bFhEhleLR12lnd5t17D1XTU6-cmuNbtC", drawing:"85-X10-10.2", title:{en:"Debutaniser Reflux",  fr:"Reflux Débutaniseur"}},
    ],
  },
  {
    id:"7E2-G765", display:"7E2-G07.65", x:56, y:82, w:7, h:7, shape:"circle", color:"#f59e0b",
    section:"fract",
    name:{ en:"Fuel Gas Knock-Out Drum", fr:"Ballon K.O. Gaz Combustible" },
    desc:{ en:"Liquid knockout drum on the plant fuel gas header before distribution to turbines and boilers.",
           fr:"Ballon K.O. sur le collecteur de gaz combustible avant distribution aux turbines et chaudières." },
    specs:[{label:"Pressure",value:"28 bar"}],
    pids:[
      {driveId:"1OwWhnqMPPY4-v3SAuWclv_IKurN5ntdO", drawing:"85-X02-10.3", title:{en:"Fuel Gas Compressor & Dryer",fr:"Compresseur GC & Sécheur"}},
    ],
  },

  /* ══ FUEL GAS ════════════════════════════════════════════════ */
  {
    id:"102-K130", display:"102-K01.30", x:91, y:13, w:9, h:6, shape:"diamond", color:"#f97316",
    section:"fuel",
    name:{ en:"Fuel Gas Compressor", fr:"Compresseur Gaz Combustible" },
    desc:{ en:"Boosts BOG and flash gas to plant fuel header pressure for turbines, boilers and flare pilots.",
           fr:"Comprime le BOG et gaz de détente vers la pression du collecteur de combustible pour turbines, chaudières et pilotes de torche." },
    specs:[{label:"Discharge P",value:"28 bar"},{label:"Driver",value:"GE turbine"},{label:"Application",value:"BOG + flash gas"}],
    pids:[
      {driveId:"1OwWhnqMPPY4-v3SAuWclv_IKurN5ntdO", drawing:"85-X02-10.3", title:{en:"Fuel Gas Compressor & Dryer",fr:"Compresseur GC & Sécheur"}},
      {driveId:"1hcKllyNgpLX48WcBPRpg7GkWY0ZrPhc1", drawing:"85-X02-10.5", title:{en:"Fuel Gas Comp. — Oil Flow", fr:"Comp. GC — Flux d'Huile"}},
    ],
  },
];

/* ─── helpers ────────────────────────────────────────────────── */
function previewUrl(id: string) { return `https://drive.google.com/file/d/${id}/preview`; }
function viewUrl(id: string)    { return `https://drive.google.com/file/d/${id}/view`; }

function HotspotShape({ e, selected, hovered }: { e: Equip; selected: boolean; hovered: boolean }) {
  const fill   = selected ? ACCENT : hovered ? e.color : "transparent";
  const stroke = selected ? ACCENT : hovered ? e.color : e.color;
  const op     = selected ? 0.75   : hovered ? 0.6     : 0.35;
  const sw     = selected ? 0.6    : hovered ? 0.55    : 0.35;
  const { x, y, w, h } = e;
  const props  = { fill, fillOpacity: op, stroke, strokeWidth: sw, strokeOpacity: 0.95 };

  switch (e.shape) {
    case "tall-col":
      return <ellipse cx={x} cy={y} rx={w/2} ry={h/2} {...props} />;
    case "short-col":
      return <ellipse cx={x} cy={y} rx={w/2} ry={h/2} {...props} />;
    case "h-drum":
      return <ellipse cx={x} cy={y} rx={w/2} ry={h/2} {...props} />;
    case "v-drum":
      return <ellipse cx={x} cy={y} rx={w/2} ry={h/2} {...props} />;
    case "hex": {
      const hw=w/2,hh=h/2,q=hw*0.55;
      const pts=`${x-hw},${y} ${x-q},${y-hh} ${x+q},${y-hh} ${x+hw},${y} ${x+q},${y+hh} ${x-q},${y+hh}`;
      return <polygon points={pts} {...props} />;
    }
    case "diamond": {
      const hw=w/2,hh=h/2;
      const pts=`${x},${y-hh} ${x+hw},${y} ${x},${y+hh} ${x-hw},${y}`;
      return <polygon points={pts} {...props} />;
    }
    case "circle":
      return <circle cx={x} cy={y} r={Math.min(w,h)/2} {...props} />;
    default:
      return <rect x={x-w/2} y={y-h/2} width={w} height={h} rx="0.5" {...props} />;
  }
}

/* ─── main component ─────────────────────────────────────────── */
export default function ProcessFlow() {
  const { lang } = useI18n();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoverId,    setHoverId]    = useState<string | null>(null);
  const [panelOpen,  setPanelOpen]  = useState(true);
  const [activePid,  setActivePid]  = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const [zoom,  setZoom]  = useState(1);
  const [panX,  setPanX]  = useState(0);
  const [panY,  setPanY]  = useState(0);
  const dragRef = React.useRef<{sx:number;sy:number;px:number;py:number}|null>(null);

  const selected = EQUIP.find(e => e.id === selectedId) ?? null;
  const T = (en: string, fr: string) => lang === "fr" ? fr : en;

  /* reset pid tab when equipment changes */
  React.useEffect(() => { setActivePid(0); }, [selectedId]);

  /* fullscreen esc key */
  useEffect(() => {
    if (!fullscreen) return;
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") setFullscreen(false); };
    window.addEventListener("keydown", fn);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", fn); document.body.style.overflow = ""; };
  }, [fullscreen]);

  /* pan/zoom handlers */
  const vbW = VW / zoom, vbH = VH / zoom;
  const vbX = (VW - vbW)/2 - panX/zoom;
  const vbY = (VH - vbH)/2 - panY/zoom;

  const onMouseDown = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if ((e.target as Element).closest("[data-hot]")) return;
    dragRef.current = { sx:e.clientX, sy:e.clientY, px:panX, py:panY };
  }, [panX, panY]);
  const onMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (!dragRef.current) return;
    const r = e.currentTarget.getBoundingClientRect();
    setPanX(dragRef.current.px + (e.clientX - dragRef.current.sx) * (VW / r.width)  * 0.5);
    setPanY(dragRef.current.py + (e.clientY - dragRef.current.sy) * (VH / r.height) * 0.5);
  }, []);
  const onMouseUp = useCallback(() => { dragRef.current = null; }, []);
  const onWheel   = useCallback((e: React.WheelEvent<SVGSVGElement>) => {
    e.preventDefault();
    setZoom(z => Math.min(Math.max(z * (e.deltaY < 0 ? 1.15 : 1/1.15), 0.7), 6));
  }, []);

  /* ── render ── */
  return (
    <div className={fullscreen ? "fixed inset-0 z-50 flex flex-col bg-black" : "px-4 md:px-10 py-8 max-w-[1600px] mx-auto"}>

      {/* ── page header (hidden in fullscreen) ── */}
      {!fullscreen && (
        <div className="mb-5">
          <div className="text-[10px] uppercase tracking-widest font-mono mb-1" style={{color:ACCENT}}>
            / {T("Interactive Process Flow · GNL1Z", "Schéma Procédé Interactif · GNL1Z")}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
            {T("LNG Liquefaction Train","Train de Liquéfaction GNL")}<span style={{color:ACCENT}}>.</span>
          </h1>
          <p className="text-muted-foreground text-sm max-w-2xl">
            {T("Click any equipment tag on the DCS mimic to read specs and open its P&ID drawings from Google Drive. Scroll to zoom · drag to pan.",
               "Cliquez un équipement sur le mimic DCS pour voir ses spécifications et ouvrir ses plans P&ID depuis Google Drive. Molette pour zoomer · glisser pour panoramique.")}
          </p>
        </div>
      )}

      {/* ── diagram + panel wrapper ── */}
      <div className={`relative flex overflow-hidden ${fullscreen ? "flex-1" : "rounded-xl border border-border shadow-2xl"}`}
           style={{background:"#080d14"}}>

        {/* ── SVG diagram ── */}
        <div className="relative flex-1 overflow-hidden">
          {/* toolbar */}
          <div className="absolute top-2 right-2 z-20 flex flex-col gap-1.5">
            {([
              { Icon: ZoomIn,    fn: () => setZoom(z => Math.min(z*1.25, 6)) },
              { Icon: ZoomOut,   fn: () => setZoom(z => Math.max(z/1.25, 0.7)) },
              { Icon: RotateCcw, fn: () => { setZoom(1); setPanX(0); setPanY(0); } },
              { Icon: fullscreen ? Minimize2 : Maximize2, fn: () => setFullscreen(f=>!f) },
            ] as const).map(({Icon,fn},i) => (
              <button key={i} onClick={fn}
                className="h-8 w-8 flex items-center justify-center rounded-lg border border-white/10 bg-black/60 text-white/60 hover:text-white hover:bg-white/15 transition-all backdrop-blur-sm">
                <Icon className="h-3.5 w-3.5" />
              </button>
            ))}
            {/* panel toggle */}
            <button onClick={() => setPanelOpen(p => !p)}
              title={panelOpen ? T("Hide panel","Masquer panneau") : T("Show panel","Afficher panneau")}
              className="h-8 w-8 flex items-center justify-center rounded-lg border border-white/10 bg-black/60 text-white/60 hover:text-white hover:bg-white/15 transition-all backdrop-blur-sm mt-1"
              style={{ borderColor: panelOpen ? `${ACCENT}80` : undefined, color: panelOpen ? ACCENT : undefined }}>
              {panelOpen ? <PanelRightClose className="h-3.5 w-3.5"/> : <PanelRightOpen className="h-3.5 w-3.5"/>}
            </button>
          </div>

          {/* hint */}
          <div className="absolute bottom-2 left-3 z-10 text-[9px] font-mono text-white/25 pointer-events-none select-none">
            {T("click equipment tag · scroll to zoom · drag to pan","cliquer équipement · molette zoom · glisser panoramique")}
            {fullscreen ? " · Esc" : ""}
          </div>

          <svg
            viewBox={`${vbX} ${vbY} ${vbW} ${vbH}`}
            preserveAspectRatio="xMidYMid meet"
            className="w-full block select-none"
            style={{
              aspectRatio: fullscreen ? undefined : `${VW}/${VH}`,
              height: fullscreen ? "100%" : undefined,
              cursor: dragRef.current ? "grabbing" : "grab",
            }}
            onMouseDown={onMouseDown} onMouseMove={onMouseMove}
            onMouseUp={onMouseUp} onMouseLeave={onMouseUp}
            onWheel={onWheel}
          >
            <defs>
              {/* pulse ring for selected */}
              <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="0.8" result="blur"/>
                <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
            </defs>

            {/* ── background: DCS mimic at full opacity ── */}
            <image
              href="/process-mimic.jpg"
              x="0" y="0" width={VW} height={VH}
              preserveAspectRatio="xMidYMid slice"
            />

            {/* ── dim overlay when something is selected ── */}
            {selectedId && (
              <rect x="0" y="0" width={VW} height={VH}
                fill="black" fillOpacity="0.35" style={{pointerEvents:"none"}}/>
            )}

            {/* ── hotspot buttons ── */}
            {EQUIP.map(e => {
              const isSel = e.id === selectedId;
              const isHov = e.id === hoverId;
              return (
                <g key={e.id} data-hot="1"
                  style={{cursor:"pointer"}}
                  onClick={() => setSelectedId(e.id === selectedId ? null : e.id)}
                  onMouseEnter={() => setHoverId(e.id)}
                  onMouseLeave={() => setHoverId(null)}
                >
                  {/* pulse ring */}
                  {isSel && (
                    <ellipse cx={e.x} cy={e.y}
                      rx={e.w/2 + 1.5} ry={e.h/2 + 1.5}
                      fill="none" stroke={ACCENT} strokeWidth="0.4" filter="url(#glow)">
                      <animate attributeName="rx" values={`${e.w/2+1};${e.w/2+2.5};${e.w/2+1}`} dur="2s" repeatCount="indefinite"/>
                      <animate attributeName="ry" values={`${e.h/2+1};${e.h/2+2.5};${e.h/2+1}`} dur="2s" repeatCount="indefinite"/>
                      <animate attributeName="opacity" values="0.8;0.2;0.8" dur="2s" repeatCount="indefinite"/>
                    </ellipse>
                  )}

                  <HotspotShape e={e} selected={isSel} hovered={isHov}/>

                  {/* label: show always for selected/hovered, show tiny always */}
                  {(isSel || isHov) ? (
                    <text x={e.x} y={e.y + e.h/2 + 2.2}
                      textAnchor="middle" fontSize="1.5" fontFamily="monospace" fontWeight="bold"
                      fill={isSel ? ACCENT : "white"} filter="url(#glow)">
                      {e.id}
                    </text>
                  ) : (
                    <text x={e.x} y={e.y + e.h/2 + 1.8}
                      textAnchor="middle" fontSize="1.1" fontFamily="monospace"
                      fill={e.color} fillOpacity="0.7">
                      {e.id}
                    </text>
                  )}

                  {/* P&ID dot indicator */}
                  {e.pids.length > 0 && (
                    <circle cx={e.x + e.w/2 - 0.5} cy={e.y - e.h/2 + 0.5} r="0.6"
                      fill={isSel ? "white" : ACCENT} fillOpacity={isSel ? 1 : 0.85}/>
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        {/* ── right panel ── */}
        {selected && panelOpen && (
          <div
            className="flex flex-col border-l border-white/10 bg-[#080d14]/95 backdrop-blur-lg overflow-y-auto shrink-0"
            style={{width:"min(400px,42%)"}}
          >
            {/* panel header */}
            <div className="sticky top-0 z-10 flex items-center justify-between gap-2 px-4 py-3 border-b border-white/10 bg-[#060a11]/90 backdrop-blur-md">
              <div className="min-w-0">
                <div className="text-[9px] font-mono uppercase tracking-widest text-white/35 truncate">
                  {T(SEC[selected.section].en, SEC[selected.section].fr)}
                </div>
                <div className="text-sm font-bold text-white leading-tight truncate">
                  {T(selected.name.en, selected.name.fr)}
                </div>
                <div className="text-[10px] font-mono mt-0.5" style={{color:ACCENT}}>{selected.id}</div>
              </div>
              <button onClick={() => setSelectedId(null)}
                className="h-7 w-7 flex items-center justify-center rounded border border-white/10 text-white/40 hover:text-white hover:bg-white/10 shrink-0 transition-colors">
                <X className="h-3.5 w-3.5"/>
              </button>
            </div>

            <div className="p-4 flex flex-col gap-5 text-sm">
              {/* description */}
              <p className="text-white/65 leading-relaxed text-[13px]">
                {T(selected.desc.en, selected.desc.fr)}
              </p>

              {/* specs */}
              <div>
                <div className="text-[9px] uppercase tracking-widest font-mono mb-2" style={{color:ACCENT}}>
                  {T("Technical Specs","Spécifications")}
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {selected.specs.map(s => (
                    <div key={s.label} className="rounded-lg p-2.5 border border-white/8 bg-white/4">
                      <div className="text-[9px] uppercase tracking-wider text-white/35 font-mono">{s.label}</div>
                      <div className="text-sm font-bold text-white mt-0.5">{s.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* P&ID drawings */}
              <div>
                <div className="text-[9px] uppercase tracking-widest font-mono mb-2 flex items-center gap-1.5" style={{color:ACCENT}}>
                  <FileText className="h-3 w-3"/>
                  {T("P&ID Drawings","Plans P&ID")}
                  <span className="text-white/25">({selected.pids.length})</span>
                </div>

                {/* drawing tabs */}
                {selected.pids.length > 1 && (
                  <div className="flex gap-1 flex-wrap mb-2">
                    {selected.pids.map((p,i) => (
                      <button key={p.driveId} onClick={() => setActivePid(i)}
                        className="text-[9px] font-mono px-2 py-1 rounded border transition-all"
                        style={{
                          borderColor: i===activePid ? ACCENT : "rgba(255,255,255,0.1)",
                          background:  i===activePid ? `${ACCENT}20` : "transparent",
                          color:       i===activePid ? ACCENT : "rgba(255,255,255,0.4)",
                        }}>
                        {p.drawing}
                      </button>
                    ))}
                  </div>
                )}

                {/* active drawing info */}
                <div className="flex items-center justify-between mb-1.5">
                  <div>
                    <div className="text-[9px] font-mono text-white/35">{selected.pids[activePid]?.drawing}</div>
                    <div className="text-[11px] text-white/75 font-medium leading-tight">
                      {T(selected.pids[activePid]?.title.en, selected.pids[activePid]?.title.fr)}
                    </div>
                  </div>
                  <a href={viewUrl(selected.pids[activePid]?.driveId)}
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 text-[9px] font-mono text-white/35 hover:text-white transition-colors">
                    <ExternalLink className="h-3 w-3"/>
                    {T("Full res.","Pleine rés.")}
                  </a>
                </div>

                {/* PDF iframe */}
                <div className="rounded-lg overflow-hidden border border-white/10" style={{aspectRatio:"4/3"}}>
                  <iframe
                    key={selected.pids[activePid]?.driveId}
                    src={previewUrl(selected.pids[activePid]?.driveId)}
                    title={selected.pids[activePid]?.drawing}
                    className="w-full h-full border-0"
                    allow="autoplay"
                  />
                </div>
                <p className="text-[9px] font-mono text-white/20 mt-1 text-center">
                  {T("Google Drive preview — click ↗ for full resolution",
                     "Aperçu Google Drive — cliquer ↗ pour pleine résolution")}
                </p>
              </div>

              {/* footer link */}
              <div className="pt-2 border-t border-white/8">
                <Link to="/pid"
                  className="flex items-center gap-1.5 text-[10px] font-mono text-white/35 hover:text-white transition-colors">
                  <ChevronRight className="h-3 w-3"/>
                  {T("Browse full P&ID library →","Bibliothèque P&ID complète →")}
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* collapsed panel stub */}
        {selected && !panelOpen && (
          <div className="flex flex-col items-center py-4 px-2 border-l border-white/10 bg-[#080d14]/80 shrink-0 gap-2">
            <div className="text-[9px] font-mono text-white/30 [writing-mode:vertical-lr] rotate-180 tracking-wider">
              {selected.id}
            </div>
            <button onClick={() => setPanelOpen(true)}
              className="mt-auto h-7 w-7 flex items-center justify-center rounded border border-white/10 text-white/30 hover:text-white hover:bg-white/10 transition-colors">
              <PanelRightOpen className="h-3.5 w-3.5"/>
            </button>
          </div>
        )}
      </div>

      {!fullscreen && (
        <div className="flex flex-wrap gap-6 mt-3 text-[10px] font-mono text-muted-foreground">
          <span>{EQUIP.length} {T("equipment items","équipements")}</span>
          <span><span style={{color:ACCENT}}>●</span> {T("orange dot = P&ID linked","point orange = P&ID lié")}</span>
          <span>{T("Hover to identify · Click to inspect","Survoler pour identifier · Cliquer pour inspecter")}</span>
        </div>
      )}
    </div>
  );
    }
