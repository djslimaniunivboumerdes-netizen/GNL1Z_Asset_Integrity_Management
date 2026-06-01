// src/pages/Dashboard.tsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Database, Cpu, BookOpen, User, Info, Factory, Activity, Package, Workflow, Newspaper } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useI18n } from "@/contexts/I18nContext";
import { META, EQUIPMENT } from "@/data";
import { GNL1Z_ASSETS } from "@/utils/assets";
import { TestScheduleWidget } from "@/components/TestScheduleWidget";

const moduleCards = [
  { key: "about",     to: "/about",      icon: Info,      accent: false, descEn: "Executive summary of the AP-C3MR™ liquefaction facility, capacity & geography.",                descFr: "Résumé exécutif de l'usine de liquéfaction AP-C3MR™, capacité et géographie."                     },
  { key: "equipment", to: "/equipment",  icon: Database,  accent: true,  descEn: "Searchable master of 77 equipment items with 713 spare parts and full technical files.",         descFr: "Maître recherchable de 77 équipements avec 713 pièces et dossiers techniques complets."          },
  { key: "dcs",       to: "/dcs",        icon: Cpu,       accent: false, descEn: "Instrument-to-panel mapping, loop diagrams and control narratives across all units.",            descFr: "Mapping instrument-vers-panneau, schémas de boucle et descriptifs de contrôle."                  },
  { key: "flow",      to: "/flow",       icon: Workflow,  accent: false, descEn: "Interactive AP-C3MR™ process diagram — from MEA decarbonation to LNG storage.",                  descFr: "Diagramme procédé AP-C3MR™ interactif — de la décarbonatation MEA au stockage GNL."            },
  { key: "news",      to: "/news",       icon: Newspaper, accent: false, descEn: "Live LNG market intelligence — spot prices, top 10 headlines and Sonatrach updates.",            descFr: "Intelligence marché GNL en direct — prix spot, top 10 actualités et mises à jour Sonatrach."   },
  { key: "manuals",   to: "/manuals",    icon: BookOpen,  accent: false, descEn: "Operational procedures in 23 documents (S01 → S15) covering all systems.",                       descFr: "Procédures opérationnelles en 23 documents (S01 → S15) couvrant tous les systèmes."             },
  { key: "author",    to: "/author",     icon: User,      accent: false, descEn: "Project author, credentials, ORCID, contact channels and mobile app downloads.",                 descFr: "Auteur du projet, références, ORCID, canaux de contact et téléchargements de l'application."  },
] as const;

/* ─── LOCALIZED INDUSTRIAL BACKGROUND SLIDES ─── */
const heroSlides = [
  {
    tag: "Unit 40",
    nameEn: "Main Cryogenic Heat Exchanger (MCHE)",
    nameFr: "Échangeur Cryogénique Principal",
    image: GNL1Z_ASSETS.units.unit40
  },
  {
    tag: "Unit 30",
    nameEn: "MCR Centrifugal Compressors",
    nameFr: "Compresseurs Centrifuges MCR",
    image: GNL1Z_ASSETS.units.unit30
  },
  {
    tag: "Unit 50",
    nameEn: "Cryogenic LNG Storage Tanks",
    nameFr: "Bacs de Stockage Cryogénique GNL",
    image: GNL1Z_ASSETS.units.unit50
  },
  {
    tag: "Unit 60",
    nameEn: "Marine Loading Berth Infrastructure",
    nameFr: "Infrastructures d'Appontement Maritime",
    image: GNL1Z_ASSETS.units.unit60
  },
  {
    tag: "Unit 70",
    nameEn: "Steam Generation & Boiler Systems",
    nameFr: "Génération de Vapeur & Chaudières",
    image: GNL1Z_ASSETS.units.unit70
  }
] as const;

export default function Dashboard() {
  const { t, lang } = useI18n();
  const [slideIndex, setSlideIndex] = useState(0);

  useEffect(() => {
    const sequence = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(sequence);
  }, []);

  return (
    <div className="industrial-grid">
      {/* Hero Container */}
      <section className="relative overflow-hidden border-b border-border min-h-[380px] flex items-center bg-zinc-950 isolation-isolate">
        
        {/* Layer 1: Native Image Element Carousels (Uses local assets flawlessly offline) */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          {heroSlides.map((slide, idx) => (
            <img
              key={idx}
              src={slide.image}
              alt={slide.tag}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out
                ${idx === slideIndex ? "opacity-60 animate-fade-in" : "opacity-0"}`}
            />
          ))}
        </div>

        {/* Layer 2: Calibrated Dark Industrial Overlay for High-Contrast Text Legibility */}
        <div className="absolute inset-0 bg-zinc-950/75 z-10 pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-1 stripe-warning z-20" />

        {/* Layer 3: Interactive Text Details */}
        <div className="relative px-4 md:px-10 py-12 md:py-16 max-w-7xl mx-auto z-20 w-full">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-2 w-2 rounded-full bg-accent animate-pulse-accent" />
                <span className="text-[10px] md:text-xs uppercase tracking-[0.2em] text-white/90 font-mono bg-black/50 px-2 py-0.5 rounded border border-white/5 backdrop-blur-sm">
                  {META.process} · {META.trains} {t("trains")}
                </span>
              </div>
              <h1 className="text-4xl md:text-6xl font-display font-bold text-white leading-[0.95] tracking-tight drop-shadow-md">
                GNL1Z<span className="text-accent">.</span>
              </h1>
              <p className="mt-3 text-base md:text-xl text-white/95 max-w-2xl font-light drop-shadow">
                {lang === "en"
                  ? "Industrial Asset Management for the Sonatrach Arzew/Bethioua liquefaction complex."
                  : "Gestion d'actifs industriels pour le complexe de liquéfaction Sonatrach Arzew/Bethioua."}
              </p>
            </div>

            {/* Backdrop location ticker */}
            <div className="border border-white/10 bg-black/70 backdrop-blur-md rounded px-3 py-2 text-left md:text-right max-w-xs self-start md:self-end shadow-2xl">
              <span className="text-[9px] font-mono text-accent uppercase tracking-widest block mb-0.5">
                ✦ Active Sector View
              </span>
              <span className="text-xs font-bold text-white/90 line-clamp-1">
                {heroSlides[slideIndex].tag} — {lang === "en" ? heroSlides[slideIndex].nameEn : heroSlides[slideIndex].nameFr}
              </span>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            <Stat icon={Factory} label={t("trains")} value={META.trains} />
            <Stat icon={Database} label={t("equipCount")} value={EQUIPMENT.length} />
            <Stat icon={Package} label={t("spareParts")} value={META.spare_parts_count} />
            <Stat icon={Activity} label={t("lastUpdate")} value={META.last_updated} mono />
          </div>
        </div>
      </section>

      {/* Scheduler Module Widget */}
      <div className="pt-8">
        <TestScheduleWidget />
      </div>

      {/* Main Navigation Modules Grid */}
      <section className="px-4 md:px-10 py-10 max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-6">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-accent font-mono mb-1">/ {t("modules")}</div>
            <h2 className="text-2xl md:text-3xl font-display font-bold">{t("modules")}</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {moduleCards.map((m, i) => (
            <Link
              key={m.key}
              to={m.to}
              className={`group relative overflow-hidden rounded-lg border bg-card p-6 transition-all hover:-translate-y-1 hover:shadow-industrial animate-fade-in
                ${m.accent ? "border-accent/40 md:col-span-2 lg:col-span-2" : "border-border"}`}
              style={{ animationDelay: `${i * 60}ms` }}
            >
              {m.accent && <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full blur-3xl" />}
              <div className="flex items-start justify-between relative">
                <div className={`h-11 w-11 rounded grid place-items-center
                  ${m.accent ? "bg-gradient-accent text-accent-foreground shadow-accent" : "bg-secondary text-secondary-foreground"}`}>
                  <m.icon className="h-5 w-5" />
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-accent group-hover:translate-x-1 transition-all" />
              </div>
              <h3 className="mt-5 text-xl font-display font-semibold">{t(m.key as never)}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                {lang === "en" ? m.descEn : m.descFr}
              </p>
              {m.accent && (
                <div className="mt-4 flex gap-4 text-xs font-mono text-muted-foreground">
                  <span><span className="text-accent font-semibold">{EQUIPMENT.length}</span> equipment</span>
                  <span><span className="text-accent font-semibold">{META.spare_parts_count}</span> parts</span>
                </div>
              )}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

function Stat({ icon: Icon, label, value, mono }: { icon: LucideIcon; label: string; value: string | number; mono?: boolean }) {
  return (
    <div className="bg-white/5 backdrop-blur border border-white/10 rounded p-3 md:p-4 shadow-inner">
      <div className="flex items-center gap-2 text-white/70 text-[10px] uppercase tracking-widest mb-2">
        <Icon className="h-3 w-3 text-accent" />
        {label}
      </div>
      <div className={`text-xl md:text-2xl font-bold text-white ${mono ? "font-mono" : "font-display"}`}>{value}</div>
    </div>
  );
          }
