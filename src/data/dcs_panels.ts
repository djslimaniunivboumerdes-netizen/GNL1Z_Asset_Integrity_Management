// src/data/dcs_panels.ts

export interface DCSPanel {
  id: string;
  title: string;
  section: string;
  description: string;
  imageUrl: string;           // Path to image in public/ or Supabase bucket
  tags: string[];             // Equipment tags shown on this panel
  status: 'normal' | 'alarm' | 'trip';
  lastUpdated: string;
  kpis: {
    [key: string]: string | number;
  };
  // Extra field used by DCS Directory thumbnails (Supabase storage path)
  storage_path: string;
}

// Helper: all the panels from the Smart‑Flow process, enriched with full metadata
export const DCS_PANELS: DCSPanel[] = [
  // ── GENERAL / OVERVIEW ────────────────────────────
  {
    id: "general-train",
    title: "General Train",
    section: "General",
    description: "Train-wide overview – main process streams and utilities",
    imageUrl: "/images/dcs/general train.jpg",
    tags: [],
    status: "normal",
    lastUpdated: "Live",
    kpis: { "LNG Production": "1,280 t/h", "Overall Availability": "98.7%" },
    storage_path: "dcs/general train.jpg",
  },
  {
    id: "retour-condensat",
    title: "Condensate Return",
    section: "General",
    description: "Condensate recovery and return system",
    imageUrl: "/images/dcs/Retour Condensat train.jpg",
    tags: [],
    status: "normal",
    lastUpdated: "Live",
    kpis: {},
    storage_path: "dcs/Retour Condensat train.jpg",
  },
  {
    id: "fuel-gas",
    title: "Fuel Gas System",
    section: "General",
    description: "Fuel gas distribution and control",
    imageUrl: "/images/dcs/fuel gas sys.jpg",
    tags: [],
    status: "normal",
    lastUpdated: "Live",
    kpis: { "Fuel Gas Pressure": "42 bar" },
    storage_path: "dcs/fuel gas sys.jpg",
  },

  // ── FEED TREATMENT (MEA) ───────────────────────────
  {
    id: "decarbonation-01",
    title: "Decarbonation MEA 1",
    section: "Treatment",
    description: "Primary MEA CO₂ removal – absorber & flash drum",
    imageUrl: "/images/dcs/decarbonation-01.jpg",
    tags: ["FIC101205","XV-101-223","LIC101204","TI101101","AI10138","TIC10125","LIC10121","PIC101215","TI101141","PIC10104","FI10105"],
    status: "normal",
    lastUpdated: "Just now",
    kpis: { "CO₂ Outlet": "< 50 ppm", "MEA Circulation": "1,240 m³/h" },
    storage_path: "dcs/decarbonation-01.jpg",
  },
  {
    id: "decarbonation-2",
    title: "Decarbonation MEA 2",
    section: "Treatment",
    description: "Secondary MEA CO₂ removal – regenerator & polishing",
    imageUrl: "/images/dcs/decarbonation-2.jpg",
    tags: ["TI101115","LIC101218","TI101108","LI10113","TI101106","PIC10107","FIC10078","LIC10119","XV-100-271","FIC10176"],
    status: "normal",
    lastUpdated: "1 min ago",
    kpis: { "Regenerator Temp": "118°C" },
    storage_path: "dcs/decarbonation-2.jpg",
  },

  // ── DEHYDRATION ────────────────────────────────────
  {
    id: "dehydration-1",
    title: "Dehydration 1",
    section: "Dehydration",
    description: "Molecular sieve dryers – bed switching logic",
    imageUrl: "/images/dcs/dehydration-1.jpg",
    tags: ["101-F502","LIC10201","XV-102248","HV102172","TI102215","PDI10204A","TI102122","KV-102-13","KV-102-14","TI102762"],
    status: "normal",
    lastUpdated: "2 min ago",
    kpis: { "Water Dew Point": "-85°C", "Dryer A Status": "Online" },
    storage_path: "dcs/dehydration-1.jpg",
  },
  {
    id: "dehydration-2",
    title: "Dehydration 2",
    section: "Dehydration",
    description: "Molecular sieve regeneration cycle",
    imageUrl: "/images/dcs/dehydration-2.jpg",
    tags: ["TI102215","KV-10223","TI102214","KV-10222","TIC102208","PI102217","FIC102219","LIC10239","HIC102221"],
    status: "normal",
    lastUpdated: "2 min ago",
    kpis: { "Dryer B Status": "Regenerating" },
    storage_path: "dcs/dehydration-2.jpg",
  },
  {
    id: "dehydration-3",
    title: "Dehydration 3",
    section: "Dehydration",
    description: "Mercury guard bed & final drying",
    imageUrl: "/images/dcs/dehydration-3.jpg",
    tags: ["PI102149","PDI102153","PI102227","AAH102184","HIC102223","XV-102252","PDAH102229","PDALL102226"],
    status: "normal",
    lastUpdated: "2 min ago",
    kpis: { "Mercury Removal": "99.9%" },
    storage_path: "dcs/dehydration-3.jpg",
  },

  // ── PROPANE / SCRUBBING ────────────────────────────
  {
    id: "scrubber",
    title: "Inlet Scrubber",
    section: "Propane",
    description: "Inlet scrub column – heavy hydrocarbon removal",
    imageUrl: "/images/dcs/scrubber.jpg",
    tags: ["TI104102","TI104109","TIC10442","PI10412","LIC10417","FIC10409","TIC10413","LIC10421","FIC10449"],
    status: "normal",
    lastUpdated: "Just now",
    kpis: { "Scrubber Level": "62%" },
    storage_path: "dcs/scrubber.jpg",
  },
  {
    id: "propane-1",
    title: "Propane Loop 1",
    section: "Propane",
    description: "High-pressure propane chilling stage",
    imageUrl: "/images/dcs/propane-1.jpg",
    tags: ["TIC10304","FIC10301","XV-103-116","PIC103114A","TIC10313","TI103103","PI10307A","FIC10314"],
    status: "normal",
    lastUpdated: "1 min ago",
    kpis: { "Propane Flow": "1,180 t/h" },
    storage_path: "dcs/propane-1.jpg",
  },
  {
    id: "propane-2",
    title: "Propane Loop 2",
    section: "Propane",
    description: "Medium-pressure propane chilling",
    imageUrl: "/images/dcs/propane-2.jpg",
    tags: ["PI10321A","PIC10400","TI104112","LV10424A","LIC10424","LIC10401","TI103106","FIC10428"],
    status: "normal",
    lastUpdated: "1 min ago",
    kpis: {},
    storage_path: "dcs/propane-2.jpg",
  },
  {
    id: "propane-3",
    title: "Propane Loop 3",
    section: "Propane",
    description: "Low-pressure propane chilling – deepest cooling before MCHE",
    imageUrl: "/images/dcs/propane-3.jpg",
    tags: ["LV10435A","LIC10435","TI104104","TI104103","LV10440A","LIC10440","TI104113","ZI10442"],
    status: "normal",
    lastUpdated: "1 min ago",
    kpis: {},
    storage_path: "dcs/propane-3.jpg",
  },
  {
    id: "echangeur-recup-gpl",
    title: "GPL Recovery Exch.",
    section: "Propane",
    description: "LPG recovery heat exchanger",
    imageUrl: "/images/dcs/echangeur de recuperation gpl.jpg",
    tags: [],
    status: "normal",
    lastUpdated: "Just now",
    kpis: {},
    storage_path: "dcs/echangeur de recuperation gpl.jpg",
  },

  // ── LIQUEFACTION / MCR ─────────────────────────────
  {
    id: "liquefaction-1",
    title: "Liquefaction 1",
    section: "Liquefaction",
    description: "Main liquefaction train – first pass",
    imageUrl: "/images/dcs/liquefaction-1.jpg",
    tags: [],
    status: "normal",
    lastUpdated: "Just now",
    kpis: { "LNG Temperature": "-162°C" },
    storage_path: "dcs/liquefaction-1.jpg",
  },
  {
    id: "liquefaction-2",
    title: "Liquefaction 2",
    section: "Liquefaction",
    description: "Liquefaction trim cooling & subcooling",
    imageUrl: "/images/dcs/liquefaction-2.jpg",
    tags: ["TIC10612","TI106123","TIC10611","ZI10610","PIC10610","FI10616A","AI106164","LIC10605"],
    status: "normal",
    lastUpdated: "Just now",
    kpis: {},
    storage_path: "dcs/liquefaction-2.jpg",
  },
  {
    id: "mcr-1",
    title: "MCR Refrigeration 1",
    section: "Compression",
    description: "Mixed refrigerant compressor – stage 1 (LP/MP)",
    imageUrl: "/images/dcs/MCR-1.jpg",
    tags: ["FIC10505","FIC10503","FIC10504","SIC105231","PI105212","TI105101","TI105102","FIC10519","AI106164"],
    status: "normal",
    lastUpdated: "1 min ago",
    kpis: { "MR Flow": "2,450 t/h" },
    storage_path: "dcs/MCR-1.jpg",
  },
  {
    id: "mcr-2",
    title: "MCR Refrigeration 2",
    section: "Compression",
    description: "Mixed refrigerant compressor – stage 2 (HP)",
    imageUrl: "/images/dcs/MCR-2.jpg",
    tags: ["PI105312","SIC105331","TI105103","FIC10529","TI105104","XV-105-127","TI104113"],
    status: "normal",
    lastUpdated: "1 min ago",
    kpis: {},
    storage_path: "dcs/MCR-2.jpg",
  },
  {
    id: "mcr-3",
    title: "MCR Refrigeration 3",
    section: "Compression",
    description: "MCR final stage & HP separator",
    imageUrl: "/images/dcs/MCR-3.jpg",
    tags: ["TI105102","PI105212","PI10515A","FIC10519","TI105101","HIC10519","FV-105-19"],
    status: "normal",
    lastUpdated: "1 min ago",
    kpis: {},
    storage_path: "dcs/MCR-3.jpg",
  },

  // ── FRACTIONATION ──────────────────────────────────
  {
    id: "demethanisation",
    title: "Demethaniser",
    section: "Fractionation",
    description: "Methane (LNG) / C₂+ separation column",
    imageUrl: "/images/dcs/demethanisation.jpg",
    tags: ["XV-107-113","TI107101","TI107102","TIC10705","TI107106","LIC10709","FIC10713","FIC10715"],
    status: "normal",
    lastUpdated: "Just now",
    kpis: { "Demethanizer Top": "-28°C" },
    storage_path: "dcs/demethanisation.jpg",
  },
  {
    id: "demethanisation-2",
    title: "Demethaniser 2",
    section: "Fractionation",
    description: "Demethaniser secondary view – reboiler & condenser",
    imageUrl: "/images/dcs/demethanisation-2.jpg",
    tags: [],
    status: "normal",
    lastUpdated: "Just now",
    kpis: {},
    storage_path: "dcs/demethanisation-2.jpg",
  },
  {
    id: "deethanisation",
    title: "Deethaniser",
    section: "Fractionation",
    description: "Ethane / propane splitter column",
    imageUrl: "/images/dcs/deethanisation.jpg",
    tags: ["TI108106","PIC10802","TI108101","FIC10826","LIC10831","FIC10814","LIC10819","TIC10803"],
    status: "normal",
    lastUpdated: "Just now",
    kpis: {},
    storage_path: "dcs/deethanisation.jpg",
  },
  {
    id: "depropanisation",
    title: "Depropaniser",
    section: "Fractionation",
    description: "Propane (LPG) / butane separation",
    imageUrl: "/images/dcs/depropanisation.jpg",
    tags: ["PIC10901","PIC10912","TI109106","LIC10914","FIC10910","TI109101","TIC10902","LIC10916"],
    status: "normal",
    lastUpdated: "Just now",
    kpis: { "LPG Production": "185 t/h" },
    storage_path: "dcs/depropanisation.jpg",
  },
  {
    id: "debutanisation",
    title: "Debutaniser",
    section: "Fractionation",
    description: "Butane / naphtha separation",
    imageUrl: "/images/dcs/debutanisation.jpg",
    tags: ["TI110106","PIC11009","FIC11000","TI110101","TIC11001","LIC11025","FIC11010","LIC11037"],
    status: "normal",
    lastUpdated: "Just now",
    kpis: { "Naphtha Production": "92 t/h" },
    storage_path: "dcs/debutanisation.jpg",
  },
];

// Extract unique section names for the filter UI
export const DCS_SECTIONS = Array.from(
  new Set(DCS_PANELS.map(panel => panel.section))
);

// Helper function to find a single panel by its unique ID
export const getDcsPanel = (id: string) => {
  return DCS_PANELS.find(panel => panel.id === id);
};

// Image utility functions expected by DcsDetail.tsx
export const dcsImageUrl = (url: string) => url;
export const dcsImageViewUrl = (url: string) => url;

export default DCS_PANELS;
