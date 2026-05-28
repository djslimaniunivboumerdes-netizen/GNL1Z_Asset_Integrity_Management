import { useMemo, useState } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { motion } from "framer-motion";
import Fuse from "fuse.js";

import EquipmentPopup from "@/components/process-flow/EquipmentPopup";
import PIDViewer from "@/components/process-flow/PIDViewer";

import { PROCESS_NODES, ProcessNode } from "@/data/process_nodes";

export default function ProcessFlow() {
  const [selectedNode, setSelectedNode] = useState<ProcessNode>();
  const [popupOpen, setPopupOpen] = useState(false);
  const [pidOpen, setPidOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [section, setSection] = useState("ALL");

  const fuse = new Fuse(PROCESS_NODES, {
    keys: ["tag", "title", "fluid", "section"],
    threshold: 0.3,
  });

  const nodes = useMemo(() => {
    const base = search
      ? fuse.search(search).map((r) => r.item)
      : PROCESS_NODES;

    if (section === "ALL") return base;

    return base.filter((n) => n.section === section);
  }, [search, section]);

  return (
    <div className="h-screen bg-slate-950 text-white overflow-hidden">
      <div className="h-16 border-b border-slate-800 bg-slate-900 flex items-center px-4 gap-4">
        <h1 className="font-black text-xl">GNL1/Z Smart Process Flow</h1>

        <input
          placeholder="Search equipment..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-slate-800 px-4 py-2 rounded-xl text-sm w-72"
        />

        <select
          value={section}
          onChange={(e) => setSection(e.target.value)}
          className="bg-slate-800 px-4 py-2 rounded-xl text-sm"
        >
          <option>ALL</option>
          <option>Pretreatment</option>
          <option>Dehydration</option>
          <option>Liquefaction</option>
        </select>
      </div>

      <TransformWrapper
        initialScale={1}
        minScale={0.5}
        maxScale={8}
        wheel={{ smoothStep: 0.001 }}
        pinch={{ step: 5 }}
      >
        <TransformComponent
          wrapperClass="!w-full !h-[calc(100vh-64px)]"
          contentClass="!w-full !h-full"
        >
          <div className="relative w-[2400px] h-[1400px] bg-[#04101d] overflow-hidden">

            <svg
              className="absolute inset-0 w-full h-full"
              viewBox="0 0 2400 1400"
            >
              <defs>
                <linearGradient id="pipeGradient">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#14b8a6" />
                </linearGradient>
              </defs>

              <motion.path
                d="M100 400 H500 V300 H900"
                stroke="url(#pipeGradient)"
                strokeWidth="12"
                fill="none"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 3, repeat: Infinity }}
                style={{
                  strokeDasharray: 30,
                }}
              />
            </svg>

            {nodes.map((node) => (
              <button
                key={node.tag}
                className="absolute bg-slate-900 border border-slate-700 hover:border-cyan-400 rounded-2xl px-4 py-3 shadow-2xl transition"
                style={{
                  left: `${node.x}%`,
                  top: `${node.y}%`,
                  transform: "translate(-50%, -50%)",
                }}
                onClick={() => {
                  setSelectedNode(node);
                  setPopupOpen(true);
                }}
              >
                <div className="text-cyan-400 text-xs font-black">
                  {node.tag}
                </div>

                <div className="text-sm font-semibold mt-1 whitespace-nowrap">
                  {node.title}
                </div>
              </button>
            ))}
          </div>
        </TransformComponent>
      </TransformWrapper>

      <EquipmentPopup
        node={selectedNode}
        open={popupOpen}
        onOpenChange={setPopupOpen}
        onOpenPid={() => setPidOpen(true)}
      />

      <PIDViewer
        open={pidOpen}
        onOpenChange={setPidOpen}
        pdf={selectedNode?.pidPdf}
      />
    </div>
  );
}
