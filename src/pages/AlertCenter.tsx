// src/pages/AlertCenter.tsx
import { useEffect, useState, useCallback } from "react";
import {
  AlertTriangle, ShieldAlert, RefreshCw, Filter,
  CheckCircle2, Clock, XCircle, ChevronDown, Settings2, Save,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { runAlertEngine, computeAlertStats, loadIntervalConfig, saveIntervalConfig } from "@/lib/alertEngine";
import type { Alert, AlertStats, AlertStatus, AlertType, AlertPriority, TestIntervalConfig } from "@/types/alerts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

// ── Constants ────────────────────────────────────────────────────────────────

const STATUS_OPTIONS: AlertStatus[] = ["OPEN", "ACKNOWLEDGED", "RESOLVED"];
const TYPE_OPTIONS: AlertType[] = ["FAILED_TEST", "UPCOMING_TEST", "OVERDUE_TEST", "KEYWORD_NOTE"];
const PRIORITY_OPTIONS: AlertPriority[] = ["HIGH", "MEDIUM", "LOW"];

const TYPE_LABEL: Record<AlertType, string> = {
  FAILED_TEST:   "Failed Test",
  UPCOMING_TEST: "Upcoming Test",
  OVERDUE_TEST:  "Overdue Test",
  KEYWORD_NOTE:  "Note Keyword",
};

const PRIORITY_COLOR: Record<AlertPriority, string> = {
  HIGH:   "bg-red-600   text-white",
  MEDIUM: "bg-amber-500 text-white",
  LOW:    "bg-yellow-400 text-black",
};

const PRIORITY_BORDER: Record<AlertPriority, string> = {
  HIGH:   "border-l-red-500",
  MEDIUM: "border-l-amber-500",
  LOW:    "border-l-yellow-400",
};

const STATUS_ICON: Record<AlertStatus, React.ElementType> = {
  OPEN:         AlertTriangle,
  ACKNOWLEDGED: Clock,
  RESOLVED:     CheckCircle2,
};

// ── Component ────────────────────────────────────────────────────────────────

export default function AlertCenter() {
  const [alerts,  setAlerts]  = useState<Alert[]>([]);
  const [stats,   setStats]   = useState<AlertStats>({ total_open: 0, overdue: 0, failed_tests: 0, upcoming_tests: 0 });
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Filters
  const [filterStatus,   setFilterStatus]   = useState<AlertStatus | "ALL">("ALL");
  const [filterType,     setFilterType]     = useState<AlertType   | "ALL">("ALL");
  const [filterPriority, setFilterPriority] = useState<AlertPriority | "ALL">("ALL");
  const [search,         setSearch]         = useState("");

  // Interval settings
  const [intervals, setIntervals] = useState<TestIntervalConfig>(loadIntervalConfig());

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("alerts" as never)
      .select("*")
      .order("created_at", { ascending: false }) as { data: Alert[] | null };

    const list = data ?? [];
    setAlerts(list);
    setStats(computeAlertStats(list));
    setLoading(false);
  }, []);

  useEffect(() => { void load(); }, [load]);

  const scan = async () => {
    setScanning(true);
    try {
      await runAlertEngine();
      await load();
      toast({ title: "Alert scan complete" });
    } catch (e: any) {
      toast({ title: "Scan failed", description: e.message, variant: "destructive" });
    } finally {
      setScanning(false);
    }
  };

  const updateStatus = async (id: string, status: AlertStatus) => {
    const { error } = await supabase
      .from("alerts" as never)
      .update({ status } as never)
      .eq("id", id) as { error: any };

    if (error) {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
      return;
    }
    setAlerts((prev) => prev.map((a) => a.id === id ? { ...a, status } : a));
    setStats((prev) => computeAlertStats(alerts.map((a) => a.id === id ? { ...a, status } : a)));
    toast({ title: `Alert ${status.toLowerCase()}` });
  };

  const saveIntervals = () => {
    saveIntervalConfig(intervals);
    toast({ title: "Interval settings saved" });
    setShowSettings(false);
  };

  // Filtered list
  const filtered = alerts.filter((a) => {
    if (filterStatus   !== "ALL" && a.status     !== filterStatus)   return false;
    if (filterType     !== "ALL" && a.alert_type !== filterType)     return false;
    if (filterPriority !== "ALL" && a.priority   !== filterPriority) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      if (!a.tag.toLowerCase().includes(q) && !a.message.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  return (
    <div className="px-4 md:px-8 py-6 max-w-7xl mx-auto">

      {/* Page header */}
      <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 text-red-500" />
          <h1 className="text-2xl font-display font-bold">Alert Center</h1>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
            className="gap-2"
          >
            <Settings2 className="h-4 w-4" />
            Intervals
          </Button>
          <Button
            onClick={scan}
            disabled={scanning}
            size="sm"
            className="gap-2 bg-accent hover:bg-accent/90 text-accent-foreground"
          >
            <RefreshCw className={`h-4 w-4 ${scanning ? "animate-spin" : ""}`} />
            {scanning ? "Scanning…" : "Scan Now"}
          </Button>
        </div>
      </div>

      {/* Interval settings panel */}
      {showSettings && (
        <div className="border border-border rounded-lg bg-card p-5 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Settings2 className="h-4 w-4 text-accent" />
            <h3 className="font-display font-semibold">Test Interval Configuration (days)</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(["hydrostatic", "psv", "preventive"] as const).map((key) => (
              <div key={key}>
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">
                  {key === "hydrostatic" ? "Hydrostatic Test"
                   : key === "psv"        ? "PSV Inspection"
                   : "Preventive Inspection"}
                </div>
                <Input
                  type="number"
                  min={1}
                  value={intervals[key]}
                  onChange={(e) => setIntervals((prev) => ({ ...prev, [key]: Number(e.target.value) }))}
                />
              </div>
            ))}
          </div>
          <div className="mt-4 flex gap-2 justify-end">
            <Button variant="outline" size="sm" onClick={() => setShowSettings(false)}>Cancel</Button>
            <Button size="sm" onClick={saveIntervals} className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90">
              <Save className="h-4 w-4" /> Save
            </Button>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Open Alerts",   value: stats.total_open,    color: "border-red-500/30 bg-red-500/5   text-red-400"   },
          { label: "Overdue",       value: stats.overdue,       color: "border-red-500/30 bg-red-500/5   text-red-400"   },
          { label: "Failed Tests",  value: stats.failed_tests,  color: "border-amber-500/30 bg-amber-500/5 text-amber-400" },
          { label: "Upcoming Tests",value: stats.upcoming_tests,color: "border-amber-500/30 bg-amber-500/5 text-amber-400" },
        ].map((s) => (
          <div key={s.label} className={`rounded-lg border p-4 ${s.color}`}>
            <div className="text-2xl font-bold font-mono">{s.value}</div>
            <div className="text-[10px] uppercase tracking-wider mt-1 opacity-80">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="border border-border rounded-lg bg-card p-4 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Filters</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Search</div>
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tag or message…"
              className="h-9 text-sm"
            />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Status</div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="ALL">All statuses</option>
              {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Type</div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="ALL">All types</option>
              {TYPE_OPTIONS.map((t) => <option key={t} value={t}>{TYPE_LABEL[t]}</option>)}
            </select>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Priority</div>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value as any)}
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="ALL">All priorities</option>
              {PRIORITY_OPTIONS.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Alert count */}
      <div className="text-xs text-muted-foreground mb-2">
        {filtered.length} alert{filtered.length !== 1 ? "s" : ""} shown
        {filtered.length !== alerts.length && ` (filtered from ${alerts.length})`}
      </div>

      {/* Alert table */}
      <div className="border border-border rounded-lg overflow-hidden bg-card">
        {/* Table header — desktop */}
        <div className="hidden md:grid grid-cols-[120px_auto_1fr_130px_140px] bg-secondary/60 text-[10px] uppercase tracking-wider text-muted-foreground px-4 py-2 font-semibold gap-3">
          <div>Date</div>
          <div>Tag</div>
          <div>Message</div>
          <div>Type / Priority</div>
          <div>Status</div>
        </div>

        {loading ? (
          <div className="text-sm text-muted-foreground text-center py-12">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="text-sm text-muted-foreground text-center py-12">
            <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-emerald-500 opacity-60" />
            No alerts match the current filters
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filtered.map((a) => {
              const StatusIcon = STATUS_ICON[a.status];
              return (
                <div
                  key={a.id}
                  className={`flex flex-col md:grid md:grid-cols-[120px_auto_1fr_130px_140px] gap-2 md:gap-3 px-4 py-3 border-l-2 hover:bg-secondary/30 transition ${PRIORITY_BORDER[a.priority]}`}
                >
                  {/* Date */}
                  <div className="text-[11px] text-muted-foreground font-mono self-start pt-0.5">
                    {new Date(a.created_at).toLocaleDateString()}<br />
                    <span className="opacity-60">{new Date(a.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                  </div>

                  {/* Tag */}
                  <div className="self-start">
                    <Link
                      to={`/equipment/${encodeURIComponent(a.tag)}`}
                      className="font-mono text-sm font-semibold text-accent hover:underline"
                    >
                      {a.tag}
                    </Link>
                  </div>

                  {/* Message */}
                  <div className="text-sm text-foreground/90 self-start">{a.message}</div>

                  {/* Type + Priority */}
                  <div className="flex flex-wrap gap-1.5 self-start">
                    <Badge className={`text-[10px] font-mono ${PRIORITY_COLOR[a.priority]}`}>
                      {a.priority}
                    </Badge>
                    <Badge variant="outline" className="text-[10px] font-mono">
                      {TYPE_LABEL[a.alert_type] ?? a.alert_type}
                    </Badge>
                  </div>

                  {/* Status + actions */}
                  <div className="flex items-center gap-1.5 self-start flex-wrap">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <StatusIcon className="h-3.5 w-3.5" />
                      {a.status}
                    </div>
                    {a.status === "OPEN" && (
                      <button
                        onClick={() => updateStatus(a.id, "ACKNOWLEDGED")}
                        className="text-[10px] border border-amber-500/50 text-amber-500 hover:bg-amber-500/10 px-1.5 py-0.5 rounded transition"
                      >
                        ACK
                      </button>
                    )}
                    {a.status !== "RESOLVED" && (
                      <button
                        onClick={() => updateStatus(a.id, "RESOLVED")}
                        className="text-[10px] border border-emerald-500/50 text-emerald-500 hover:bg-emerald-500/10 px-1.5 py-0.5 rounded transition"
                      >
                        RESOLVE
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
             }
