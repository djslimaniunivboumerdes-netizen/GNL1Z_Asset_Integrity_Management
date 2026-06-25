import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight, Database, Cpu, BookOpen, User, Info,
  Factory, Activity, Package, Workflow, Newspaper, LucideIcon
} from "lucide-react";

import { useI18n } from "@/contexts/I18nContext";
import { META, EQUIPMENT } from "@/data";
// Change line 9 in Dashboard.tsx
import { computeAlertStats } from "@/lib/alertEngine";
import { GNL1Z_ASSETS } from "@/utils/assets";

import { TestScheduleWidget } from "@/components/TestScheduleWidget";
import FastAlertDashboardWidget from "@/components/FastAlertDashboardWidget"; // 🔴 FIXED: default import

const moduleCards = [
  {
    key: "equipment",
    to: "/equipment",
    icon: Database,
    color: "border-amber-500/20 hover:border-amber-500/50 text-amber-400 bg-amber-500/5",
    descEn: "Searchable master of 77 equipment items with 713 spare parts and full technical files.",
    descFr: "Maître recherchable de 77 équipements avec 713 pièces et dossiers techniques complets."
  },
  {
    key: "dcs",
    to: "/dcs",
    icon: Cpu,
    color: "border-sky-500/20 hover:border-sky-500/50 text-sky-400 bg-sky-500/5",
    descEn: "Instrument-to-panel mapping, loop diagrams and control narratives across all units.",
    descFr: "Mapping instrument-vers-panneau, schémas de boucle et descriptifs de contrôle."
  },
  {
    key: "flow",
    to: "/flow",
    icon: Workflow,
    color: "border-emerald-500/20 hover:border-emerald-500/50 text-emerald-400 bg-emerald-500/5",
    descEn: "Interactive AP-C3MR™ process diagram — from MEA decarbonation to LNG storage.",
    descFr: "Diagramme procédé AP-C3MR™ interactif — de la décarbonatation MEA au stockage GNL."
  },
  {
    key: "news",
    to: "/news",
    icon: Newspaper,
    color: "border-purple-500/20 hover:border-purple-500/50 text-purple-400 bg-purple-500/5",
    descEn: "Live LNG market intelligence — spot prices, top 10 headlines and Sonatrach updates.",
    descFr: "Intelligence marché GNL en direct — prix spot, top 10 actualités et mises à jour Sonatrach."
  },
  {
    key: "manuals",
    to: "/manuals",
    icon: BookOpen,
    color: "border-blue-500/20 hover:border-blue-500/50 text-blue-400 bg-blue-500/5",
    descEn: "Operational procedures in 23 documents (S01 → S15) covering all systems.",
    descFr: "Procédures opérationnelles en 23 documents (S01 → S15) couvrant tous les systèmes."
  },
  {
    key: "about",
    to: "/about",
    icon: Info,
    color: "border-zinc-500/20 hover:border-zinc-500/50 text-zinc-400 bg-zinc-500/5",
    descEn: "Executive summary of the AP-C3MR™ liquefaction facility, capacity & geography.",
    descFr: "Résumé exécutif de l'usine de liquéfaction AP-C3MR™, capacité et géographie."
  },
  {
    key: "author",
    to: "/author",
    icon: User,
    color: "border-orange-500/20 hover:border-orange-500/50 text-orange-400 bg-orange-500/5",
    descEn: "Project author, credentials, ORCID, contact channels and mobile app downloads.",
    descFr: "Auteur du projet, références, ORCID, canaux de contact et téléchargements de l'application."
  },
] as const;

/* ─── HERO SLIDES ─── */
const heroSlides = [
  { tag: "Unit 40", image: GNL1Z_ASSETS.units.unit40 },
  { tag: "Unit 30", image: GNL1Z_ASSETS.units.unit30 },
  { tag: "Unit 50", image: GNL1Z_ASSETS.units.unit50 },
  { tag: "Unit 60", image: GNL1Z_ASSETS.units.unit60 },
  { tag: "Unit 70", image: GNL1Z_ASSETS.units.unit70 }
] as const;

export default function Dashboard() {
  const { t, lang } = useI18n();
  const [slideIndex, setSlideIndex] = useState(0);

  useEffect(() => {
    const sequence = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % heroSlides.length);
    }, 5500);
    return () => clearInterval(sequence);
  }, []);

  return (
    <div className="industrial-grid min-h-screen bg-background pb-12">

      {/* HERO */}
      <section className="relative overflow-hidden border-b border-border min-h-[440px] flex items-center bg-zinc-950 w-full">

        <div className="absolute inset-0 z-0">
          {heroSlides.map((slide, idx) => (
            <img
              key={idx}
              src={slide.image}
              alt={slide.tag}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
                idx === slideIndex ? "opacity-85" : "opacity-0"
              }`}
            />
          ))}
        </div>

        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/85 via-zinc-950/20 to-transparent z-10" />

        <div className="relative px-4 md:px-10 py-14 max-w-7xl mx-auto z-20 w-full">
          <h1 className="text-5xl md:text-7xl font-display font-extrabold text-white">
            GNL1Z
          </h1>

          <p className="mt-5 text-zinc-200 max-w-2xl">
            {lang === "en"
              ? "Industrial Asset Management for Sonatrach LNG complex."
              : "Gestion des actifs industriels pour le complexe GNL Sonatrach."}
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
            <Stat icon={Factory} label={t("trains")} value={META.trains} />
            <Stat icon={Database} label={t("equipCount")} value={EQUIPMENT.length} />
            <Stat icon={Package} label={t("spareParts")} value={META.spare_parts_count} />
            <Stat icon={Activity} label={t("lastUpdate")} value={META.last_updated} mono />
          </div>
        </div>
      </section>

      {/* 🔴 CORE OPERATION WIDGETS */}
      <div className="px-4 md:px-10 pt-8 space-y-6">

        {/* Test schedule */}
        <TestScheduleWidget />

        {/* Fast alerts (NEW) */}
        <FastAlertDashboardWidget />

      </div>

      {/* MODULES */}
      <section className="px-4 md:px-10 py-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {moduleCards.map((m, i) => {
            const IconComponent = m.icon;
            return (
              <Link
                key={m.key}
                to={m.to}
                className={`border rounded-xl p-5 bg-card ${m.color}`}
              >
                <IconComponent className="h-5 w-5 mb-3" />
                <h3 className="font-bold">{t(m.key as any)}</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {lang === "en" ? m.descEn : m.descFr}
                </p>

                <div className="mt-4 text-[10px] text-muted-foreground">
                  → {m.to}
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}

/* STAT CARD */
function Stat({
  icon: Icon,
  label,
  value,
  mono
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  mono?: boolean;
}) {
  return (
    <div className="bg-zinc-900/80 border border-white/10 rounded-xl p-4">
      <div className="text-[10px] text-zinc-400 flex items-center gap-1">
        <Icon className="h-3 w-3 text-orange-500" />
        {label}
      </div>
      <div className={`text-xl font-bold text-white ${mono ? "font-mono" : ""}`}>
        {value}
      </div>
    </div>
  );
              }
