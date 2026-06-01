// src/pages/Dashboard.tsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { 
  ArrowUpRight, Database, Cpu, BookOpen, User, Info, 
  Factory, Activity, Package, Workflow, Newspaper, LucideIcon 
} from "lucide-react";
import { useI18n } from "@/contexts/I18nContext";
import { META, EQUIPMENT } from "@/data";
import { GNL1Z_ASSETS } from "@/utils/assets";
import { TestScheduleWidget } from "@/components/TestScheduleWidget";

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

/* ─── LOCALIZED INDUSTRIAL BACKGROUND SLIDES ─── */
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
      {/* Expanded Edge-to-Edge Widescreen Hero Banner */}
      <section className="relative overflow-hidden border-b border-border min-h-[440px] flex items-center bg-zinc-950 isolation-isolate w-full">
        
        {/* Layer 1: High-Definition Crisp Carousel Images */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          {heroSlides.map((slide, idx) => (
            <img
              key={idx}
              src={slide.image}
              alt={slide.tag}
              className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-1000 ease-in-out
                ${idx === slideIndex ? "opacity-85 scale-100" : "opacity-0 scale-105"}`}
            />
          ))}
        </div>

        {/* Layer 2: Left-To-Right Precision Masking Gradient (Keeps right side completely crisp) */}
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/75 to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-50 z-10 pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-1 stripe-warning z-20" />

        {/* Layer 3: Interactive Typography Content */}
        <div className="relative px-4 md:px-10 py-14 max-w-7xl mx-auto z-20 w-full">
          <div className="flex flex-col gap-8">
            <div>
              <h1 className="text-5xl md:text-7xl font-display font-extrabold text-white leading-[0.95] tracking-tight drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] flex items-baseline gap-1">
                GNL1Z<span className="h-4 w-4 rounded-full bg-orange-500 inline-block translate-y-[-4px]" />
              </h1>
              <p className="mt-5 text-base md:text-xl text-zinc-100 max-w-2xl font-normal drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] leading-relaxed">
                {lang === "en"
                  ? "Industrial Asset Management for the Sonatrach Arzew/Bethioua liquefaction complex."
                  : "Gestion d'actifs industriels pour le complexe de liquéfaction Sonatrach Arzew/Bethioua."}
              </p>
            </div>

            {/* Industrial Stats Metrics Grid Component */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 max-w-4xl mt-4">
              <Stat icon={Factory} label={t("trains")} value={META.trains} />
              <Stat icon={Database} label={t("equipCount")} value={EQUIPMENT.length} />
              <Stat icon={Package} label={t("spareParts")} value={META.spare_parts_count} />
              <Stat icon={Activity} label={t("lastUpdate")} value={META.last_updated} mono />
            </div>
          </div>
        </div>
      </section>

      {/* Scheduler Module Widget */}
      <div className="px-4 md:px-10 pt-8">
        <TestScheduleWidget />
      </div>

      {/* High-Visibility Industrial Grid Navigation Modules */}
      <section className="px-4 md:px-10 py-8 max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-orange-500 font-mono mb-1">/ {t("modules")}</div>
            <h2 className="text-2xl md:text-3xl font-display font-bold">{t("modules")}</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {moduleCards.map((m, i) => {
            const IconComponent = m.icon;
            return (
              <Link
                key={m.key}
                to={m.to}
                className={`group border rounded-xl p-5 bg-card transition-all duration-200 hover:-translate-y-1 shadow-sm hover:shadow-md flex flex-col justify-between min-h-[175px] animate-fade-in ${m.color}`}
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="p-2 rounded-lg bg-zinc-900/50 border border-border/40">
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <ArrowUpRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-display font-bold mt-4 tracking-tight text-foreground group-hover:text-primary transition-colors">
                    {t(m.key as any)}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">
                    {lang === "en" ? m.descEn : m.descFr}
                  </p>
                </div>
                
                {/* Conditional Equipment Counter Badge Metrics */}
                {m.key === "equipment" ? (
                  <div className="mt-4 pt-3 border-t border-border/10 flex gap-4 text-[10px] font-mono tracking-wider uppercase text-muted-foreground">
                    <span><b className="text-amber-500 font-semibold">{EQUIPMENT.length}</b> Units</span>
                    <span><b className="text-amber-500 font-semibold">{META.spare_parts_count}</b> Parts</span>
                  </div>
                ) : (
                  <div className="mt-4 pt-3 border-t border-border/10 flex justify-between items-center text-[10px] font-mono tracking-wider uppercase text-muted-foreground/60 group-hover:text-foreground/80 transition-colors">
                    <span>{lang === "en" ? "Initialize" : "Initialiser"}</span>
                    <span>{m.to}</span>
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function Stat({ icon: Icon, label, value, mono }: { icon: LucideIcon; label: string; value: string | number; mono?: boolean }) {
  return (
    <div className="bg-zinc-900/80 backdrop-blur-md border border-white/10 rounded-xl p-4 shadow-xl hover:border-orange-500/30 transition-all duration-200">
      <div className="flex items-center gap-2 text-zinc-400 text-[10px] uppercase tracking-widest mb-2">
        <Icon className="h-3 w-3 text-orange-500" />
        {label}
      </div>
      <div className={`text-xl md:text-2xl font-bold text-white ${mono ? "font-mono text-base" : "font-display"}`}>{value}</div>
    </div>
  );
                }
