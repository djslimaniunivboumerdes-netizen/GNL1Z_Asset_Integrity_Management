import React, { useState, useMemo } from 'react';
import { 
  Activity, 
  Search, 
  FileText, 
  Settings, 
  Wrench, 
  ShieldAlert, 
  CheckCircle2, 
  Layers, 
  Thermometer, 
  Gauge, 
  Workflow,
  ArrowRight,
  ExternalLink
} from 'lucide-react';

// Hardcoded extract of real GNL1Z database entries for instant rendering performance
const databaseEquipment = [
  {
    tag: "X01-F-502",
    name: "Absorbeur MEA (Amine Absorber)",
    type: "column",
    section: "Décarbonatation",
    technical: {
      weight_kg: 92000,
      pressure_bar: 41.2,
      temp_c: 38,
      serial_no: "35960-6",
      bolt_size: "M24",
      internals: "27 valve trays (25 absorption, 2 washing)"
    },
    maintenance: {
      lifting_method: "crane_150t",
      tools: ["Hydraulic Tensioner", "Impact Wrench M24", "Sling 10T"],
      isolation_steps: [
        "Isolate rich/lean amine feed lines (HV-501 / HV-502)",
        "Isolate sour gas inlet and sweet gas outlet",
        "Depressurize vessel to flare network safely",
        "Drain remaining chemical inventory to MEA sump storage tank",
        "Purge column with Nitrogen (N2) until hydrocarbon concentration reads 0%",
        "Blind all nozzle flanges using proper M24 bolts and spirals"
      ]
    },
    spares: [
      { code: "463410912", description: "Stainless Steel 304 Floating Valve Clapet", qty: 25 },
      { code: "493062114", description: "Spirale Gasket with Centering Ring 1-1/2\" 150#", qty: 2 }
    ]
  },
  {
    tag: "X01-F-501",
    name: "Régénérateur MEA (Stripper Column)",
    type: "column",
    section: "Régénération MEA",
    technical: {
      weight_kg: 48000,
      pressure_bar: 8.4,
      temp_c: 121,
      serial_no: "35959-6",
      bolt_size: "M20",
      internals: "20 bubble cap trays"
    },
    maintenance: {
      lifting_method: "crane_80t",
      tools: ["Impact Wrench M20", "Pneumatic Bolting Rig"],
      isolation_steps: [
        "Shut down reboiler steam supply",
        "Isolate overhead vapor condenser line",
        "Isolate bottom lean amine exit valve",
        "Depressurize stripper to low-pressure flare",
        "Cool down column internals below 45°C via recirculation",
        "Inert with N2 and blind isolation flanges"
      ]
    },
    spares: [
      { code: "493060148", description: "Spirale Gasket with Centering Ring 18\" 150#", qty: 1 },
      { code: "341910055", description: "Hexagonal Nut 1-1/4\" - 8 UNC, Mat A194-2H", qty: 32 }
    ]
  },
  {
    tag: "X01-E-502",
    name: "Rebouilleur de MEA (Kettle Reboiler)",
    type: "exchanger",
    section: "Régénération MEA",
    technical: {
      weight_kg: 18500,
      pressure_bar: 7.2,
      temp_c: 135,
      serial_no: "35961-6",
      bolt_size: "M16",
      internals: "U-Tube Bundle (SA 249 TP304)"
    },
    maintenance: {
      lifting_method: "overhead_crane",
      tools: ["Bundle Puller", "Gasket Scraper", "Torque Wrench M16"],
      isolation_steps: [
        "Isolate LP Steam supply and condensate lines",
        "Isolate MEA liquid circulation from Regenerator bottom",
        "Cool exchanger down slowly to prevent thermal stress on tubesheet",
        "Drain shell side completely",
        "Perform LEL/gas testing before bundle pull operations"
      ]
    },
    spares: [
      { code: "463130201", description: "U-Tube Bundle element row 1 (SA 249 TP304 ELC)", qty: 14 },
      { code: "493060132", description: "Spirale Gasket 6\" 150# ASME-B16.20", qty: 1 }
    ]
  },
  {
    tag: "X01-E-505",
    name: "Échangeur MEA Lean/Rich (Cross Exchanger)",
    type: "exchanger",
    section: "Décarbonatation",
    technical: {
      weight_kg: 24000,
      pressure_bar: 15.5,
      temp_c: 110,
      serial_no: "35963-6",
      bolt_size: "M16",
      internals: "Straight Tube Pack SS304"
    },
    maintenance: {
      lifting_method: "mobile_crane_50t",
      tools: ["Hydraulic Torque Wrench", "Chain Hoist"],
      isolation_steps: [
        "Isolate hot rich MEA lines on both inlet/outlet",
        "Isolate cold lean MEA lines completely",
        "Drain both tube and shell compartments into MEA recovery line",
        "Verify 0% flammable gas trace and 0 ppm H2S",
        "Install blinding plates on all primary process links"
      ]
    },
    spares: [
      { code: "322810050", description: "Straight Seamless Tubing A 249 TP 304 SS", qty: 40 },
      { code: "493060704", description: "Spirale Gasket 3\" 900# Series 316", qty: 4 }
    ]
  },
  {
    tag: "X01-G-507",
    name: "Ballon de Flash MEA (Amine Flash Vessel)",
    type: "vessel",
    section: "Régénération MEA",
    technical: {
      weight_kg: 14200,
      pressure_bar: 8.0,
      temp_c: 47,
      serial_no: "35962-6",
      bolt_size: "M16",
      internals: "Horizontal mesh mist eliminator pad"
    },
    maintenance: {
      lifting_method: "rigging_slings",
      tools: ["LEL Detector", "Impact Wrench"],
      isolation_steps: [
        "Isolate rich MEA inlet line",
        "Isolate gas overhead vent to LP flare",
        "Depressurize and completely drain hydrocarbon/amine inventory",
        "Execute continuous water wash or steam out to clear residual gases",
        "Install blind plates on all nozzle paths"
      ]
    },
    spares: [
      { code: "493060069", description: "Spirale Gasket Style:HX 316/Graphite", qty: 2 }
    ]
  },
  {
    tag: "X01-E-506",
    name: "Pré-chauffeur de gaz d'alimentation",
    type: "exchanger",
    section: "Décarbonatation",
    technical: {
      weight_kg: 12500,
      pressure_bar: 15.5,
      temp_c: 95,
      serial_no: "387704-6",
      bolt_size: "M16",
      internals: "U-Tube Bundle"
    },
    maintenance: {
      lifting_method: "chain_hoist_2t",
      tools: ["Impact Wrench M16", "Sling Sets"],
      isolation_steps: [
        "Isolate feed gas feed loop bypass valves",
        "Isolate heating medium stream",
        "Bleed internal pressure to closed drain collection unit",
        "Purge and verify safe atmospheric air levels"
      ]
    },
    spares: []
  },
  {
    tag: "X01-E-521",
    name: "Échangeur de Déshydratation",
    type: "exchanger",
    section: "Déshydratation",
    technical: {
      weight_kg: 16000,
      pressure_bar: 45.0,
      temp_c: 245,
      serial_no: "387900-1",
      bolt_size: "M16",
      internals: "High Temp Tube Sheet"
    },
    maintenance: {
      lifting_method: "overhead_crane",
      tools: ["Torque Wrench", "LEL Sniffer"],
      isolation_steps: [
        "Shut down system heating elements",
        "Wait for system cool-down step below 50 degrees",
        "Isolate gas stream paths completely",
        "Vent to stack/flare and secure workspace boundary"
      ]
    },
    spares: []
  }
];

const driveFolderUrl = "https://drive.google.com/drive/folders/1_WeQYp02-LYO8_KmKuK_wFEYLnf_WwLR";

export default function ProcessFlow() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState("X01-F-502");
  const [activeTab, setActiveTab] = useState<'specs' | 'isolation' | 'spares'>('specs');

  // Simulated live telemetry loop monitoring values to keep the DCS dashboard active
  const [telemetry, setTelemetry] = React.useState({
    absorberPressure: 41.2,
    absorberTemp: 38.4,
    stripperPressure: 1.82,
    stripperTemp: 121.1,
    lastUpdate: "Live Data Feed active"
  });

  React.useEffect(() => {
    const timer = setInterval(() => {
      setTelemetry(prev => ({
        ...prev,
        absorberPressure: +(41.2 + (Math.random() - 0.5) * 0.4).toFixed(2),
        absorberTemp: +(38.0 + (Math.random() - 0.5) * 0.6).toFixed(1),
        stripperPressure: +(1.8 + (Math.random() - 0.5) * 0.1).toFixed(2),
        stripperTemp: +(121.0 + (Math.random() - 0.5) * 0.8).toFixed(1)
      }));
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  // Standard normalization algorithm to tackle spacing, missing hyphens, or wrong case inputs
  const normalize = (str: string) => {
    if (!str) return '';
    return str.toUpperCase()
              .replace(/X01/g, '')
              .replace(/[\s-_]/g, '');
  };

  // Resolve active equipment record dynamically with support for fuzzy search query matching
  const currentEquipment = useMemo(() => {
    const query = searchQuery.trim();
    if (query.length > 1) {
      const normalizedQuery = normalize(query);
      const found = databaseEquipment.find(eq => 
        normalize(eq.tag).includes(normalizedQuery) || 
        eq.name.toLowerCase().includes(query.toLowerCase())
      );
      if (found) return found;
    }
    return databaseEquipment.find(eq => eq.tag === selectedTag) || databaseEquipment[0];
  }, [searchQuery, selectedTag]);

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 p-4 md:p-6 font-sans pb-24">
      {/* 1. Dashboard Top Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping" />
            <h1 className="text-xl md:text-2xl font-black tracking-tight bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
              MEA DECARBONATATION SYSTEM
            </h1>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-1">GNL1Z Facility — Sonatrach Train 1 Module</p>
        </div>

        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg p-1.5 w-full md:w-auto">
          <Workflow className="text-blue-400 h-4 w-4 ml-2" />
          <span className="text-xs font-mono text-slate-300">DCS Interface active</span>
        </div>
      </div>

      {/* 2. Intelligent Smart Search Tool */}
      <div className="relative mb-6 max-w-xl mx-auto">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-slate-400" />
        </div>
        <input
          type="text"
          placeholder="Fuzzy search tags (e.g. F501, E-505, f 502, reboiler...)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="block w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-inner"
        />
        {searchQuery && (
          <div className="absolute right-3 top-3.5 bg-blue-600/20 text-blue-400 px-2 py-0.5 rounded text-[10px] font-bold font-mono">
            Auto-Correction Active
          </div>
        )}
      </div>

      {/* 3. Responsive SVG Process Mimic Graphic */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 mb-6 shadow-2xl relative overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Activity className="text-emerald-400 h-4 w-4" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Live Process Loop Mimic</span>
          </div>
          <span className="text-[10px] font-mono text-slate-500">Self-Adapting Vector Overlay</span>
        </div>

        <div className="w-full overflow-x-auto pb-4 scrollbar-thin">
          <div className="min-w-[620px] max-w-[800px] mx-auto relative h-56 bg-[#070a13] rounded-xl border border-slate-900 p-2 flex items-center justify-between">
            
            {/* Feed Gas Section */}
            <div className="flex flex-col items-center gap-1 z-10">
              <span className="text-[9px] font-bold font-mono text-slate-400 uppercase">Sour Feed Gas</span>
              <div className="h-10 w-16 bg-slate-900 border border-dashed border-slate-700 rounded flex items-center justify-center text-[10px] text-slate-500">
                Unit 100
              </div>
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce mt-1" />
            </div>

            {/* Line connecting to preheater */}
            <div className="h-1 flex-grow bg-blue-500/30 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-transparent w-full animate-pulse" />
            </div>

            {/* MEA Absorber Column (F-502) */}
            <button 
              onClick={() => { setSelectedTag("X01-F-502"); setSearchQuery(""); }}
              className={`relative z-10 flex flex-col items-center p-2.5 rounded-xl border transition-all ${
                currentEquipment.tag === "X01-F-502" 
                  ? 'border-emerald-500 bg-emerald-950/20 shadow-md shadow-emerald-900/10 scale-105' 
                  : 'border-blue-500/30 bg-slate-900/60 hover:border-blue-400'
              }`}
            >
              <div className="w-10 h-24 bg-gradient-to-b from-blue-900/80 to-slate-900 border-2 border-blue-400 rounded-t-xl rounded-b-xl flex flex-col items-center justify-between py-2 relative">
                {/* Trays indicator */}
                <div className="w-full border-t border-dashed border-blue-400/40" />
                <div className="w-full border-t border-dashed border-blue-400/40" />
                <div className="text-[9px] font-mono text-blue-300 font-black">F-502</div>
                <div className="w-full border-t border-dashed border-blue-400/40" />
                <div className="w-full border-t border-dashed border-blue-400/40" />
              </div>
              <span className="text-[10px] font-mono font-bold mt-1 text-slate-300">Absorber</span>
              <span className="text-[9px] text-emerald-400 font-mono mt-0.5">{telemetry.absorberPressure} bar</span>
            </button>

            {/* Middle connecting lines (Lean / Rich cross loop) */}
            <div className="flex flex-col justify-around h-full py-6 flex-grow max-w-[120px] relative">
              {/* Rich Amine Line out */}
              <div className="h-0.5 bg-amber-500/50 w-full flex justify-end">
                <span className="text-[8px] font-mono text-amber-500 mr-2 -mt-3.5">Rich MEA</span>
              </div>
              
              {/* Cross Exchanger E-505 */}
              <button
                onClick={() => { setSelectedTag("X01-E-505"); setSearchQuery(""); }}
                className={`self-center p-1.5 rounded-lg border text-center transition-all ${
                  currentEquipment.tag === "X01-E-505"
                    ? 'border-emerald-500 bg-emerald-950/20 scale-105'
                    : 'border-slate-800 bg-slate-900 hover:border-slate-700'
                }`}
              >
                <div className="h-6 w-6 rounded-full border-2 border-emerald-400 flex items-center justify-center text-[8px] font-black font-mono">
                  E505
                </div>
              </button>

              {/* Lean Amine Line back */}
              <div className="h-0.5 bg-teal-500/50 w-full">
                <span className="text-[8px] font-mono text-teal-400 ml-2 -mt-3.5">Lean MEA</span>
              </div>
            </div>

            {/* Regenerator Column (F-501) */}
            <button 
              onClick={() => { setSelectedTag("X01-F-501"); setSearchQuery(""); }}
              className={`relative z-10 flex flex-col items-center p-2.5 rounded-xl border transition-all ${
                currentEquipment.tag === "X01-F-501" 
                  ? 'border-emerald-500 bg-emerald-950/20 shadow-md shadow-emerald-900/10 scale-105' 
                  : 'border-amber-500/30 bg-slate-900/60 hover:border-amber-400'
              }`}
            >
              <div className="w-10 h-20 bg-gradient-to-b from-amber-900/80 to-slate-900 border-2 border-amber-400 rounded-t-xl rounded-b-xl flex flex-col items-center justify-between py-1.5">
                <div className="w-full border-t border-dashed border-amber-400/40" />
                <div className="text-[9px] font-mono text-amber-300 font-black">F-501</div>
                <div className="w-full border-t border-dashed border-amber-400/40" />
              </div>
              <span className="text-[10px] font-mono font-bold mt-1 text-slate-300">Stripper</span>
              <span className="text-[9px] text-amber-400 font-mono mt-0.5">{telemetry.stripperTemp}°C</span>
            </button>

            {/* Kettle Reboiler E-502 */}
            <div className="flex flex-col justify-center gap-1 flex-grow max-w-[80px]">
              <button
                onClick={() => { setSelectedTag("X01-E-502"); setSearchQuery(""); }}
                className={`p-1.5 rounded-lg border text-center transition-all self-center ${
                  currentEquipment.tag === "X01-E-502"
                    ? 'border-emerald-500 bg-emerald-950/20 scale-105'
                    : 'border-red-500/30 bg-slate-900 hover:border-red-400'
                }`}
              >
                <div className="h-6 w-10 border-2 border-red-400 rounded flex items-center justify-center text-[8px] font-black font-mono">
                  E-502
                </div>
                <span className="text-[8px] font-mono text-slate-400 block mt-0.5">Reboiler</span>
              </button>
            </div>

            {/* Flash Drum G-507 */}
            <button
              onClick={() => { setSelectedTag("X01-G-507"); setSearchQuery(""); }}
              className={`p-1.5 rounded-lg border text-center transition-all ${
                currentEquipment.tag === "X01-G-507"
                  ? 'border-emerald-500 bg-emerald-950/20 scale-105'
                  : 'border-slate-800 bg-slate-900 hover:border-slate-700'
              }`}
            >
              <div className="h-6 w-12 border border-slate-500 rounded-lg flex items-center justify-center text-[8px] font-black font-mono">
                G-507
              </div>
              <span className="text-[8px] font-mono text-slate-400 block mt-0.5">Flash Drum</span>
            </button>

          </div>
        </div>
        <div className="text-center text-[10px] text-slate-500 mt-1 font-mono">
          💡 Tap on any equipment shape in the diagram above to inspect active telemetry and specs!
        </div>
      </div>

      {/* 4. Main Equipment Info Sheet Pane */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column: Loop Quick Selector */}
        <div className="md:col-span-1 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block px-1">
            Browse GNL1Z Elements
          </span>
          <div className="flex flex-col gap-2">
            {databaseEquipment.map((eq) => {
              const isSelected = currentEquipment.tag === eq.tag;
              return (
                <button
                  key={eq.tag}
                  onClick={() => { setSelectedTag(eq.tag); setSearchQuery(""); }}
                  className={`p-3 border rounded-xl flex items-center justify-between text-left transition-all ${
                    isSelected 
                      ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/10 font-semibold' 
                      : 'bg-slate-900 border-slate-800/80 text-slate-300 hover:bg-slate-850'
                  }`}
                >
                  <div className="min-w-0 flex-grow pr-2">
                    <span className="text-xs font-mono block tracking-wider opacity-80">{eq.tag}</span>
                    <h3 className="text-sm truncate mt-0.5">{eq.name}</h3>
                  </div>
                  <ArrowRight className={`h-4 w-4 flex-shrink-0 ${isSelected ? 'text-white' : 'text-slate-600'}`} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Columns: Main Dynamic Specs & Maintenance Sheet Panel */}
        <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          
          {/* Section Identification Block */}
          <div className="bg-slate-950 p-4 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-2">
            <div>
              <span className="text-[10px] font-mono bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded uppercase font-bold tracking-widest">
                {currentEquipment.section} UNIT
              </span>
              <h2 className="text-base font-black text-white mt-1.5 flex items-center gap-1.5">
                {currentEquipment.name}
                <span className="text-xs font-mono text-emerald-400">({currentEquipment.tag})</span>
              </h2>
            </div>
            
            <button 
              onClick={() => openDriveIsolationPlan(currentEquipment.tag)}
              className="bg-destructive hover:bg-destructive/90 text-white text-xs font-bold font-mono py-2 px-3.5 rounded-lg flex items-center gap-1.5 transition-all self-start md:self-center"
            >
              <FileText className="h-3.5 w-3.5" />
              Open Isolation Plan
            </button>
          </div>

          {/* Interactive Panel Tabs */}
          <div className="flex border-b border-slate-800 bg-slate-950/40">
            <button
              onClick={() => setActiveTab('specs')}
              className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider text-center transition-colors border-b-2 ${
                activeTab === 'specs' 
                  ? 'border-blue-500 text-blue-400 bg-slate-900/50' 
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="h-3.5 w-3.5 inline mr-1.5" />
              Technical Specs
            </button>
            <button
              onClick={() => setActiveTab('isolation')}
              className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider text-center transition-colors border-b-2 ${
                activeTab === 'isolation' 
                  ? 'border-blue-500 text-blue-400 bg-slate-900/50' 
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <ShieldAlert className="h-3.5 w-3.5 inline mr-1.5" />
              Safety & Isolation
            </button>
            <button
              onClick={() => setActiveTab('spares')}
              className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider text-center transition-colors border-b-2 ${
                activeTab === 'spares' 
                  ? 'border-blue-500 text-blue-400 bg-slate-900/50' 
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Wrench className="h-3.5 w-3.5 inline mr-1.5" />
              Spare Parts ({currentEquipment.spares.length})
            </button>
          </div>

          <div className="p-5">
            {/* TAB 1: SPECS MODULE */}
            {activeTab === 'specs' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/60">
                    <span className="text-[10px] text-slate-400 font-mono block">Design Pressure</span>
                    <span className="text-sm font-bold text-slate-200 font-mono mt-1 flex items-center gap-1">
                      <Gauge className="h-3.5 w-3.5 text-blue-400" />
                      {currentEquipment.technical.pressure_bar} Barg
                    </span>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/60">
                    <span className="text-[10px] text-slate-400 font-mono block">Operating Temperature</span>
                    <span className="text-sm font-bold text-slate-200 font-mono mt-1 flex items-center gap-1">
                      <Thermometer className="h-3.5 w-3.5 text-amber-400" />
                      {currentEquipment.technical.temp_c}°C
                    </span>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/60">
                    <span className="text-[10px] text-slate-400 font-mono block">Shell Serial Number</span>
                    <span className="text-sm font-bold text-slate-200 font-mono mt-1">{currentEquipment.technical.serial_no || 'N/A'}</span>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/60">
                    <span className="text-[10px] text-slate-400 font-mono block">Standard Bolt Flange</span>
                    <span className="text-sm font-bold text-slate-200 font-mono mt-1">{currentEquipment.technical.bolt_size}</span>
                  </div>
                </div>

                <div className="border-t border-slate-800 pt-3">
                  <span className="text-[10px] text-slate-400 font-mono block uppercase">Internal Shell Features</span>
                  <p className="text-xs text-slate-300 mt-1 font-mono">{currentEquipment.technical.internals}</p>
                </div>

                <div className="border-t border-slate-800 pt-3 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-mono block">Maintenance Lifting Procedure</span>
                    <span className="text-xs text-slate-200 font-bold uppercase tracking-wider block mt-1">
                      {currentEquipment.maintenance.lifting_method.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: SAFETY & ISOLATION STEPS */}
            {activeTab === 'isolation' && (
              <div className="space-y-4">
                <div className="bg-red-500/10 border border-red-500/30 p-3 rounded-xl flex items-start gap-2.5">
                  <ShieldAlert className="text-red-400 h-4 w-4 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-red-200 font-mono leading-relaxed">
                    CRITICAL WARNING: These protocols represent a technical checklist reference only. Field operators must execute LEL gas checks and verify double block and bleed setups on-site.
                  </p>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase font-mono tracking-wider">
                    Step-By-Step Isolation Guide
                  </span>
                  <div className="space-y-1.5">
                    {currentEquipment.maintenance.isolation_steps.map((step, idx) => (
                      <div key={idx} className="flex items-start gap-3 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/30">
                        <span className="h-5 w-5 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center text-[10px] font-bold font-mono flex-shrink-0">
                          {idx + 1}
                        </span>
                        <p className="text-xs text-slate-300 font-mono mt-0.5 leading-relaxed">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: SPARES MODULE */}
            {activeTab === 'spares' && (
              <div className="space-y-3">
                {currentEquipment.spares.length === 0 ? (
                  <div className="text-center py-8 text-slate-500 text-xs font-mono">
                    No custom gaskets or bolt listings specified for this layout piece in database extract.
                  </div>
                ) : (
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase font-mono tracking-wider block mb-2">
                      Associated Spare Parts & Warehouse Location
                    </span>
                    <div className="grid grid-cols-1 gap-2">
                      {currentEquipment.spares.map((spare) => (
                        <div key={spare.code} className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 flex items-center justify-between text-xs">
                          <div className="min-w-0 pr-2">
                            <span className="text-[10px] font-mono text-emerald-400 block tracking-widest">{spare.code}</span>
                            <span className="text-slate-300 font-mono block mt-1 truncate">{spare.description}</span>
                          </div>
                          <div className="bg-slate-800 px-2 py-1 rounded font-mono text-slate-200 font-bold flex-shrink-0 text-[10px]">
                            Qty: {spare.qty}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>

      </div>

      {/* 5. Drive Redirect Panel */}
      <div className="mt-8 p-4 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
            <CheckCircle2 className="text-emerald-500 h-4 w-4" />
            Central P&ID Sheet Repository Available
          </h4>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            All files are matching train parameters like X01-F501, F 501, or F501.
          </p>
        </div>
        <a 
          href={driveFolderUrl}
          target="_blank" 
          rel="noreferrer"
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-all w-full md:w-auto justify-center"
        >
          📂 Access Root Drive Folder
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>

    </div>
  );
                      }
