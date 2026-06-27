// src/pages/TestSchedule.tsx
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarClock, AlertTriangle, ArrowUpDown } from "lucide-react";
import { buildSchedule } from "@/lib/alertEngine";
import type { ScheduleItem, ScheduleStatus } from "@/types/alerts";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/contexts/I18nContext";

type SortKey = "days_left" | "status" | "tag";

const STATUS_ORDER: Record<ScheduleStatus, number> = { OVERDUE: 0, DUE_SOON: 1, OK: 2 };

const labels = {
  en: {
    title: "Next Test Schedule",
    summary: (total: number, overdue: number, dueSoon: number) =>
      `${total} equipment tracked · ${overdue} overdue · ${dueSoon} due within 30 days`,
    search: "Search tag…",
    all: "All",
    sort: "Sort:",
    days: "Days",
    status: "Status",
    tag: "Tag",
    lastTest: "Last Test",
    nextDue: "Next Due",
    remaining: "Remaining",
    loading: "Loading…",
    empty: "No equipment matches the filters",
    overdue: "OVERDUE",
    dueSoon: "DUE SOON",
    ok: "OK",
    daySuffix: "d",
  },
  fr: {
    title: "Prochain calendrier d'essais",
    summary: (total: number, overdue: number, dueSoon: number) =>
      `${total} équipements suivis · ${overdue} en retard · ${dueSoon} à tester sous 30 jours`,
    search: "Rechercher un tag…",
    all: "Tous",
    sort: "Trier :",
    days: "Jours",
    status: "Statut",
    tag: "Tag",
    lastTest: "Dernier essai",
    nextDue: "Prochain essai",
    remaining: "Restant",
    loading: "Chargement…",
    empty: "Aucun équipement ne correspond aux filtres",
    overdue: "EN RETARD",
    dueSoon: "BIENTÔT DÛ",
    ok: "OK",
    daySuffix: "j",
  },
};

function StatusBadge({ status, lang }: { status: ScheduleStatus; lang: "en" | "fr" }) {
  const L = labels[lang];
  if (status === "OVERDUE")
    return <Badge className="bg-red-600 text-white font-mono text-[10px]">{L.overdue}</Badge>;
  if (status === "DUE_SOON")
    return <Badge className="bg-amber-500 text-white font-mono text-[10px]">{L.dueSoon}</Badge>;
  return <Badge variant="outline" className="text-emerald-500 border-emerald-500/40 font-mono text-[10px]">{L.ok}</Badge>;
}

export default function TestSchedule() {
  const { lang } = useI18n();
  const L = labels[lang];
  const [items, setItems] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortKey, setSortKey] = useState<SortKey>("days_left");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ScheduleStatus | "ALL">("ALL");

  useEffect(() => {
    buildSchedule().then(setItems).finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let list = items;
    if (statusFilter !== "ALL") list = list.filter((i) => i.status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((i) => i.tag.toLowerCase().includes(q));
    }
    return [...list].sort((a, b) => {
      if (sortKey === "tag") return a.tag.localeCompare(b.tag);
      if (sortKey === "status") {
        const diff = STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
        return diff !== 0 ? diff : (a.days_left ?? 9999) - (b.days_left ?? 9999);
      }
      return (a.days_left ?? 9999) - (b.days_left ?? 9999);
    });
  }, [items, sortKey, search, statusFilter]);

  const overdueCount = items.filter((i) => i.status === "OVERDUE").length;
  const dueSoonCount  = items.filter((i) => i.status === "DUE_SOON").length;

  const filterLabel = (s: ScheduleStatus | "ALL") => {
    if (s === "ALL") return L.all;
    if (s === "OVERDUE") return L.overdue;
    if (s === "DUE_SOON") return L.dueSoon;
    return L.ok;
  };

  return (
    <div className="px-4 md:px-8 py-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-2 mb-2">
        <CalendarClock className="h-5 w-5 text-accent" />
        <h1 className="text-2xl font-display font-bold">{L.title}</h1>
      </div>
      <p className="text-sm text-muted-foreground mb-6">
        {L.summary(items.length, overdueCount, dueSoonCount)}
      </p>

      <div className="border border-border rounded-lg bg-card p-4 mb-4 flex flex-col md:flex-row gap-3">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={L.search}
          className="md:max-w-xs"
        />
        <div className="flex gap-1.5 flex-wrap">
          {(["ALL", "OVERDUE", "DUE_SOON", "OK"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`text-xs px-3 py-1.5 rounded border font-mono transition ${
                statusFilter === s
                  ? "bg-accent text-accent-foreground border-accent"
                  : "border-border text-muted-foreground hover:border-accent/50"
              }`}
            >
              {filterLabel(s)}
            </button>
          ))}
        </div>
        <div className="md:ml-auto flex gap-1.5 items-center">
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{L.sort}</span>
          {(["days_left", "status", "tag"] as SortKey[]).map((k) => (
            <button
              key={k}
              onClick={() => setSortKey(k)}
              className={`text-[11px] px-2 py-1 rounded border font-mono transition ${
                sortKey === k
                  ? "bg-accent text-accent-foreground border-accent"
                  : "border-border text-muted-foreground hover:border-accent/50"
              }`}
            >
              {k === "days_left" ? L.days : k === "status" ? L.status : L.tag}
            </button>
          ))}
        </div>
      </div>

      <div className="border border-border rounded-lg overflow-hidden bg-card">
        <div className="hidden md:grid grid-cols-[1fr_140px_140px_120px_120px] bg-secondary/60 text-[10px] uppercase tracking-wider text-muted-foreground px-4 py-2.5 font-semibold gap-2">
          <div className="flex items-center gap-1"><ArrowUpDown className="h-3 w-3" /> {L.tag}</div>
          <div>{L.lastTest}</div>
          <div>{L.nextDue}</div>
          <div>{L.remaining}</div>
          <div>{L.status}</div>
        </div>

        {loading ? (
          <div className="text-sm text-muted-foreground text-center py-12">{L.loading}</div>
        ) : filtered.length === 0 ? (
          <div className="text-sm text-muted-foreground text-center py-12">{L.empty}</div>
        ) : (
          <div className="divide-y divide-border">
            {filtered.map((item) => (
              <Link
                key={item.tag}
                to={`/equipment/${encodeURIComponent(item.tag)}`}
                className="flex md:grid md:grid-cols-[1fr_140px_140px_120px_120px] items-center gap-2 px-4 py-3 hover:bg-secondary/40 transition text-sm"
              >
                <div className="flex items-center gap-2 min-w-0">
                  {item.status === "OVERDUE" && <AlertTriangle className="h-3.5 w-3.5 text-red-500 shrink-0" />}
                  <span className="font-mono font-semibold text-accent truncate">{item.tag}</span>
                </div>
                <div className="hidden md:block text-xs text-muted-foreground font-mono">{item.last_test ?? "—"}</div>
                <div className="hidden md:block text-xs font-mono">{item.next_due ?? "—"}</div>
                <div className={`hidden md:block text-xs font-bold font-mono ${
                  item.status === "OVERDUE" ? "text-red-500" : item.status === "DUE_SOON" ? "text-amber-500" : "text-foreground"
                }`}>
                  {item.days_left === null ? "—" : item.days_left < 0 ? `−${Math.abs(item.days_left)}${L.daySuffix}` : `${item.days_left}${L.daySuffix}`}
                </div>
                <div className="ml-auto md:ml-0"><StatusBadge status={item.status} lang={lang} /></div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
