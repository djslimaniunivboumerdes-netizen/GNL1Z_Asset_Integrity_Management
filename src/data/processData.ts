// src/data/processData.ts
// Process & P&ID engineering data for GL1Z AP-C3MR™ facility
// Generated from operational manuals S01-S15 and P&ID drawings

export interface ProcessInfo {
  tag: string;
  unit: string;
  unitName: string;
  manual: string;
  pids: string[];
  primaryFluid: string;
  suction: { description: string; spec: string; conditions: string };
  discharge: { description: string; spec: string; conditions: string };
  processRole: string;
  equipmentType: string;
}

export const PROCESS_DATA: Record<string, ProcessInfo> = {
  // ── UNIT X01: MEA Decarbonation ───────────────────────────────────────────
  "X01-F-502": {
    tag: "X01-F-502",
    unit: "X01",
    unitName: "MEA Decarbonation (Acid Gas Removal)",
    manual: "S01",
    pids: ["85-X01-10.3", "85-X01-10.15"],
    primaryFluid: "Sour Natural Gas, 28% Monoethanolamine (MEA) aqueous solution, Acid Gas (CO₂ + H₂O vapor)",
    equipmentType: "Colonne d'Absorption / Amine Contactor",
    suction: {
      description: "Bottom Gas Inlet + Top Lean MEA Inlet",
      spec: "16\" 600# RF (Gas) / 6\" 600# RF (MEA)",
      conditions: "65.0 bar, 35°C (Gas) / 68.0 bar, 40°C (MEA)"
    },
    discharge: {
      description: "Top Sweet Gas Outlet + Bottom Rich MEA",
      spec: "16\" 600# RF (Gas) / 8\" 600# RF (MEA)",
      conditions: "64.5 bar, 45°C (Gas) / 65.0 bar, 52°C (MEA)"
    },
    processRole: "Primary counter-current absorption column where Lean MEA absorbs CO₂ from feed natural gas down to <50 ppm to prevent freezing in the downstream cryogenic MCHE."
  },
  "X01-F-501": {
    tag: "X01-F-501",
    unit: "X01",
    unitName: "MEA Decarbonation (Acid Gas Removal)",
    manual: "S01",
    pids: ["85-X01-10.3", "85-X01-10.15"],
    primaryFluid: "Rich/Lean MEA solution & Acid Gas (CO₂ + Steam vapor)",
    equipmentType: "Colonne de Régénération / MEA Regenerator",
    suction: {
      description: "Rich MEA feed from Lean/Rich exchanger",
      spec: "8\" 150# RF",
      conditions: "2.5 bar, 105°C"
    },
    discharge: {
      description: "Bottoms Lean MEA + Overhead Acid Gas to Condenser",
      spec: "10\" 150# RF (MEA) / 12\" 150# RF (Acid Gas)",
      conditions: "2.1 bar, 125°C (MEA) / 1.8 bar, 102°C (Acid Gas)"
    },
    processRole: "Thermal stripping column where rich amine is heated by the steam reboiler to break the MEA-CO₂ bond, venting acid gas overhead and regenerating lean amine bottoms."
  },
  "X01-E-501": {
    tag: "X01-E-501",
    unit: "X01",
    unitName: "MEA Decarbonation (Acid Gas Removal)",
    manual: "S01",
    pids: ["85-X01-10.3", "85-X01-10.15"],
    primaryFluid: "Shell: Acid Gas (CO₂ + Steam) | Tubes: Seawater / Cooling Water",
    equipmentType: "Condenseur de Tête / Overhead Condenser",
    suction: {
      description: "Shell Inlet (Acid Gas) + Tube Inlet (Cooling Water)",
      spec: "12\" 150# RF (Shell) / 10\" 150# RF (Tubes)",
      conditions: "1.8 bar, 102°C (Shell) / 4.5 bar, 22°C (Tubes)"
    },
    discharge: {
      description: "Shell Outlet (Condensate + CO₂) + Tube Outlet",
      spec: "10\" 150# RF (Shell) / 10\" 150# RF (Tubes)",
      conditions: "1.6 bar, 45°C (Shell) / 3.8 bar, 32°C (Tubes)"
    },
    processRole: "Condenses overhead steam from the regenerator column to recover pure water for the amine loop while separating and venting gaseous CO₂."
  },
  "X01-E-502": {
    tag: "X01-E-502",
    unit: "X01",
    unitName: "MEA Decarbonation (Acid Gas Removal)",
    manual: "S01",
    pids: ["85-X01-10.3", "85-X01-10.15"],
    primaryFluid: "Shell: Lean MEA solution | Tubes: Low Pressure Steam (LP Steam)",
    equipmentType: "Rebouilleur de MEA / MEA Reboiler",
    suction: {
      description: "Shell MEA Inlet + Tube Steam Inlet",
      spec: "12\" 150# RF (Shell) / 8\" 150# RF (Tubes)",
      conditions: "2.1 bar, 125°C (MEA) / 5.0 bar, 155°C (Steam)"
    },
    discharge: {
      description: "Shell Two-Phase Outlet + Tube Condensate",
      spec: "16\" 150# RF (Shell) / 4\" 150# RF (Tubes)",
      conditions: "2.1 bar, 128°C (Shell) / 4.8 bar, 152°C (Tubes)"
    },
    processRole: "Generates stripping steam and supplies thermal heat required to drive off CO₂ from rich amine solution in the regenerator column."
  },
  "X01-E-503A": {
    tag: "X01-E-503A",
    unit: "X01",
    unitName: "MEA Decarbonation (Acid Gas Removal)",
    manual: "S01",
    pids: ["85-X01-10.3", "85-X01-10.15"],
    primaryFluid: "Shell: Rich MEA solution | Tubes: Lean MEA solution",
    equipmentType: "Échangeur MEA Lean/Rich A",
    suction: {
      description: "Shell Rich Inlet + Tube Lean Inlet",
      spec: "8\" 600# RF (Shell) / 8\" 150# RF (Tubes)",
      conditions: "65.0 bar, 52°C (Rich) / 2.1 bar, 125°C (Lean)"
    },
    discharge: {
      description: "Shell Rich Outlet + Tube Lean Outlet",
      spec: "8\" 150# RF (Shell) / 8\" 150# RF (Tubes)",
      conditions: "2.5 bar, 105°C (Rich) / 1.8 bar, 70°C (Lean)"
    },
    processRole: "Cross-exchange heat recovery between hot lean amine leaving the regenerator and cool rich amine leaving the absorber."
  },
  "X01-E-503B": {
    tag: "X01-E-503B",
    unit: "X01",
    unitName: "MEA Decarbonation (Acid Gas Removal)",
    manual: "S01",
    pids: ["85-X01-10.3", "85-X01-10.15"],
    primaryFluid: "Shell: Rich MEA solution | Tubes: Lean MEA solution",
    equipmentType: "Échangeur MEA Lean/Rich B",
    suction: {
      description: "Shell Rich Inlet + Tube Lean Inlet",
      spec: "8\" 600# RF (Shell) / 8\" 150# RF (Tubes)",
      conditions: "65.0 bar, 52°C (Rich) / 2.1 bar, 125°C (Lean)"
    },
    discharge: {
      description: "Shell Rich Outlet + Tube Lean Outlet",
      spec: "8\" 150# RF (Shell) / 8\" 150# RF (Tubes)",
      conditions: "2.5 bar, 105°C (Rich) / 1.8 bar, 70°C (Lean)"
    },
    processRole: "Cross-exchange heat recovery between hot lean amine leaving the regenerator and cool rich amine leaving the absorber."
  },
  "X01-E-505": {
    tag: "X01-E-505",
    unit: "X01",
    unitName: "MEA Decarbonation (Acid Gas Removal)",
    manual: "S01",
    pids: ["85-X01-10.3", "85-X01-10.15"],
    primaryFluid: "Shell: Lean MEA solution | Tubes: Cooling Water",
    equipmentType: "Échangeur Principal / MEA Solution Cooler",
    suction: {
      description: "Lean MEA Inlet + Cooling Water Inlet",
      spec: "8\" 150# RF (MEA) / 10\" 150# RF (Water)",
      conditions: "1.8 bar, 70°C (MEA) / 4.5 bar, 22°C (Water)"
    },
    discharge: {
      description: "Chilled Lean MEA Outlet + Water Return",
      spec: "8\" 150# RF (MEA) / 10\" 150# RF (Water)",
      conditions: "1.5 bar, 40°C (MEA) / 3.8 bar, 32°C (Water)"
    },
    processRole: "Cools the lean amine solution to 40°C prior to entering the absorber column to maximize CO₂ absorption efficiency."
  },
  "X01-G-502": {
    tag: "X01-G-502",
    unit: "X01",
    unitName: "MEA Decarbonation (Acid Gas Removal)",
    manual: "S01",
    pids: ["85-X01-10.3", "85-X01-10.15"],
    primaryFluid: "Rich Amine Solution & Hydrocarbon Flash Gas",
    equipmentType: "Ballon Séparateur / Rich Amine Flash Drum",
    suction: {
      description: "Rich Amine Inlet from Absorber",
      spec: "8\" 600# RF",
      conditions: "65.0 bar, 52°C"
    },
    discharge: {
      description: "Rich Amine Liquid + Hydrocarbon Flash Gas to Fuel",
      spec: "8\" 150# RF (Liquid) / 3\" 150# RF (Gas)",
      conditions: "6.5 bar, 52°C"
    },
    processRole: "Intermediate flash drum that drops the rich amine pressure to ~6.5 bar to recover dissolved hydrocarbons as fuel gas before amine regeneration."
  },
  "X01-G-507": {
    tag: "X01-G-507",
    unit: "X01",
    unitName: "MEA Decarbonation (Acid Gas Removal)",
    manual: "S01",
    pids: ["85-X01-10.3", "85-X01-10.15"],
    primaryFluid: "Lean MEA Condensate & Overhead Reflux Water",
    equipmentType: "Flash Drum MEA / Amine Flash Drum",
    suction: {
      description: "Condensate from Overhead Condenser",
      spec: "10\" 150# RF",
      conditions: "1.6 bar, 45°C"
    },
    discharge: {
      description: "Reflux Water to Pumps + Vent CO₂ Gas",
      spec: "6\" 150# RF (Water) / 8\" 150# RF (Gas)",
      conditions: "1.6 bar, 45°C"
    },
    processRole: "Separates condensed water from overhead acid gas vapor to provide pure reflux water back to the regenerator column."
  },
  "X01-P-501": {
    tag: "X01-P-501",
    unit: "X01",
    unitName: "MEA Decarbonation (Acid Gas Removal)",
    manual: "S01",
    pids: ["85-X01-10.3", "85-X01-10.15"],
    primaryFluid: "Lean MEA solution",
    equipmentType: "Pompe MEA / Amine Charge Pump A",
    suction: {
      description: "Lean Amine from Cooler",
      spec: "10\" 150# RF",
      conditions: "1.5 bar, 40°C"
    },
    discharge: {
      description: "High-Pressure Lean Amine to Absorber",
      spec: "8\" 600# RF",
      conditions: "68.0 bar, 42°C"
    },
    processRole: "High-pressure centrifugal charge pump that pressurizes lean amine solution to overcome the 65 bar operating pressure of the feed gas absorber."
  },
  "X01-P-502": {
    tag: "X01-P-502",
    unit: "X01",
    unitName: "MEA Decarbonation (Acid Gas Removal)",
    manual: "S01",
    pids: ["85-X01-10.3", "85-X01-10.15"],
    primaryFluid: "Lean MEA solution",
    equipmentType: "Pompe MEA / Amine Charge Pump B",
    suction: {
      description: "Lean Amine from Cooler",
      spec: "10\" 150# RF",
      conditions: "1.5 bar, 40°C"
    },
    discharge: {
      description: "High-Pressure Lean Amine to Absorber",
      spec: "8\" 600# RF",
      conditions: "68.0 bar, 42°C"
    },
    processRole: "High-pressure centrifugal charge pump that pressurizes lean amine solution to overcome the 65 bar operating pressure of the feed gas absorber."
  },

  // ── UNIT X02: Dehydration & Mercury Removal ───────────────────────────────
  "X02-G-07.87": {
    tag: "X02-G-07.87",
    unit: "X02",
    unitName: "Dehydration & Mercury Removal",
    manual: "S02",
    pids: ["85-X02-10.1", "85-X02-10.2", "85-X02-10.4"],
    primaryFluid: "Sweet Natural Gas with entrained water droplets",
    equipmentType: "Ballon Séparateur d'Alimentation / Feed Gas Inlet Scrubber",
    suction: {
      description: "Sweet Gas from Amine Absorber",
      spec: "16\" 600# RF",
      conditions: "64.5 bar, 45°C"
    },
    discharge: {
      description: "Scrubbed Gas to Driers + Condensate Drain",
      spec: "16\" 600# RF (Gas) / 2\" 600# RF (Drain)",
      conditions: "64.3 bar, 45°C"
    },
    processRole: "Knockout drum equipped with mist eliminator pads to separate free water droplets and residual amine carryover before entering the dehydration beds."
  },
  "X02-R-03.12": {
    tag: "X02-R-03.12",
    unit: "X02",
    unitName: "Dehydration & Mercury Removal",
    manual: "S02",
    pids: ["85-X02-10.1", "85-X02-10.2", "85-X02-10.4"],
    primaryFluid: "Sweet Natural Gas & High-Temperature Regeneration Gas",
    equipmentType: "Réservoir / Réacteur — Molecular Sieve & Mercury Removal Bed",
    suction: {
      description: "Scrubbed Sweet Gas Inlet",
      spec: "16\" 600# RF",
      conditions: "64.3 bar, 45°C"
    },
    discharge: {
      description: "Bone-Dry, Mercury-Free Gas Outlet",
      spec: "16\" 600# RF",
      conditions: "63.8 bar, 48°C"
    },
    processRole: "Fixed-bed adsorption column packed with 4A molecular sieves (removing water to <0.5 ppm) and sulfur-impregnated activated carbon (removing mercury to <0.01 µg/Nm³) to prevent freezing and aluminum embrittlement in MCHE."
  },
  "X02-E-03.15": {
    tag: "X02-E-03.15",
    unit: "X02",
    unitName: "Dehydration & Mercury Removal",
    manual: "S02",
    pids: ["85-X02-10.1", "85-X02-10.2", "85-X02-10.4"],
    primaryFluid: "Hot Regeneration Gas & Cooling Medium",
    equipmentType: "Échangeur de Chaleur de Régénération / Regen Gas Cooler A",
    suction: {
      description: "Hot Wet Regen Gas from Sieves",
      spec: "10\" 600# RF",
      conditions: "62.0 bar, 260°C"
    },
    discharge: {
      description: "Chilled Regen Gas Outlet",
      spec: "10\" 600# RF",
      conditions: "61.5 bar, 35°C"
    },
    processRole: "Cools hot regeneration gas leaving the molecular sieves during the desorption cycle to condense desorbed water vapor."
  },
  "X02-E-03.16": {
    tag: "X02-E-03.16",
    unit: "X02",
    unitName: "Dehydration & Mercury Removal",
    manual: "S02",
    pids: ["85-X02-10.1", "85-X02-10.2", "85-X02-10.4"],
    primaryFluid: "Hot Regeneration Gas & Cooling Medium",
    equipmentType: "Échangeur de Chaleur de Régénération / Regen Gas Cooler B",
    suction: {
      description: "Hot Wet Regen Gas from Sieves",
      spec: "10\" 600# RF",
      conditions: "62.0 bar, 260°C"
    },
    discharge: {
      description: "Chilled Regen Gas Outlet",
      spec: "10\" 600# RF",
      conditions: "61.5 bar, 35°C"
    },
    processRole: "Cools hot regeneration gas leaving the molecular sieves during the desorption cycle to condense desorbed water vapor."
  },
  "X02-G-03.14": {
    tag: "X02-G-03.14",
    unit: "X02",
    unitName: "Dehydration & Mercury Removal",
    manual: "S02",
    pids: ["85-X02-10.1", "85-X02-10.2", "85-X02-10.4"],
    primaryFluid: "Two-Phase Regeneration Gas & Condensed Water",
    equipmentType: "Ballon Séparateur de Gaz de Régénération / Regen Gas Separator",
    suction: {
      description: "Chilled Regen Gas from Cooler",
      spec: "10\" 600# RF",
      conditions: "61.5 bar, 35°C"
    },
    discharge: {
      description: "Dry Regen Gas to Suction + Sour Water Drain",
      spec: "10\" 600# RF (Gas) / 2\" 600# RF (Drain)",
      conditions: "61.5 bar, 35°C"
    },
    processRole: "Knockout drum that separates condensed water from regeneration gas before recycling the gas back to the main feed compressor suction."
  },
  "X02-G-304": {
    tag: "X02-G-304",
    unit: "X02",
    unitName: "Dehydration & Mercury Removal",
    manual: "S02",
    pids: ["85-X02-10.1", "85-X02-10.2", "85-X02-10.4"],
    primaryFluid: "Dry Natural Gas Buffer",
    equipmentType: "Ballon Séparateur / Dry Gas Buffer Drum",
    suction: {
      description: "Dry Gas from Driers",
      spec: "16\" 600# RF",
      conditions: "63.8 bar, 48°C"
    },
    discharge: {
      description: "Gas to Dust Filters",
      spec: "16\" 600# RF",
      conditions: "63.7 bar, 48°C"
    },
    processRole: "Surge drum stabilizing pressure fluctuations between the dehydration section and the downstream propane chilling section."
  },
  "X02-P-03.12A": {
    tag: "X02-P-03.12A",
    unit: "X02",
    unitName: "Dehydration & Mercury Removal",
    manual: "S02",
    pids: ["85-X02-10.1", "85-X02-10.2", "85-X02-10.4"],
    primaryFluid: "Bone-Dry Natural Gas",
    equipmentType: "Filtre à Poussière / Dust Filter A",
    suction: {
      description: "Gas from Dehydration Beds",
      spec: "16\" 600# RF",
      conditions: "63.7 bar, 48°C"
    },
    discharge: {
      description: "Filtered Gas to Propane Chillers",
      spec: "16\" 600# RF",
      conditions: "63.5 bar, 48°C"
    },
    processRole: "High-efficiency particulate filter that captures molecular sieve dust and carbon fines, protecting downstream cryogenic aluminum heat exchangers from erosion."
  },
  "X02-P-03.12B": {
    tag: "X02-P-03.12B",
    unit: "X02",
    unitName: "Dehydration & Mercury Removal",
    manual: "S02",
    pids: ["85-X02-10.1", "85-X02-10.2", "85-X02-10.4"],
    primaryFluid: "Bone-Dry Natural Gas",
    equipmentType: "Filtre à Poussière / Dust Filter B",
    suction: {
      description: "Gas from Dehydration Beds",
      spec: "16\" 600# RF",
      conditions: "63.7 bar, 48°C"
    },
    discharge: {
      description: "Filtered Gas to Propane Chillers",
      spec: "16\" 600# RF",
      conditions: "63.5 bar, 48°C"
    },
    processRole: "High-efficiency particulate filter that captures molecular sieve dust and carbon fines, protecting downstream cryogenic aluminum heat exchangers from erosion."
  },

  // ── UNIT X03: Propane Refrigeration (C3 Cycle) ────────────────────────────
  "X03-F-05.16": {
    tag: "X03-F-05.16",
    unit: "X03",
    unitName: "Propane Refrigeration (C3 Cycle)",
    manual: "S03",
    pids: ["85-X03-10.1"],
    primaryFluid: "Liquid and vapor propane refrigerant",
    equipmentType: "Fond / Colonne — Propane Accumulator & Economizer",
    suction: {
      description: "Liquid Propane from Condensers",
      spec: "18\" 300# RF",
      conditions: "15.5 bar, 42°C"
    },
    discharge: {
      description: "Liquid Propane to Chillers + Flash Vapor to Comp",
      spec: "14\" 300# RF (Liquid) / 12\" 300# RF (Vapor)",
      conditions: "15.5 bar, 42°C"
    },
    processRole: "Primary refrigerant storage vessel and stage-flashing economizer that supplies liquid propane to the kettle chillers and collects suction flash gas."
  },
  "X03-E-05.13": {
    tag: "X03-E-05.13",
    unit: "X03",
    unitName: "Propane Refrigeration (C3 Cycle)",
    manual: "S03",
    pids: ["85-X03-10.1"],
    primaryFluid: "Shell: Propane Vapor | Tubes: Seawater / Cooling Water",
    equipmentType: "Condenseur de Propane / C3 Condenser A",
    suction: {
      description: "HP Propane Vapor from Comp",
      spec: "24\" 300# RF",
      conditions: "16.2 bar, 75°C"
    },
    discharge: {
      description: "Condensed Liquid Propane",
      spec: "18\" 300# RF",
      conditions: "15.5 bar, 42°C"
    },
    processRole: "Desuperheats and condenses high-pressure propane vapor discharged from the C3 refrigeration compressor against seawater/cooling water."
  },
  "X03-E-05.15": {
    tag: "X03-E-05.15",
    unit: "X03",
    unitName: "Propane Refrigeration (C3 Cycle)",
    manual: "S03",
    pids: ["85-X03-10.1"],
    primaryFluid: "Shell: Propane Vapor | Tubes: Seawater / Cooling Water",
    equipmentType: "Condenseur de Propane / C3 Condenser B",
    suction: {
      description: "HP Propane Vapor from Comp",
      spec: "24\" 300# RF",
      conditions: "16.2 bar, 75°C"
    },
    discharge: {
      description: "Condensed Liquid Propane",
      spec: "18\" 300# RF",
      conditions: "15.5 bar, 42°C"
    },
    processRole: "Desuperheats and condenses high-pressure propane vapor discharged from the C3 refrigeration compressor against seawater/cooling water."
  },
  "X03-E-05.14A": {
    tag: "X03-E-05.14A",
    unit: "X03",
    unitName: "Propane Refrigeration (C3 Cycle)",
    manual: "S03",
    pids: ["85-X03-10.1"],
    primaryFluid: "Shell: Propane Vapor | Tubes: Seawater / Cooling Water",
    equipmentType: "Condenseur de Propane / C3 Condenser C-A",
    suction: {
      description: "HP Propane Vapor from Comp",
      spec: "24\" 300# RF",
      conditions: "16.2 bar, 75°C"
    },
    discharge: {
      description: "Condensed Liquid Propane",
      spec: "18\" 300# RF",
      conditions: "15.5 bar, 42°C"
    },
    processRole: "Desuperheats and condenses high-pressure propane vapor discharged from the C3 refrigeration compressor against seawater/cooling water."
  },
  "X03-E-05.14B": {
    tag: "X03-E-05.14B",
    unit: "X03",
    unitName: "Propane Refrigeration (C3 Cycle)",
    manual: "S03",
    pids: ["85-X03-10.1"],
    primaryFluid: "Shell: Propane Vapor | Tubes: Seawater / Cooling Water",
    equipmentType: "Condenseur de Propane / C3 Condenser C-B",
    suction: {
      description: "HP Propane Vapor from Comp",
      spec: "24\" 300# RF",
      conditions: "16.2 bar, 75°C"
    },
    discharge: {
      description: "Condensed Liquid Propane",
      spec: "18\" 300# RF",
      conditions: "15.5 bar, 42°C"
    },
    processRole: "Desuperheats and condenses high-pressure propane vapor discharged from the C3 refrigeration compressor against seawater/cooling water."
  },
  "X03-G-07.86": {
    tag: "X03-G-07.86",
    unit: "X03",
    unitName: "Propane Refrigeration (C3 Cycle)",
    manual: "S03",
    pids: ["85-X03-10.1"],
    primaryFluid: "Low-Pressure Propane Vapor",
    equipmentType: "Ballon d'Aspiration Propane / C3 Suction Knockout Drum",
    suction: {
      description: "Propane Vapor Return from Chillers",
      spec: "30\" 150# RF",
      conditions: "1.2 bar, -38°C"
    },
    discharge: {
      description: "Dry Propane Vapor to Comp 1st Stage",
      spec: "30\" 150# RF",
      conditions: "1.1 bar, -37°C"
    },
    processRole: "Suction surge and knockout drum that intercepts any liquid propane carryover before it enters the first stage suction of the propane compressor."
  },

  // ── UNIT X04: Feed Chilling & MCR Pre-Cooling ──────────────────────────────
  "X04-F-07.11": {
    tag: "X04-F-07.11",
    unit: "X04",
    unitName: "Feed Chilling & MCR Pre-Cooling",
    manual: "S04 & S05",
    pids: ["85-X04-10.1", "85-X04-10.2"],
    primaryFluid: "Two-phase chilled natural gas & heavy hydrocarbons (C₅+)",
    equipmentType: "Colonne d'Épuration / Scrub Column / Feed Gas Separator",
    suction: {
      description: "Two-Phase Feed Gas from Chillers",
      spec: "16\" 600# RF",
      conditions: "61.5 bar, -36°C"
    },
    discharge: {
      description: "C₁/C₂ Overhead Vapor to MCHE + C₃+ Bottoms to Fractionation",
      spec: "16\" 600# RF (Vapor) / 8\" 300# RF (Bottoms)",
      conditions: "61.2 bar, -36°C (Vapor)"
    },
    processRole: "Separation column that removes heavy hydrocarbons (benzene, aromatics, C₅+) from the natural gas feed to prevent freezing in the cryogenic liquefaction section."
  },
  "X04-E-05.21": {
    tag: "X04-E-05.21",
    unit: "X04",
    unitName: "Feed Chilling & MCR Pre-Cooling",
    manual: "S04 & S05",
    pids: ["85-X04-10.1", "85-X04-10.2"],
    primaryFluid: "Shell: Boiling Liquid Propane | Tubes: Natural Gas Feed",
    equipmentType: "Propane Feed Chiller - HP",
    suction: {
      description: "Liquid Propane + Feed Gas",
      spec: "10\" 300# RF (Propane) / 16\" 600# RF (Gas)",
      conditions: "63.5 bar, 48°C (Gas)"
    },
    discharge: {
      description: "Propane Vapor to Comp + Chilled Feed Gas",
      spec: "24\" 300# RF (Propane) / 16\" 600# RF (Gas)",
      conditions: "61.5 bar, -32°C (Gas)"
    },
    processRole: "Tiers of kettle heat exchangers operating at successively lower propane pressure levels to chill the natural gas feed prior to heavy hydrocarbon scrubbing."
  },
  "X04-E-05.22": {
    tag: "X04-E-05.22",
    unit: "X04",
    unitName: "Feed Chilling & MCR Pre-Cooling",
    manual: "S04 & S05",
    pids: ["85-X04-10.1", "85-X04-10.2"],
    primaryFluid: "Shell: Boiling Liquid Propane | Tubes: Natural Gas Feed",
    equipmentType: "Propane Feed Chiller - MP",
    suction: {
      description: "Liquid Propane + Feed Gas",
      spec: "10\" 300# RF (Propane) / 16\" 600# RF (Gas)",
      conditions: "63.5 bar, 48°C (Gas)"
    },
    discharge: {
      description: "Propane Vapor to Comp + Chilled Feed Gas",
      spec: "24\" 300# RF (Propane) / 16\" 600# RF (Gas)",
      conditions: "61.5 bar, -32°C (Gas)"
    },
    processRole: "Tiers of kettle heat exchangers operating at successively lower propane pressure levels to chill the natural gas feed prior to heavy hydrocarbon scrubbing."
  },
  "X04-E-05.23": {
    tag: "X04-E-05.23",
    unit: "X04",
    unitName: "Feed Chilling & MCR Pre-Cooling",
    manual: "S04 & S05",
    pids: ["85-X04-10.1", "85-X04-10.2"],
    primaryFluid: "Shell: Boiling Liquid Propane | Tubes: Natural Gas Feed",
    equipmentType: "Propane Feed Chiller - BP",
    suction: {
      description: "Liquid Propane + Feed Gas",
      spec: "10\" 300# RF (Propane) / 16\" 600# RF (Gas)",
      conditions: "63.5 bar, 48°C (Gas)"
    },
    discharge: {
      description: "Propane Vapor to Comp + Chilled Feed Gas",
      spec: "24\" 300# RF (Propane) / 16\" 600# RF (Gas)",
      conditions: "61.5 bar, -32°C (Gas)"
    },
    processRole: "Tiers of kettle heat exchangers operating at successively lower propane pressure levels to chill the natural gas feed prior to heavy hydrocarbon scrubbing."
  },
  "X04-E-05.24": {
    tag: "X04-E-05.24",
    unit: "X04",
    unitName: "Feed Chilling & MCR Pre-Cooling",
    manual: "S04 & S05",
    pids: ["85-X04-10.1", "85-X04-10.2"],
    primaryFluid: "Shell: Boiling Liquid Propane | Tubes: Natural Gas Feed",
    equipmentType: "Propane Feed Chiller - EBP",
    suction: {
      description: "Liquid Propane + Feed Gas",
      spec: "10\" 300# RF (Propane) / 16\" 600# RF (Gas)",
      conditions: "63.5 bar, 48°C (Gas)"
    },
    discharge: {
      description: "Propane Vapor to Comp + Chilled Feed Gas",
      spec: "24\" 300# RF (Propane) / 16\" 600# RF (Gas)",
      conditions: "61.5 bar, -32°C (Gas)"
    },
    processRole: "Tiers of kettle heat exchangers operating at successively lower propane pressure levels to chill the natural gas feed prior to heavy hydrocarbon scrubbing."
  },
  "X04-E-05.25A": {
    tag: "X04-E-05.25A",
    unit: "X04",
    unitName: "Feed Chilling & MCR Pre-Cooling",
    manual: "S04 & S05",
    pids: ["85-X04-10.1", "85-X04-10.2"],
    primaryFluid: "Shell: Boiling Liquid Propane | Tubes: Mixed Refrigerant (MCR)",
    equipmentType: "Propane MCR Precooler A",
    suction: {
      description: "Liquid Propane + MCR Inlet",
      spec: "10\" 300# RF (Propane) / 20\" 600# RF (MCR)",
      conditions: "55.0 bar, 45°C (MCR)"
    },
    discharge: {
      description: "Propane Vapor to Comp + Chilled MCR to Separator",
      spec: "24\" 300# RF (Propane) / 20\" 600# RF (MCR)",
      conditions: "53.0 bar, -34°C (MCR)"
    },
    processRole: "Kettle heat exchangers providing intermediate partial condensation of MCR prior to entering the MCHE."
  },
  "X04-E-05.25B": {
    tag: "X04-E-05.25B",
    unit: "X04",
    unitName: "Feed Chilling & MCR Pre-Cooling",
    manual: "S04 & S05",
    pids: ["85-X04-10.1", "85-X04-10.2"],
    primaryFluid: "Shell: Boiling Liquid Propane | Tubes: Mixed Refrigerant (MCR)",
    equipmentType: "Propane MCR Precooler B",
    suction: {
      description: "Liquid Propane + MCR Inlet",
      spec: "10\" 300# RF (Propane) / 20\" 600# RF (MCR)",
      conditions: "55.0 bar, 45°C (MCR)"
    },
    discharge: {
      description: "Propane Vapor to Comp + Chilled MCR to Separator",
      spec: "24\" 300# RF (Propane) / 20\" 600# RF (MCR)",
      conditions: "53.0 bar, -34°C (MCR)"
    },
    processRole: "Kettle heat exchangers providing intermediate partial condensation of MCR prior to entering the MCHE."
  },
  "X04-E-05.26A": {
    tag: "X04-E-05.26A",
    unit: "X04",
    unitName: "Feed Chilling & MCR Pre-Cooling",
    manual: "S04 & S05",
    pids: ["85-X04-10.1", "85-X04-10.2"],
    primaryFluid: "Shell: Boiling Liquid Propane | Tubes: Mixed Refrigerant (MCR)",
    equipmentType: "Propane MCR Precooler C-A",
    suction: {
      description: "Liquid Propane + MCR Inlet",
      spec: "10\" 300# RF (Propane) / 20\" 600# RF (MCR)",
      conditions: "55.0 bar, 45°C (MCR)"
    },
    discharge: {
      description: "Propane Vapor to Comp + Chilled MCR to Separator",
      spec: "24\" 300# RF (Propane) / 20\" 600# RF (MCR)",
      conditions: "53.0 bar, -34°C (MCR)"
    },
    processRole: "Kettle heat exchangers providing intermediate partial condensation of MCR prior to entering the MCHE."
  },
  "X04-E-05.26B": {
    tag: "X04-E-05.26B",
    unit: "X04",
    unitName: "Feed Chilling & MCR Pre-Cooling",
    manual: "S04 & S05",
    pids: ["85-X04-10.1", "85-X04-10.2"],
    primaryFluid: "Shell: Boiling Liquid Propane | Tubes: Mixed Refrigerant (MCR)",
    equipmentType: "Propane MCR Precooler C-B",
    suction: {
      description: "Liquid Propane + MCR Inlet",
      spec: "10\" 300# RF (Propane) / 20\" 600# RF (MCR)",
      conditions: "55.0 bar, 45°C (MCR)"
    },
    discharge: {
      description: "Propane Vapor to Comp + Chilled MCR to Separator",
      spec: "24\" 300# RF (Propane) / 20\" 600# RF (MCR)",
      conditions: "53.0 bar, -34°C (MCR)"
    },
    processRole: "Kettle heat exchangers providing intermediate partial condensation of MCR prior to entering the MCHE."
  },
  "X04-E-05.40": {
    tag: "X04-E-05.40",
    unit: "X04",
    unitName: "Feed Chilling & MCR Pre-Cooling",
    manual: "S04 & S05",
    pids: ["85-X04-10.1", "85-X04-10.2"],
    primaryFluid: "Shell: Boiling Liquid Propane | Tubes: Mixed Refrigerant (MCR)",
    equipmentType: "Propane MCR Precooler D",
    suction: {
      description: "Liquid Propane + MCR Inlet",
      spec: "10\" 300# RF (Propane) / 20\" 600# RF (MCR)",
      conditions: "55.0 bar, 45°C (MCR)"
    },
    discharge: {
      description: "Propane Vapor to Comp + Chilled MCR to Separator",
      spec: "24\" 300# RF (Propane) / 20\" 600# RF (MCR)",
      conditions: "53.0 bar, -34°C (MCR)"
    },
    processRole: "Kettle heat exchangers providing intermediate partial condensation of MCR prior to entering the MCHE."
  },
  "X04-G-07.14": {
    tag: "X04-G-07.14",
    unit: "X04",
    unitName: "Feed Chilling & MCR Pre-Cooling",
    manual: "S04 & S05",
    pids: ["85-X04-10.1", "85-X04-10.2"],
    primaryFluid: "Chilled Natural Gas & Condensed Hydrocarbon Liquids",
    equipmentType: "Ballon Séparateur de Phase / Knockout Drum A",
    suction: {
      description: "Two-Phase Streams from Interstage Chilling",
      spec: "16\" 600# RF",
      conditions: "61.5 bar, -36°C"
    },
    discharge: {
      description: "Vapor Overhead + Liquid Bottoms",
      spec: "16\" 600# RF (Vapor) / 6\" 300# RF (Liquid)",
      conditions: "61.5 bar, -36°C"
    },
    processRole: "Intermediate phase separators and reflux accumulation drums supporting precooling and heavy hydrocarbon scrubbing operations."
  },
  "X04-G-07.85": {
    tag: "X04-G-07.85",
    unit: "X04",
    unitName: "Feed Chilling & MCR Pre-Cooling",
    manual: "S04 & S05",
    pids: ["85-X04-10.1", "85-X04-10.2"],
    primaryFluid: "Chilled Natural Gas & Condensed Hydrocarbon Liquids",
    equipmentType: "Ballon Séparateur de Phase / Knockout Drum B",
    suction: {
      description: "Two-Phase Streams from Interstage Chilling",
      spec: "16\" 600# RF",
      conditions: "61.5 bar, -36°C"
    },
    discharge: {
      description: "Vapor Overhead + Liquid Bottoms",
      spec: "16\" 600# RF (Vapor) / 6\" 300# RF (Liquid)",
      conditions: "61.5 bar, -36°C"
    },
    processRole: "Intermediate phase separators and reflux accumulation drums supporting precooling and heavy hydrocarbon scrubbing operations."
  },
  "X04-G-07.90": {
    tag: "X04-G-07.90",
    unit: "X04",
    unitName: "Feed Chilling & MCR Pre-Cooling",
    manual: "S04 & S05",
    pids: ["85-X04-10.1", "85-X04-10.2"],
    primaryFluid: "Chilled Natural Gas & Condensed Hydrocarbon Liquids",
    equipmentType: "Ballon Séparateur de Phase / Knockout Drum C",
    suction: {
      description: "Two-Phase Streams from Interstage Chilling",
      spec: "16\" 600# RF",
      conditions: "61.5 bar, -36°C"
    },
    discharge: {
      description: "Vapor Overhead + Liquid Bottoms",
      spec: "16\" 600# RF (Vapor) / 6\" 300# RF (Liquid)",
      conditions: "61.5 bar, -36°C"
    },
    processRole: "Intermediate phase separators and reflux accumulation drums supporting precooling and heavy hydrocarbon scrubbing operations."
  },
  "X04-G-07.91": {
    tag: "X04-G-07.91",
    unit: "X04",
    unitName: "Feed Chilling & MCR Pre-Cooling",
    manual: "S04 & S05",
    pids: ["85-X04-10.1", "85-X04-10.2"],
    primaryFluid: "Chilled Natural Gas & Condensed Hydrocarbon Liquids",
    equipmentType: "Ballon Séparateur de Phase / Knockout Drum D",
    suction: {
      description: "Two-Phase Streams from Interstage Chilling",
      spec: "16\" 600# RF",
      conditions: "61.5 bar, -36°C"
    },
    discharge: {
      description: "Vapor Overhead + Liquid Bottoms",
      spec: "16\" 600# RF (Vapor) / 6\" 300# RF (Liquid)",
      conditions: "61.5 bar, -36°C"
    },
    processRole: "Intermediate phase separators and reflux accumulation drums supporting precooling and heavy hydrocarbon scrubbing operations."
  },

  // ── UNIT X05: MCR Compression ───────────────────────────────────────────────
  "X05-E-05.11": {
    tag: "X05-E-05.11",
    unit: "X05",
    unitName: "MCR Compression (Mixed Refrigerant Cycle)",
    manual: "S05",
    pids: ["85-X05-10.1"],
    primaryFluid: "Shell: MCR Vapor | Tubes: Seawater / Cooling Water",
    equipmentType: "Refroidisseur MCR Interétages / MCR Interstage Cooler A",
    suction: {
      description: "Hot MCR Vapor from LP Comp Discharge",
      spec: "36\" 300# RF",
      conditions: "18.0 bar, 115°C"
    },
    discharge: {
      description: "Cooled MCR Vapor",
      spec: "36\" 300# RF",
      conditions: "17.5 bar, 40°C"
    },
    processRole: "Removes the heat of compression from the low-pressure MCR centrifugal compressor stage before the gas enters the high-pressure compressor stage."
  },
  "X05-E-05.12": {
    tag: "X05-E-05.12",
    unit: "X05",
    unitName: "MCR Compression (Mixed Refrigerant Cycle)",
    manual: "S05",
    pids: ["85-X05-10.1"],
    primaryFluid: "Shell: MCR Vapor | Tubes: Seawater / Cooling Water",
    equipmentType: "Refroidisseur MCR Interétages / MCR Interstage Cooler B",
    suction: {
      description: "Hot MCR Vapor from LP Comp Discharge",
      spec: "36\" 300# RF",
      conditions: "18.0 bar, 115°C"
    },
    discharge: {
      description: "Cooled MCR Vapor",
      spec: "36\" 300# RF",
      conditions: "17.5 bar, 40°C"
    },
    processRole: "Removes the heat of compression from the low-pressure MCR centrifugal compressor stage before the gas enters the high-pressure compressor stage."
  },
  "X05-G-07.88": {
    tag: "X05-G-07.88",
    unit: "X05",
    unitName: "MCR Compression (Mixed Refrigerant Cycle)",
    manual: "S05",
    pids: ["85-X05-10.1"],
    primaryFluid: "MCR Vapor & Condensed Heavy Refrigerant Liquid",
    equipmentType: "Ballon d'Aspiration MCR / MCR Suction Knockout Drum A",
    suction: {
      description: "Cooled MCR from Interstage Coolers",
      spec: "36\" 300# RF",
      conditions: "17.5 bar, 40°C"
    },
    discharge: {
      description: "Dry MCR Vapor to Comp Suction + Liquid Drain",
      spec: "36\" 300# RF (Vapor) / 6\" 300# RF (Liquid)",
      conditions: "17.3 bar, 40°C"
    },
    processRole: "Suction surge drums that prevent liquid slugging in the main axial/centrifugal MCR compressors while dampening compressor pulsations."
  },
  "X05-G-07.89": {
    tag: "X05-G-07.89",
    unit: "X05",
    unitName: "MCR Compression (Mixed Refrigerant Cycle)",
    manual: "S05",
    pids: ["85-X05-10.1"],
    primaryFluid: "MCR Vapor & Condensed Heavy Refrigerant Liquid",
    equipmentType: "Ballon d'Aspiration MCR / MCR Suction Knockout Drum B",
    suction: {
      description: "Cooled MCR from Interstage Coolers",
      spec: "36\" 300# RF",
      conditions: "17.5 bar, 40°C"
    },
    discharge: {
      description: "Dry MCR Vapor to Comp Suction + Liquid Drain",
      spec: "36\" 300# RF (Vapor) / 6\" 300# RF (Liquid)",
      conditions: "17.3 bar, 40°C"
    },
    processRole: "Suction surge drums that prevent liquid slugging in the main axial/centrifugal MCR compressors while dampening compressor pulsations."
  },

  // ── UNIT X06: MCHE Core (Liquefaction Core) ────────────────────────────────
  "X06-E-05.30": {
    tag: "X06-E-05.30",
    unit: "X06",
    unitName: "MCHE Core (Liquefaction Core)",
    manual: "S06",
    pids: ["85-X06-10.1"],
    primaryFluid: "Tubes: Feed Gas, HP MCR Liquid & Vapor | Shell: Boiling LP MCR Spray",
    equipmentType: "Échangeur Cryogénique Principal / Main Cryogenic Heat Exchanger (MCHE)",
    suction: {
      description: "Feed Gas + HP MCR Liquid + HP MCR Vapor",
      spec: "16\" 600# RF (Gas) / 14\" 600# RF (MCR Liq) / 18\" 600# RF (MCR Vap)",
      conditions: "-36°C (Gas) / -34°C (MCR)"
    },
    discharge: {
      description: "Subcooled LNG + LP MCR Return",
      spec: "12\" 600# RF (LNG) / 48\" 150# RF (MCR)",
      conditions: "58.0 bar, -162°C (LNG) / 3.2 bar, -40°C (MCR)"
    },
    processRole: "The massive vertical spiral-wound aluminum heat exchanger (spool wound) that forms the heart of the AP-C3MR™ process. High-pressure MCR liquid and vapor are chilled, expanded across JT valves, and sprayed downwards across the tube bundles, vaporizing at low pressure to liquefy and subcool the upward-flowing natural gas to -162°C."
  },
  "X06-G-07.80": {
    tag: "X06-G-07.80",
    unit: "X06",
    unitName: "MCHE Core (Liquefaction Core)",
    manual: "S06",
    pids: ["85-X06-10.1"],
    primaryFluid: "Two-Phase Partially Condensed High-Pressure MCR",
    equipmentType: "Ballon Séparateur MCR HP / HP MCR Vapor-Liquid Separator",
    suction: {
      description: "MCR from Final Propane Chiller",
      spec: "24\" 600# RF",
      conditions: "53.0 bar, -34°C"
    },
    discharge: {
      description: "HP MCR Vapor to MCHE + HP MCR Liquid to MCHE",
      spec: "18\" 600# RF (Vapor) / 14\" 600# RF (Liquid)",
      conditions: "52.8 bar, -34°C"
    },
    processRole: "High-pressure phase separator that splits precooled mixed refrigerant into a light vapor stream (used for cold liquefaction bundle) and a heavy liquid stream (used for warm precooling bundle in MCHE)."
  },
  "X06-G-07.83": {
    tag: "X06-G-07.83",
    unit: "X06",
    unitName: "MCHE Core (Liquefaction Core)",
    manual: "S06",
    pids: ["85-X06-10.1"],
    primaryFluid: "Liquefied Natural Gas (LNG) & Nitrogen-Rich Flash Gas",
    equipmentType: "Ballon de Flash d'Extrémité / LNG End Flash Drum",
    suction: {
      description: "Subcooled LNG Letdown from MCHE",
      spec: "12\" 600# RF",
      conditions: "Letdown to 1.8 bar, -163°C"
    },
    discharge: {
      description: "On-Spec LNG to Storage + Flash Gas to Fuel",
      spec: "14\" 150# RF (LNG) / 8\" 150# RF (Gas)",
      conditions: "1.8 bar, -162.5°C (LNG)"
    },
    processRole: "Terminal flash drum that drops LNG pressure near atmospheric storage levels, flashing off dissolved nitrogen and light methane to meet final LNG heating value (Wobbe index) and prevent storage tank rollover."
  },

  // ── UNITS X07-X10: NGL Fractionation ───────────────────────────────────────
  "X07-F-07.21": {
    tag: "X07-F-07.21",
    unit: "X07",
    unitName: "NGL Fractionation — Demethanizer",
    manual: "S07",
    pids: ["85-X07-10.1"],
    primaryFluid: "Raw NGL Liquid & Methane Vapor",
    equipmentType: "Colonne Déméthaniseur / Demethanizer Column",
    suction: {
      description: "NGL Feed from Scrub Column",
      spec: "8\" 300# RF",
      conditions: "32.0 bar, -30°C"
    },
    discharge: {
      description: "Methane Overhead to Fuel + C₂+ Bottoms to De-ethanizer",
      spec: "10\" 300# RF (Overhead) / 8\" 300# RF (Bottoms)",
      conditions: "31.0 bar, -45°C (Overhead)"
    },
    processRole: "Thermal distillation column that strips residual methane from the NGL stream to stabilize the liquids for downstream fractionation."
  },
  "X08-F-07.31": {
    tag: "X08-F-07.31",
    unit: "X08",
    unitName: "NGL Fractionation — De-ethanizer",
    manual: "S08",
    pids: ["85-X08-10.1"],
    primaryFluid: "C₂+ Hydrocarbon Liquid & Ethane Vapor",
    equipmentType: "Colonne Dééthaniseur / De-ethanizer Column",
    suction: {
      description: "C₂+ Feed from Demethanizer Bottoms",
      spec: "8\" 300# RF",
      conditions: "28.0 bar, 25°C"
    },
    discharge: {
      description: "High-Purity Ethane Overhead + C₃+ Bottoms to Depropanizer",
      spec: "8\" 300# RF (Overhead) / 8\" 300# RF (Bottoms)",
      conditions: "27.5 bar, 5°C (Overhead)"
    },
    processRole: "Distillation column that separates ethane (used as MCR makeup or fuel) from propane and heavier NGLs."
  },
  "X09-F-07.41": {
    tag: "X09-F-07.41",
    unit: "X09",
    unitName: "NGL Fractionation — Depropanizer",
    manual: "S09",
    pids: ["85-X09-10.1"],
    primaryFluid: "C₃+ Hydrocarbon Liquid & Propane Vapor",
    equipmentType: "Colonne Dépropaniseur / Depropanizer Column",
    suction: {
      description: "C₃+ Feed from De-ethanizer Bottoms",
      spec: "8\" 300# RF",
      conditions: "18.0 bar, 85°C"
    },
    discharge: {
      description: "High-Purity Propane Overhead + C₄+ Bottoms to Debutanizer",
      spec: "8\" 300# RF (Overhead) / 6\" 150# RF (Bottoms)",
      conditions: "17.5 bar, 45°C (Overhead)"
    },
    processRole: "Distillation column that fractionates high-purity propane (used for C₃ refrigerant makeup and commercial LPG sales) from butane and heavy condensate."
  },
  "X10-F-07.51": {
    tag: "X10-F-07.51",
    unit: "X10",
    unitName: "NGL Fractionation — Debutanizer",
    manual: "S10",
    pids: ["85-X10-10.1"],
    primaryFluid: "C₄+ Hydrocarbon Liquid & Butane Vapor",
    equipmentType: "Colonne Débutaniseur / Debutanizer Column",
    suction: {
      description: "C₄+ Feed from Depropanizer Bottoms",
      spec: "6\" 150# RF",
      conditions: "6.5 bar, 115°C"
    },
    discharge: {
      description: "High-Purity Butane Overhead + C₅+ Heavy Condensate Bottoms",
      spec: "6\" 150# RF (Overhead) / 4\" 150# RF (Bottoms)",
      conditions: "6.0 bar, 50°C (Overhead)"
    },
    processRole: "Distillation column that splits butanes (iC₄/nC₄ used for MCR makeup and commercial LPG) from stable C₅+ natural gasoline condensate."
  },

  // ── UTILITIES ─────────────────────────────────────────────────────────────
  "7X3-E-03.17": {
    tag: "7X3-E-03.17",
    unit: "UTIL",
    unitName: "Utilities & Miscellaneous",
    manual: "S11.1-S11.9",
    pids: ["85-X00-03.17"],
    primaryFluid: "Utility Cooling Water / Plant Air",
    equipmentType: "Échangeur Utilities / Trim Cooler",
    suction: {
      description: "Utility Inlet",
      spec: "4\" 150# RF",
      conditions: "Ambient"
    },
    discharge: {
      description: "Utility Outlet",
      spec: "4\" 150# RF",
      conditions: "Ambient"
    },
    processRole: "Utility heat exchanger providing secondary cooling to plant instrument air and nitrogen distribution headers."
  }
};

export function getProcessInfo(tag: string): ProcessInfo | undefined {
  return PROCESS_DATA[tag];
}

export function getAllProcessTags(): string[] {
  return Object.keys(PROCESS_DATA);
    }
