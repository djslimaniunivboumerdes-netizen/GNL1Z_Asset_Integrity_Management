// src/pages/Dashboard.tsx
import { Link } from "react-router-dom";
import { 
  Info, Database, Cpu, GitBranch, BookOpen, User, 
  Newspaper, LayoutDashboard, ArrowRight, Factory 
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useI18n } from "@/contexts/I18nContext";

export default function Dashboard() {
  const { t, lang } = useI18n();

  // Synced directly with the AppSidebar module selection mapping
  const modules = [
    {
      title: t("about"),
      url: "/about",
      icon: Info,
      color: "from-blue-600/20 to-sky-600/5",
      borderColor: "hover:border-blue-500/50",
      iconColor: "text-blue-400",
      description: lang === "en" 
        ? "Overview of plant operations, processing configurations, and target metrics."
        : "Vue d'ensemble des opérations, configurations de traitement et objectifs."
    },
    {
      title: t("equipment"),
      url: "/equipment",
      icon: Database,
      color: "from-amber-600/20 to-orange-600/5",
      borderColor: "hover:border-amber-500/50",
      iconColor: "text-amber-400",
      description: lang === "en"
        ? "Asset integrity logs, maintenance schedules, and machinery design specifications."
        : "Registres d'intégrité des actifs, calendriers de maintenance et spécifications."
    },
    {
      title: t("dcs"),
      url: "/dcs",
      icon: Cpu,
      color: "from-purple-600/20 to-indigo-600/5",
      borderColor: "hover:border-purple-500/50",
      iconColor: "text-purple-400",
      description: lang === "en"
        ? "Distributed Control System loop simulations, process tags, and telemetry data."
        : "Simulations de boucles DCS, étiquettes de processus et télémesure."
    },
    {
      title: "Smart Flow",
      url: "/smart-flow",
      icon: GitBranch,
      color: "from-emerald-600/20 to-teal-600/5",
      borderColor: "hover:border-emerald-500/50",
      iconColor: "text-emerald-400",
      description: lang === "en"
        ? "AI-assisted P&ID instrumentation tracking, automated diagram scanning, and tag processing."
        : "Suivi d'instrumentation P&ID assisté par IA, numérisation et traitement des tags."
    },
    {
      title: t("news"),
      url: "/news",
      icon: Newspaper,
      color: "from-cyan-600/20 to-blue-600/5",
      borderColor: "hover:border-cyan-500/50",
      iconColor: "text-cyan-400",
      description: lang === "en"
        ? "Global LNG market analytics, pricing trends, and corporate updates."
        : "Analyses du marché mondial du GNL, tendances des prix et actualités."
    },
    {
      title: t("manuals"),
      url: "/manuals",
      icon: BookOpen,
      color: "from-rose-600/20 to-pink-600/5",
      borderColor: "hover:border-rose-500/50",
      iconColor: "text-rose-400",
      description: lang === "en"
        ? "Digitized standard operating procedures, facility regulatory blueprints, and emergency frameworks."
        : "Procédures d'exploitation numérisées, plans réglementaires et cadres d'urgence."
    },
    {
      title: t("author"),
      url: "/author",
      icon: User,
      color: "from-slate-600/20 to-zinc-600/5",
      borderColor: "hover:border-slate-500/50",
      iconColor: "text-slate-400",
      description: lang === "en"
        ? "Developer engineering profiles, professional publications, and network connectivity."
        : "Profils d'ingénierie des développeurs, publications et connectivité."
    }
  ];

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-7xl mx-auto space-y-8">
      
      {/* Cleaned Industrial Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-border pb-6 gap-4">
        <div>
          <div className="flex items-center gap-2 text-muted-foreground text-xs font-mono uppercase tracking-widest mb-1">
            <Factory className="h-3.5 w-3.5 text-accent" /> / {t("dashboard")}
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold tracking-tight">
            GNL1Z Central Control Platform
          </h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            {lang === "en"
              ? "Access operational modules, process safety tools, asset intelligence dashboards, and facility manuals."
              : "Accédez aux modules opérationnels, outils de sécurité, tableaux de bord et manuels d'usine."}
          </p>
        </div>
      </div>

      {/* Synchronized Core Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {modules.map((mod) => {
          const Icon = mod.icon;
          return (
            <Link key={mod.url} to={mod.url} className="block group">
              <Card className={`h-full border border-border bg-card transition-all duration-300 ${mod.borderColor} group-hover:shadow-md relative overflow-hidden`}>
                {/* Visual Ambient Background Glow */}
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${mod.color} rounded-bl-full filter blur-xl opacity-50 group-hover:opacity-80 transition-opacity duration-300 pointer-events-none`} />
                
                <CardHeader className="flex flex-row items-center space-y-0 gap-4 pb-3">
                  <div className={`p-2.5 rounded-lg bg-secondary border border-border/40 group-hover:border-transparent transition-colors shadow-sm shrink-0 ${mod.iconColor}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <CardTitle className="text-base font-display font-bold tracking-tight group-hover:text-accent transition-colors flex items-center gap-1.5">
                      {mod.title}
                    </CardTitle>
                  </div>
                </CardHeader>
                
                <CardContent className="flex flex-col justify-between h-[calc(100%-72px)] pt-0">
                  <CardDescription className="text-xs leading-relaxed text-muted-foreground line-clamp-3 mb-4">
                    {mod.description}
                  </CardDescription>
                  <div className="flex items-center text-[10px] font-mono font-semibold tracking-wider uppercase text-muted-foreground group-hover:text-accent ml-auto gap-1 transition-colors mt-auto">
                    {lang === "en" ? "Initialize" : "Initialiser"}
                    <ArrowRight className="h-3 w-3 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
