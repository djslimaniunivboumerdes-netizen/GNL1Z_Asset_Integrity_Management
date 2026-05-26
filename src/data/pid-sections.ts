// ─────────────────────────────────────────────────────────────────────────────
// GNL1Z – P&ID Sections Registry (44 drawings)
// Process order: 1 = first, 44 = last
// Replace "YOUR_FILE_ID_HERE" with actual Google Drive file IDs
// ─────────────────────────────────────────────────────────────────────────────

export type PIDCategory =
  | "treatment"
  | "pre-cooling"
  | "liquefaction"
  | "fractionation"
  | "storage-loading"
  | "utilities"
  | "safety";

export interface PIDSection {
  id: string;
  title: string;
  subtitle: string;
  unit: string;
  fileId: string; // Google Drive file ID
  equipment: string[]; // Equipment tags on this drawing
  description: string;
  drawing: string; // Bechtel / vendor drawing number
  revision?: number;
  category: PIDCategory;
  processOrder: number;
}

/** Google Drive thumbnail URL. File must be shared "Anyone with the link". */
export function driveImageUrl(fileId: string, sz = "w2000"): string {
  return `https://drive.google.com/thumbnail?id=${fileId}&sz=${sz}`;
}

/** Direct Google Drive viewer URL (opens in new tab). */
export function driveViewerUrl(fileId: string): string {
  return `https://drive.google.com/file/d/${fileId}/preview`;
}

export const PID_SECTIONS: PIDSection[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // 1. FEED GAS TREATMENT (Drawings 1–8)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "feed-inlet",
    title: "Feed Gas Inlet",
    subtitle: "Metering & KO Drum",
    unit: "Feed Gas Treatment",
    fileId: "YOUR_FILE_ID_HERE",
    equipment: ["G501", "FT-1001", "PT-1001"],
    description: "Feed gas reception from Arzew pipeline. Inlet KO drum, metering skid, and pressure control.",
    drawing: "85-X01-10.1",
    revision: 3,
    category: "treatment",
    processOrder: 1,
  },
  {
    id: "co2-removal",
    title: "CO₂ Removal",
    subtitle: "MDEA Absorber",
    unit: "Feed Gas Treatment",
    fileId: "1XnQlsFf0j5eNlUDr9rKZfZkr3h2tGNDi",
    equipment: ["F501", "F502", "G507", "E503", "E504"],
    description: "CO₂ removal absorber using MDEA solvent. Feed natural gas is contacted counter-currently to absorb CO₂ before cryogenic processing.",
    drawing: "85-X01-10.3",
    revision: 6,
    category: "treatment",
    processOrder: 2,
  },
  {
    id: "amine-regen",
    title: "Amine Regeneration",
    subtitle: "Stripper & Reboiler",
    unit: "Feed Gas Treatment",
    fileId: "YOUR_FILE_ID_HERE",
    equipment: ["F502", "E504", "G505", "P506"],
    description: "Rich amine regeneration system. Steam-stripped stripper returns lean amine to the absorber.",
    drawing: "85-X01-10.4",
    revision: 4,
    category: "treatment",
    processOrder: 3,
  },
  {
    id: "dehydration",
    title: "Dehydration",
    subtitle: "Mol-Sieve Beds",
    unit: "Feed Gas Treatment",
    fileId: "YOUR_FILE_ID_HERE",
    equipment: ["R03.10", "R03.11", "G07.87", "E07.88"],
    description: "Molecular sieve dehydration to <1 ppmv H₂O. Twin-bed adsorption with regeneration cycle.",
    drawing: "85-X02-10.1",
    revision: 5,
    category: "treatment",
    processOrder: 4,
  },
  {
    id: "mercury-removal",
    title: "Mercury Removal",
    subtitle: "Guard Bed",
    unit: "Feed Gas Treatment",
    fileId: "YOUR_FILE_ID_HERE",
    equipment: ["R03.12", "G07.89"],
    description: "Sulphur-impregnated activated carbon bed removing Hg to <0.01 µg/Nm³.",
    drawing: "85-X02-10.2",
    revision: 2,
    category: "treatment",
    processOrder: 5,
  },
  {
    id: "feed-compression",
    title: "Feed Compression",
    subtitle: "Booster Compressor",
    unit: "Feed Gas Treatment",
    fileId: "YOUR_FILE_ID_HERE",
    equipment: ["K01.01", "G07.80", "E07.81"],
    description: "Feed gas booster compression and aftercooling before pre-cooling stage.",
    drawing: "85-X01-10.5",
    revision: 3,
    category: "treatment",
    processOrder: 6,
  },
  {
    id: "feed-heating",
    title: "Feed Heating",
    subtitle: "Pre-heat Exchangers",
    unit: "Feed Gas Treatment",
    fileId: "YOUR_FILE_ID_HERE",
    equipment: ["E07.82", "E07.83"],
    description: "Feed gas pre-heating and temperature control before propane pre-cooling.",
    drawing: "85-X01-10.6",
    revision: 2,
    category: "treatment",
    processOrder: 7,
  },
  {
    id: "treatment-utilities",
    title: "Treatment Utilities",
    subtitle: "Drains & Vents",
    unit: "Feed Gas Treatment",
    fileId: "YOUR_FILE_ID_HERE",
    equipment: ["G07.84", "G07.85"],
    description: "Collection and disposal of treatment unit drains, vents, and relief valves.",
    drawing: "85-X01-10.7",
    revision: 1,
    category: "treatment",
    processOrder: 8,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 2. PROPANE PRE-COOLING (Drawings 9–16)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "propane-chillers",
    title: "Propane Chillers",
    subtitle: "E524 / E525 / E526",
    unit: "Pre-cooling",
    fileId: "YOUR_FILE_ID_HERE",
    equipment: ["E524", "E525A", "E525B", "E526A", "E526B"],
    description: "Propane refrigeration chillers at MP and LP pressure levels. Kettle-type exchangers cool feed gas and MCR streams.",
    drawing: "85-X04-10.2",
    revision: 6,
    category: "pre-cooling",
    processOrder: 9,
  },
  {
    id: "propane-compressor",
    title: "Propane Compressor",
    subtitle: "C3 Refrigeration",
    unit: "Pre-cooling",
    fileId: "YOUR_FILE_ID_HERE",
    equipment: ["K01.10", "G07.86", "E07.11", "E07.12"],
    description: "4-stage centrifugal propane compressor with inter-stage cooling and suction drum protection.",
    drawing: "85-X04-10.3",
    revision: 5,
    category: "pre-cooling",
    processOrder: 10,
  },
  {
    id: "propane-accumulators",
    title: "Propane Accumulators",
    subtitle: "HP / MP / LP",
    unit: "Pre-cooling",
    fileId: "YOUR_FILE_ID_HERE",
    equipment: ["G07.85", "G07.90", "G07.91"],
    description: "Propane refrigerant accumulation and flash drums at HP, MP, and LP pressure levels.",
    drawing: "85-X04-10.4",
    revision: 4,
    category: "pre-cooling",
    processOrder: 11,
  },
  {
    id: "scrub-tower",
    title: "Scrub Tower",
    subtitle: "Heavy HC Removal",
    unit: "Pre-cooling",
    fileId: "1aNlMZ1PutUuOBqEh70GRxyyy7RF8wM9w",
    equipment: ["F711", "E713", "E717", "E523"],
    description: "Scrub tower with steam/butane vaporiser, tower reboiler, condenser and supplementary chiller. Removes heavy hydrocarbons before liquefaction.",
    drawing: "85-X04-10.1",
    revision: 8,
    category: "pre-cooling",
    processOrder: 12,
  },
  {
    id: "feed-chilling",
    title: "Feed Chilling",
    subtitle: "E522 / E523",
    unit: "Pre-cooling",
    fileId: "YOUR_FILE_ID_HERE",
    equipment: ["E522", "E523", "E05.20"],
    description: "Feed gas chilling with propane refrigerant to −35 °C before MCHE entry.",
    drawing: "85-X04-10.5",
    revision: 5,
    category: "pre-cooling",
    processOrder: 13,
  },
  {
    id: "propane-aftercooler",
    title: "Propane Aftercooler",
    subtitle: "CW Condensation",
    unit: "Pre-cooling",
    fileId: "YOUR_FILE_ID_HERE",
    equipment: ["E07.11", "E07.12", "G07.92"],
    description: "Cooling-water aftercoolers condensing HP propane discharge before the accumulator.",
    drawing: "85-X04-10.6",
    revision: 3,
    category: "pre-cooling",
    processOrder: 14,
  },
  {
    id: "propane-pumps",
    title: "Propane Pumps",
    subtitle: "Refrigerant Circulation",
    unit: "Pre-cooling",
    fileId: "YOUR_FILE_ID_HERE",
    equipment: ["J01.10", "J01.11", "G07.93"],
    description: "Propane refrigerant circulation pumps and pump-around system.",
    drawing: "85-X04-10.7",
    revision: 2,
    category: "pre-cooling",
    processOrder: 15,
  },
  {
    id: "pre-cool-utilities",
    title: "Pre-cool Utilities",
    subtitle: "Relief & Drains",
    unit: "Pre-cooling",
    fileId: "YOUR_FILE_ID_HERE",
    equipment: ["G07.94", "G07.95"],
    description: "Pre-cooling unit relief valve collection and drain systems.",
    drawing: "85-X04-10.8",
    revision: 1,
    category: "pre-cooling",
    processOrder: 16,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 3. LIQUEFACTION — MCR / MCHE (Drawings 17–26)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "main-exchanger",
    title: "Main Cryogenic Exchanger",
    subtitle: "MCHE Sheet 1",
    unit: "Liquefaction",
    fileId: "1HZw_f38-vQEkcDh5GmrROaYUsv7_Gs-s",
    equipment: ["E520", "R792", "R793"],
    description: "Main cryogenic PFHE heat exchanger for final liquefaction of methane. MCR warm & cold streams, LNG product and MR liquid/vapour streams shown.",
    drawing: "85-X06-10.17",
    revision: 17,
    category: "liquefaction",
    processOrder: 17,
  },
  {
    id: "main-exchanger-2",
    title: "Main Cryogenic Exchanger",
    subtitle: "MCHE Sheet 2 — Detail",
    unit: "Liquefaction",
    fileId: "YOUR_FILE_ID_HERE",
    equipment: ["E520", "R792", "R793", "G07.83"],
    description: "Detail sheet for MCHE nozzles, piping, and support structure.",
    drawing: "85-X06-10.17B",
    revision: 12,
    category: "liquefaction",
    processOrder: 18,
  },
  {
    id: "mcr-separator",
    title: "MCR Separator",
    subtitle: "HP Knock-out",
    unit: "Liquefaction",
    fileId: "YOUR_FILE_ID_HERE",
    equipment: ["G07.83", "G07.84"],
    description: "High-pressure MCR separator splitting mixed refrigerant into liquid and vapour phases.",
    drawing: "85-X06-10.1",
    revision: 8,
    category: "liquefaction",
    processOrder: 19,
  },
  {
    id: "mcr-compressor-lp",
    title: "MCR Compressor LP/MP",
    subtitle: "Mixed Refrigerant",
    unit: "Liquefaction",
    fileId: "YOUR_FILE_ID_HERE",
    equipment: ["K01.20", "G07.88", "E07.20"],
    description: "Low and medium-pressure bodies of the mixed-refrigerant centrifugal compressor train.",
    drawing: "85-X06-10.2",
    revision: 9,
    category: "liquefaction",
    processOrder: 20,
  },
  {
    id: "mcr-compressor-hp",
    title: "MCR Compressor HP",
    subtitle: "Final Compression",
    unit: "Liquefaction",
    fileId: "YOUR_FILE_ID_HERE",
    equipment: ["K01.21", "K05-G07.89", "E07.21"],
    description: "High-pressure body — final stage of the MCR compression loop with aftercooler.",
    drawing: "85-X06-10.3",
    revision: 7,
    category: "liquefaction",
    processOrder: 21,
  },
  {
    id: "mcr-feed-chilling",
    title: "MCR & Feed Chilling",
    subtitle: "Refrigerant Circuit",
    unit: "Liquefaction",
    fileId: "1l2sSD2QO7VU29tmAFciLRJKUra7HCUiC",
    equipment: ["E522", "E524", "E525A", "E525B", "E526A", "E526B", "G785", "G790"],
    description: "Mixed Coolant Refrigerant propane pre-cooling circuit. Includes MP & LP propane chillers, suction drums and feed propane chiller.",
    drawing: "85-X04-10.25",
    revision: 7,
    category: "liquefaction",
    processOrder: 22,
  },
  {
    id: "mcr-distribution",
    title: "MCR Distribution",
    subtitle: "Manifolds & Control",
    unit: "Liquefaction",
    fileId: "YOUR_FILE_ID_HERE",
    equipment: ["G07.96", "G07.97", "XV-2001", "XV-2002"],
    description: "Mixed refrigerant distribution manifolds, JT valves, and flow control to MCHE.",
    drawing: "85-X06-10.4",
    revision: 6,
    category: "liquefaction",
    processOrder: 23,
  },
  {
    id: "lng-subcooling",
    title: "LNG Subcooling",
    subtitle: "End Flash",
    unit: "Liquefaction",
    fileId: "YOUR_FILE_ID_HERE",
    equipment: ["E521", "G07.98", "J07.99"],
    description: "LNG subcooler and end-flash drum for final temperature reduction before storage.",
    drawing: "85-X06-10.5",
    revision: 4,
    category: "liquefaction",
    processOrder: 24,
  },
  {
    id: "liquefaction-utilities",
    title: "Liquefaction Utilities",
    subtitle: "Relief & Instrument Air",
    unit: "Liquefaction",
    fileId: "YOUR_FILE_ID_HERE",
    equipment: ["G07.100", "G07.101"],
    description: "Liquefaction unit utility stations, instrument air, and relief valve headers.",
    drawing: "85-X06-10.6",
    revision: 2,
    category: "liquefaction",
    processOrder: 25,
  },
  {
    id: "mcr-storage",
    title: "MCR Storage",
    subtitle: "Refrigerant Inventory",
    unit: "Liquefaction",
    fileId: "YOUR_FILE_ID_HERE",
    equipment: ["G07.102", "J07.103"],
    description: "Mixed refrigerant make-up and storage drum with transfer pump.",
    drawing: "85-X06-10.7",
    revision: 1,
    category: "liquefaction",
    processOrder: 26,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 4. FRACTIONATION (Drawings 27–36)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "demethanizer",
    title: "Demethanizer",
    subtitle: "Fractionation Column",
    unit: "Fractionation Train",
    fileId: "10tqueQZHEfRYAZPEa3XVQLygMibHwkJo",
    equipment: ["F721", "F722", "E723", "G724", "E730"],
    description: "Demethanizer column with overhead condenser, reflux drum, reboiler and bottoms cooler. Separates methane from C₂+ NGL stream.",
    drawing: "85-X07-10",
    revision: 18,
    category: "fractionation",
    processOrder: 27,
  },
  {
    id: "demethanizer-detail",
    title: "Demethanizer",
    subtitle: "Detail — Reflux & Pumps",
    unit: "Fractionation Train",
    fileId: "1BfnfCho8YP4wfevhbZyJWfg23yAtPZkD",
    equipment: ["F721", "F722", "E723", "G724", "E730", "J725", "J727"],
    description: "Supplementary detail sheet for the demethanizer reflux pumps and bottoms section. Includes vertical section piping details.",
    drawing: "85-X07-10 (Detail)",
    revision: 18,
    category: "fractionation",
    processOrder: 28,
  },
  {
    id: "de-ethanizer",
    title: "De-ethanizer",
    subtitle: "Fractionation Column",
    unit: "Fractionation Train",
    fileId: "16JOnZ04Stw9vnQXcSTTreby_gctLwmFb",
    equipment: ["F731", "E732", "E733", "G734", "G736", "J735", "J740"],
    description: "De-ethanizer column with condenser, reboiler, reflux drum, propane separator and reflux pumps. Separates ethane from C₃+ stream.",
    drawing: "85-X08-10",
    revision: 5,
    category: "fractionation",
    processOrder: 29,
  },
  {
    id: "de-ethanizer-detail",
    title: "De-ethanizer",
    subtitle: "Detail — Bottoms",
    unit: "Fractionation Train",
    fileId: "YOUR_FILE_ID_HERE",
    equipment: ["F731", "E733", "J735"],
    description: "De-ethanizer bottoms section detail with reboiler piping and pump connections.",
    drawing: "85-X08-10.1",
    revision: 3,
    category: "fractionation",
    processOrder: 30,
  },
  {
    id: "depropanizer",
    title: "Depropanizer",
    subtitle: "Fractionation Column",
    unit: "Fractionation Train",
    fileId: "1uaKCbX73t0udB6xVd89r_wSHEdGMm61f",
    equipment: ["F741", "E742", "E743", "G744", "J745", "J748"],
    description: "Depropanizer column with overhead condenser, reboiler, reflux drum and reflux pumps. Separates propane from butanes and heavier NGL.",
    drawing: "85-X09-10",
    revision: 5,
    category: "fractionation",
    processOrder: 31,
  },
  {
    id: "depropanizer-detail",
    title: "Depropanizer",
    subtitle: "Detail — Overhead",
    unit: "Fractionation Train",
    fileId: "YOUR_FILE_ID_HERE",
    equipment: ["F741", "E742", "G744", "J745"],
    description: "Depropanizer overhead section detail with condenser and reflux drum piping.",
    drawing: "85-X09-10.1",
    revision: 2,
    category: "fractionation",
    processOrder: 32,
  },
  {
    id: "debutanizer",
    title: "Debutanizer",
    subtitle: "Fractionation Column",
    unit: "Fractionation Train",
    fileId: "1YShEFvAQ7uczpYvz0Ek25XsvqVnjo5Lt",
    equipment: ["F751", "E752", "E753", "G754", "J755", "J762"],
    description: "Debutanizer column with condenser, reboiler, reflux drum, reflux pumps and gasoline cooler. Produces natural gasoline and C₄ products.",
    drawing: "85-X10-10.1",
    revision: 5,
    category: "fractionation",
    processOrder: 33,
  },
  {
    id: "debutanizer-detail",
    title: "Debutanizer",
    subtitle: "Detail — Gasoline Rundown",
    unit: "Fractionation Train",
    fileId: "YOUR_FILE_ID_HERE",
    equipment: ["F751", "G754", "J762", "7E2-G07.65"],
    description: "Debutanizer gasoline rundown section with cooler and product drum.",
    drawing: "85-X10-10.2",
    revision: 3,
    category: "fractionation",
    processOrder: 34,
  },
  {
    id: "fractionation-heaters",
    title: "Fractionation Heaters",
    subtitle: "Reboiler Circuit",
    unit: "Fractionation Train",
    fileId: "YOUR_FILE_ID_HERE",
    equipment: ["E730", "E733", "E743", "E753"],
    description: "Common reboiler heating circuit for demethanizer, de-ethanizer, depropanizer and debutanizer columns.",
    drawing: "85-X07-10.5",
    revision: 4,
    category: "fractionation",
    processOrder: 35,
  },
  {
    id: "fractionation-utilities",
    title: "Fractionation Utilities",
    subtitle: "Relief & Drain",
    unit: "Fractionation Train",
    fileId: "YOUR_FILE_ID_HERE",
    equipment: ["G07.105", "G07.106"],
    description: "Fractionation train relief valve collection and drain systems.",
    drawing: "85-X07-10.6",
    revision: 1,
    category: "fractionation",
    processOrder: 36,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 5. LNG STORAGE & LOADING (Drawings 37–40)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "lng-tank",
    title: "LNG Storage Tank",
    subtitle: "Full Containment",
    unit: "Storage & Loading",
    fileId: "YOUR_FILE_ID_HERE",
    equipment: ["LNG-TK", "T-001", "T-002"],
    description: "Full-containment cryogenic LNG storage tank with primary and secondary containment.",
    drawing: "85-X11-10.1",
    revision: 6,
    category: "storage-loading",
    processOrder: 37,
  },
  {
    id: "lng-loading",
    title: "LNG Loading",
    subtitle: "Jetty & Arms",
    unit: "Storage & Loading",
    fileId: "YOUR_FILE_ID_HERE",
    equipment: ["LA-101", "LA-102", "P-101", "P-102"],
    description: "LNG loading jetty with cryogenic loading arms, vapor return, and ship manifold connections.",
    drawing: "85-X11-10.2",
    revision: 5,
    category: "storage-loading",
    processOrder: 38,
  },
  {
    id: "bog-system",
    title: "BOG System",
    subtitle: "Boil-off Gas",
    unit: "Storage & Loading",
    fileId: "YOUR_FILE_ID_HERE",
    equipment: ["K01.30", "G07.107", "E07.30"],
    description: "Boil-off gas compression, recondensation, and fuel gas utilization system.",
    drawing: "85-X11-10.3",
    revision: 4,
    category: "storage-loading",
    processOrder: 39,
  },
  {
    id: "storage-utilities",
    title: "Storage Utilities",
    subtitle: "Nitrogen & Instrument Air",
    unit: "Storage & Loading",
    fileId: "YOUR_FILE_ID_HERE",
    equipment: ["G07.108", "G07.109"],
    description: "LNG storage area nitrogen purge and instrument air distribution.",
    drawing: "85-X11-10.4",
    revision: 2,
    category: "storage-loading",
    processOrder: 40,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 6. UTILITIES (Drawings 41–42)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "utilities-main",
    title: "Utilities Distribution",
    subtitle: "Train 200",
    unit: "Utilities",
    fileId: "1j6y5B_BvpckdxFoGwvXRA9KULviD9xjx",
    equipment: ["G325", "T200"],
    description: "Miscellaneous utilities distribution for liquefaction train 200. Includes instrument air receiver, utility stations, LNG product pumps and associated distribution piping.",
    drawing: "85-X00-23",
    category: "utilities",
    processOrder: 41,
  },
  {
    id: "cooling-water",
    title: "Cooling Water System",
    subtitle: "G1 Circulation",
    unit: "Utilities",
    fileId: "YOUR_FILE_ID_HERE",
    equipment: ["E-CW-01", "P-CW-01", "P-CW-02"],
    description: "Cooling water circulation for propane aftercoolers and compressor intercoolers.",
    drawing: "85-X00-24",
    revision: 3,
    category: "utilities",
    processOrder: 42,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 7. SAFETY / RELIEF (Drawings 43–44)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "relief-header",
    title: "Relief Valve Header",
    subtitle: "Process Safety",
    unit: "Safety",
    fileId: "YOUR_FILE_ID_HERE",
    equipment: ["PSV-1001", "PSV-1002", "PSV-1003", "PSV-1004"],
    description: "Process relief valve collection header directing to flare KO drum and flare stack.",
    drawing: "85-X00-30",
    revision: 4,
    category: "safety",
    processOrder: 43,
  },
  {
    id: "fire-gas",
    title: "Fire & Gas Detection",
    subtitle: "Safety Systems",
    unit: "Safety",
    fileId: "YOUR_FILE_ID_HERE",
    equipment: ["FG-101", "FG-102", "HS-101", "HS-102"],
    description: "Fire and gas detection layout with deluge valve stations and ESD pushbuttons.",
    drawing: "85-X00-31",
    revision: 2,
    category: "safety",
    processOrder: 44,
  },
];

export const CATEGORY_META: Record<
  PIDCategory,
  { label: string; color: string; bg: string; border: string; dot: string }
> = {
  treatment: {
    label: "Feed Treatment",
    color: "text-emerald-400",
    bg: "bg-emerald-950/60",
    border: "border-emerald-700/50",
    dot: "bg-emerald-400",
  },
  "pre-cooling": {
    label: "Pre-cooling",
    color: "text-sky-400",
    bg: "bg-sky-950/60",
    border: "border-sky-700/50",
    dot: "bg-sky-400",
  },
  liquefaction: {
    label: "Liquefaction",
    color: "text-indigo-400",
    bg: "bg-indigo-950/60",
    border: "border-indigo-700/50",
    dot: "bg-indigo-400",
  },
  fractionation: {
    label: "Fractionation",
    color: "text-amber-400",
    bg: "bg-amber-950/60",
    border: "border-amber-700/50",
    dot: "bg-amber-400",
  },
  "storage-loading": {
    label: "Storage & Loading",
    color: "text-teal-400",
    bg: "bg-teal-950/60",
    border: "border-teal-700/50",
    dot: "bg-teal-400",
  },
  utilities: {
    label: "Utilities",
    color: "text-slate-400",
    bg: "bg-slate-900/60",
    border: "border-slate-600/50",
    dot: "bg-slate-400",
  },
  safety: {
    label: "Safety",
    color: "text-red-400",
    bg: "bg-red-950/60",
    border: "border-red-700/50",
    dot: "bg-red-400",
  },
};

/** Build a flat lookup: equipment tag → section */
export function buildEquipmentIndex(): Map<string, PIDSection> {
  const map = new Map<string, PIDSection>();
  for (const section of PID_SECTIONS) {
    for (const tag of section.equipment) {
      map.set(tag, section);
    }
  }
  return map;
}

/** Get all unique units */
export function getUnits(): string[] {
  return Array.from(new Set(PID_SECTIONS.map((s) => s.unit)));
}

/** Get sections by unit */
export function getSectionsByUnit(unit: string): PIDSection[] {
  return PID_SECTIONS.filter((s) => s.unit === unit).sort((a, b) => a.processOrder - b.processOrder);
    }
