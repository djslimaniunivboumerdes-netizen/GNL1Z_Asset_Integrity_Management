import { useI18n } from "@/contexts/I18nContext";

export function DashboardHero() {
  const { lang } = useI18n();

  return (
    <div className="relative w-full rounded-2xl overflow-hidden min-h-[320px] flex items-center bg-slate-950 border border-border/40 shadow-sm">
      {/* Industrial Tanker Background Image with Dark Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20 mix-blend-luminosity"
        style={{ 
          backgroundImage: `url('/assets/lng-tanker-bg.jpg')` // Replace with your actual asset path
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />

      {/* Cleaned Content Area */}
      <div className="relative z-10 max-w-3xl px-6 md:px-10 py-12 space-y-4">
        <h1 className="text-5xl md:text-6xl font-display font-extrabold tracking-tight text-foreground flex items-baseline gap-1">
          GNL1Z
          <span className="h-3 w-3 rounded-full bg-orange-500 inline-block translate-y-[-2px]" />
        </h1>
        
        <p className="text-lg md:text-xl text-muted-foreground font-medium leading-relaxed max-w-2xl">
          {lang === "en" 
            ? "Industrial Asset Management for the Sonatrach Arzew/Bethioua liquefaction complex."
            : "Gestion des actifs industriels pour le complexe de liquéfaction Sonatrach d'Arzew/Bethioua."}
        </p>
      </div>
    </div>
  );
}

  // Synchronized directly with the AppSidebar operational modules
  const modules = [
    { 
      title: t("equipment"), 
      desc: lang === "en" ? "Asset integrity tracking & technical specifications." : "Suivi de l'intégrité des actifs & spécifications.",
      url: "/equipment", 
      icon: Database,
      color: "border-amber-500/20 hover:border-amber-500/50 text-amber-400 bg-amber-500/5"
    },
    { 
      title: t("dcs"), 
      desc: lang === "en" ? "Distributed Control System mapping & loop parameters." : "Cartographie du système de contrôle distribué.",
      url: "/dcs", 
      icon: Cpu,
      color: "border-sky-500/20 hover:border-sky-500/50 text-sky-400 bg-sky-500/5"
    },
    { 
      title: "Smart Flow", 
      desc: lang === "en" ? "Automated P&ID process tracking & node sequencing." : "Suivi automatisé des procédés P&ID & séquençage.",
      url: "/smart-flow", 
      icon: GitBranch,
      color: "border-emerald-500/20 hover:border-emerald-500/50 text-emerald-400 bg-emerald-500/5"
    },
    { 
      title: t("news"), 
      desc: lang === "en" ? "Real-time global LNG prices & Sonatrach alerts." : "Prix du GNL mondial en temps réel & alertes Sonatrach.",
      url: "/news", 
      icon: Newspaper,
      color: "border-purple-500/20 hover:border-purple-500/50 text-purple-400 bg-purple-500/5"
    },
    { 
      title: t("manuals"), 
      desc: lang === "en" ? "Digitized operational manuals & standard guidelines." : "Manuels opératoires numérisés & directives standards.",
      url: "/manuals", 
      icon: BookOpen,
      color: "border-blue-500/20 hover:border-blue-500/50 text-blue-400 bg-blue-500/5"
    },
    { 
      title: t("about"), 
      desc: lang === "en" ? "Facility layout overview & platform structural metrics." : "Aperçu de l'installation & métriques de la plateforme.",
      url: "/about", 
      icon: Info,
      color: "border-zinc-500/20 hover:border-zinc-500/50 text-zinc-400 bg-zinc-500/5"
    },
    { 
      title: t("author"), 
      desc: lang === "en" ? "Developer engineering credentials & documentation." : "Qualifications de l'ingénieur développeur & documentation.",
      url: "/author", 
      icon: User,
      color: "border-orange-500/20 hover:border-orange-500/50 text-orange-400 bg-orange-500/5"
    },
  ];

  return (
    <div className="px-4 md:px-8 py-6 md:py-10 max-w-7xl mx-auto space-y-8">
      {/* Dynamic Header Section (Cleaned) */}
      <div className="border-b border-border pb-6">
        <div className="flex items-baseline gap-2">
          <h1 className="text-4xl font-display font-bold tracking-tight text-foreground">GNL1Z</h1>
          <span className="text-xs font-mono text-accent uppercase tracking-widest">
            {lang === "en" ? "Control & Management Hub" : "Hub de Contrôle & Gestion"}
          </span>
        </div>
        <p className="text-sm text-muted-foreground mt-2 max-w-2xl">
          {lang === "en" 
            ? "Integrated industrial operations dashboard. Navigate through active instrumentation tracking, localized asset databases, and process flows below."
            : "Tableau de bord intégré des opérations industrielles. Naviguez à travers le suivi de l'instrumentation active, les bases de données d'actifs et les flux."}
        </p>
      </div>

      {/* Synchronized Grid Modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {modules.map((mod) => {
          const IconComponent = mod.icon;
          return (
            <Link
              key={mod.url}
              to={mod.url}
              className={`group border rounded-xl p-5 bg-card transition-all duration-200 hover:-translate-y-0.5 shadow-sm hover:shadow-md flex flex-col justify-between min-h-[160px] ${mod.color}`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-lg bg-background/50 border border-border/40">
                    <IconComponent className="h-5 w-5" />
                  </div>
                  <ArrowUpRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground" />
                </div>
                <h2 className="text-lg font-display font-bold mt-4 tracking-tight text-foreground group-hover:text-primary transition-colors">
                  {mod.title}
                </h2>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                  {mod.desc}
                </p>
              </div>
              
              <div className="mt-4 pt-3 border-t border-border/10 flex justify-between items-center text-[10px] font-mono tracking-wider uppercase text-muted-foreground group-hover:text-foreground transition-colors">
                <span>{lang === "en" ? "Initialize Module" : "Initialiser le Module"}</span>
                <span>{mod.url}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
