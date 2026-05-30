// src/pages/ProcessFlow.tsx
import React, { useState, useEffect } from 'react';
import { Play, Pause, AlertTriangle, ThermometerSun, Gauge, ArrowRight } from 'lucide-react';
import { gnl1zDatabase } from '../data/gnl1z_database';
import { dcsPanels } from '../data/dcs_panels';
import { processNodes } from '../data/process_nodes';

const ProcessFlow = () => {
  const [isAnimating, setIsAnimating] = useState(true);
  const [selectedEquipment, setSelectedEquipment] = useState<any>(null);
  const [liveKPIs, setLiveKPIs] = useState({
    co2Removal: 99.8,
    lngProduction: 1250,
    feedFlow: 1850,
    temp: -162,
    pressure: 45.2,
  });

  // Simulated live updates
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveKPIs(prev => ({
        ...prev,
        co2Removal: Math.max(98, prev.co2Removal + (Math.random() - 0.5) * 0.3),
        lngProduction: Math.floor(1240 + Math.random() * 30),
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-screen w-full bg-gray-950 text-white overflow-hidden flex flex-col">
      {/* Top Dashboard KPIs */}
      <div className="bg-black/80 border-b border-cyan-500 p-4 flex gap-6 items-center">
        <h1 className="text-2xl font-bold text-cyan-400">GL1Z LNG DIGITAL TWIN - PROCESS FLOW</h1>
        
        <div className="flex gap-8 ml-auto">
          <div>
            <div className="text-xs text-gray-400">CO₂ REMOVAL</div>
            <div className="text-3xl font-mono text-emerald-400">{liveKPIs.co2Removal}%</div>
          </div>
          <div>
            <div className="text-xs text-gray-400">LNG PRODUCTION</div>
            <div className="text-3xl font-mono text-emerald-400">{liveKPIs.lngProduction} t/h</div>
          </div>
          <div>
            <div className="text-xs text-gray-400">FEED GAS</div>
            <div className="text-3xl font-mono">{liveKPIs.feedFlow} MMSCFD</div>
          </div>
        </div>

        <button
          onClick={() => setIsAnimating(!isAnimating)}
          className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 px-4 py-2 rounded-lg"
        >
          {isAnimating ? <Pause size={20} /> : <Play size={20} />}
          {isAnimating ? "Pause Animation" : "Start Animation"}
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Equipment Hierarchy */}
        <div className="w-72 bg-gray-900 border-r border-gray-700 p-4 overflow-auto">
          <h3 className="font-semibold mb-4 text-cyan-400">EQUIPMENT HIERARCHY</h3>
          {/* Tree view from gnl1z_database or processNodes */}
          {Object.keys(gnl1zDatabase.sections || {}).map(section => (
            <div key={section} className="mb-3">
              <div className="font-medium text-amber-400">{section}</div>
              <ul className="ml-4 text-sm">
                {gnl1zDatabase.sections[section]?.slice(0,6).map((eq: any) => (
                  <li 
                    key={eq.tag}
                    className="cursor-pointer hover:text-cyan-400 py-1"
                    onClick={() => setSelectedEquipment(eq)}
                  >
                    {eq.tag} - {eq.description}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Main PFD Area */}
        <div className="flex-1 relative bg-[#0a0f1c] overflow-auto p-4">
          <div className="relative max-w-[1400px] mx-auto">
            {/* Background PFD Image */}
            <img 
              src="/path-to-your-main-pfd-image.jpg" 
              alt="Overall Process Flow" 
              className="w-full rounded-xl shadow-2xl opacity-90"
            />

            {/* Overlay: Animated Refrigeration Loop + Status Indicators */}
            <div className="absolute inset-0 pointer-events-none">
              {/* Example: Refrigeration flow animation */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1400 700">
                <path 
                  d="M 300 200 Q 500 150 700 250" 
                  fill="none" 
                  stroke="#22d3ee" 
                  strokeWidth="4" 
                  strokeDasharray="12 8"
                  className={isAnimating ? "animate-[dash_2s_linear_infinite]" : ""}
                />
              </svg>
            </div>

            {/* Clickable Equipment Tags */}
            {processNodes.map((node: any) => (
              <div
                key={node.id}
                className="absolute w-6 h-6 bg-emerald-500/80 rounded-full flex items-center justify-center cursor-pointer hover:scale-125 transition-all border-2 border-white"
                style={{ left: node.x + '%', top: node.y + '%' }}
                onClick={() => setSelectedEquipment(node)}
              >
                <div className={`w-3 h-3 rounded-full ${node.status === 'running' ? 'bg-emerald-400 animate-pulse' : 'bg-yellow-400'}`} />
              </div>
            ))}
          </div>
        </div>

        {/* Right Sidebar - Equipment Details */}
        <div className="w-96 bg-gray-900 border-l border-gray-700 p-6 overflow-auto">
          {selectedEquipment ? (
            <div>
              <h2 className="text-xl font-bold text-cyan-400 mb-4">{selectedEquipment.tag}</h2>
              <p className="text-gray-300 mb-6">{selectedEquipment.description}</p>
              
              <div className="space-y-4">
                <div className="bg-gray-800 p-4 rounded-lg">
                  <div className="text-sm text-gray-400">Status</div>
                  <div className="text-2xl font-mono text-emerald-400">RUNNING</div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <div className="text-xs text-gray-400">PRESSURE</div>
                    <div className="text-2xl font-mono">42.5 bar</div>
                  </div>
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <div className="text-xs text-gray-400">TEMP</div>
                    <div className="text-2xl font-mono">-28°C</div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 mt-20">
              Click on any equipment on the PFD to see details
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProcessFlow;
