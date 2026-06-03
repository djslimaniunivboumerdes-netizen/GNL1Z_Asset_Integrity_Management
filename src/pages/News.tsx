// src/pages/News.tsx
import { useEffect, useState } from "react";
import { 
  Newspaper, TrendingUp, Globe, BarChart3, 
  ArrowUpRight, ExternalLink, Zap, Activity, LucideIcon 
} from "lucide-react";
import { useI18n } from "@/contexts/I18nContext";
import { GNL1Z_ASSETS } from "@/utils/assets";

/* ─── LIVE LNG MARKET INTELLIGENCE SLIDES ─── */
const newsSlides = [
  { tag: "Market Ops", image: GNL1Z_ASSETS.units.unit40 },
  { tag: "Strategic Hub", image: GNL1Z_ASSETS.units.unit30 },
  { tag: "Export Terminal", image: GNL1Z_ASSETS.units.unit50 }
] as const;

// DATA: 2026 Market Intelligence Feed
const newsFeed = [
  {
    id: 1,
    category: "Strategic",
    title: "Sonatrach Participates in Istanbul Natural Resources Summit 2026",
    summary: "High-level discussions on Mediterranean energy security and regional integration.",
    date: "May 22, 2026",
    link: "https://sonatrach.com"
  },
  {
    id: 2,
    category: "Market",
    title: "TTF Gas Benchmark Volatility Amid European Supply Shifts",
    summary: "Monitoring price action across European hubs as winter storage injection begins.",
    date: "June 01, 2026",
    link: "#"
  },
  {
    id: 3,
    category: "Exploration",
    title: "ALNAFT Hydrocarbon Bid Round 2026 Official Launch",
    summary: "Nomination process opens for 24 onshore blocks to enhance national mining domain.",
    date: "May 15, 2026",
    link: "https://www.alnaft.dz"
  }
];

export default function News() {
  const { lang, t } = useI18n();
  const [slideIndex, setSlideIndex] = useState(0);

  useEffect(() => {
    const sequence = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % newsSlides.length);
    }, 5500);
    return () => clearInterval(sequence);
  }, []);

  return (
    <div className="industrial-grid min-h-screen bg-background pb-16 space-y-10">
      
      {/* ─── HERO BANNER: WIDESCREEN MARKET HUD ─── */}
      <section className="relative overflow-hidden border-b border-border min-h-[420px] flex items-center bg-zinc-950 isolation-isolate w-full">
        
        {/* Layer 1: HD Background Carousel */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          {newsSlides.map((slide, idx) => (
            <img
              key={idx}
              src={slide.image}
              alt={slide.tag}
              className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-1000 ease-in-out
                ${idx === slideIndex ? "opacity-75 scale-100" : "opacity-0 scale-105"}`}
            />
          ))}
        </div>

        {/* Layer 2: Scrim — left text area readable, image visible everywhere */}
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/85 via-zinc-950/20 to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/70 via-transparent to-transparent z-10 pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-1 stripe-warning z-20" />

        {/* Layer 3: Market Headers */}
        <div className="relative px-4 md:px-10 py-16 max-w-7xl mx-auto z-20 w-full">
          <div className="max-w-3xl space-y-4">
            <div className="text-[10px] uppercase tracking-[0.25em] text-orange-500 font-mono font-bold">
              / {lang === "en" ? "REAL-TIME MARKET INTELLIGENCE" : "INTELLIGENCE MARCHÉ EN TEMPS RÉEL"}
            </div>
            <h1 className="text-4xl md:text-6xl font-display font-extrabold text-white tracking-tight leading-none">
              LNG Market Hub
              <span className="h-3 w-3 rounded-full bg-orange-500 inline-block ml-1.5 translate-y-[-4px]" />
            </h1>
            
            {/* StatGrid Fix: Defining the component locally ensures it loads correctly */}
            <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl">
              <MarketStat icon={TrendingUp} label="TTF (EU)" value="€31.44" trend="+2.4%" />
              <MarketStat icon={Zap} label="Henry Hub" value="$2.85" trend="-0.8%" />
              <MarketStat icon={Globe} label="JKM (Asia)" value="$12.10" trend="+1.1%" />
              <MarketStat icon={Activity} label="Spot Vol" value="High" />
            </div>
          </div>
        </div>
      </section>

      {/* ─── LIVE NEWS FEED ─── */}
      <section className="px-4 md:px-10 max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <h2 className="text-2xl font-display font-bold flex items-center gap-2">
            <Newspaper className="h-6 w-6 text-orange-500" />
            {lang === "en" ? "Top Headlines" : "Actualités Principales"}
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {newsFeed.map((news) => (
            <a 
              key={news.id} 
              href={news.link} 
              target="_blank" 
              rel="noopener noreferrer"
              className="group bg-card border border-border rounded-xl p-6 flex flex-col justify-between hover:border-orange-500/40 transition-all hover:-translate-y-1 shadow-sm"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-mono font-bold text-orange-500 uppercase tracking-widest px-2 py-1 bg-orange-500/5 rounded border border-orange-500/20">
                    {news.category}
                  </span>
                  <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-orange-500 transition-colors" />
                </div>
                <h3 className="text-xl font-display font-bold group-hover:text-primary transition-colors leading-tight">
                  {news.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {news.summary}
                </p>
              </div>
              <div className="mt-6 flex items-center justify-between text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                <span>{news.date}</span>
                <span className="flex items-center gap-1 group-hover:gap-2 transition-all">
                  Read More <ArrowUpRight className="h-3 w-3" />
                </span>
              </div>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}

// Sub-Component: Fixed StatGrid Item
function MarketStat({ icon: Icon, label, value, trend }: { icon: LucideIcon; label: string; value: string; trend?: string }) {
  return (
    <div className="bg-zinc-900/80 backdrop-blur-md border border-white/10 rounded-xl p-4 shadow-xl">
      <div className="flex items-center gap-2 text-zinc-400 text-[10px] uppercase tracking-widest mb-2 font-mono">
        <Icon className="h-3 w-3 text-orange-500" />
        {label}
      </div>
      <div className="flex items-baseline justify-between">
        <span className="text-xl font-display font-extrabold text-white">{value}</span>
        {trend && (
          <span className={`text-[10px] font-mono ${trend.startsWith('+') ? 'text-emerald-400' : 'text-rose-400'}`}>
            {trend}
          </span>
        )}
      </div>
    </div>
  );
}
