// src/components/FastAlertDashboardWidget.tsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, ShieldAlert, Clock, XCircle, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { runAlertEngine, computeAlertStats } from "@/lib/alertEngine";
import type { Alert, AlertStats } from "@/types/alerts";

function StatCard({
  label,
  value,
  color,
  icon: Icon,
}: {
  label: string;
  value: number;
  color: string;
  icon: React.ElementType;
}) {
  return (
    <div className={`rounded-lg border p-3 flex items-center gap-3 ${color}`}>
      <Icon className="h-5 w-5 shrink-0 opacity-80" />
      <div>
        <div className="text-xl font-bold font-mono leading-none">{value}</div>
        <div className="text-[10px] uppercase tracking-wider mt-0.5 opacity-80">{label}</div>
      </div>
    </div>
  );
}

const PRIORITY_STYLE: Record<string, string> = {
  HIGH:   "border-red-500/60   bg-red-500/10   text-red-400",
  MEDIUM: "border-amber-500/60 bg-amber-500/10 text-amber-400",
  LOW:    "border-yellow-500/60 bg-yellow-500/10 text-yellow-400",
};

const TYPE_LABEL: Record<string, string> = {
  FAILED_TEST:   "Failed Test",
  UPCOMING_TEST: "Upcoming Test",
  OVERDUE_TEST:  "Overdue Test",
  KEYWORD_NOTE:  "Note Keyword",
};

export function FastAlertDashboardWidget() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [stats,  setStats]  = useState<AlertStats>({ total_open: 0, overdue: 0, failed_tests: 0, upcoming_tests: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      // Run engine to generate/sync alerts first
      await runAlertEngine();

      // Then load top open alerts
      const { data } = await supabase
        .from("alerts" as never)
        .select("*")
        .in("status", ["OPEN", "ACKNOWLEDGED"])
        .order("created_at", { ascending: false })
        .limit(50) as { data: Alert[] | null };

      const list = data ?? [];
      setAlerts(list.slice(0, 5));
      setStats(computeAlertStats(list));
      setLoading(false);
    };
    void init();
  }, []);

  return (
    <section className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-red-500" />
          <h2 className="text-sm uppercase tracking-widest font-mono text-muted-foreground">
            Fast Alerts
          </h2>
          {stats.total_open > 0 && (
            <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              {stats.total_open}
            </span>
          )}
        </div>
        <Link
          to="/alerts"
          className="text-xs text-accent hover:underline flex items-center gap-1"
        >
          Alert Center <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
        <StatCard
          label="Open Alerts"
          value={stats.total_open}
          color="border-red-500/30 bg-red-500/5 text-red-400"
          icon={AlertTriangle}
        />
        <StatCard
          label="Overdue"
          value={stats.overdue}
          color="border-red-500/30 bg-red-500/5 text-red-400"
          icon={XCircle}
        />
        <StatCard
          label="Failed Tests"
          value={stats.failed_tests}
          color="border-amber-500/30 bg-amber-500/5 text-amber-400"
          icon={ShieldAlert}
        />
        <StatCard
          label="Upcoming Tests"
          value={stats.upcoming_tests}
          color="border-amber-500/30 bg-amber-500/5 text-amber-400"
          icon={Clock}
        />
      </div>

      {/* Recent alerts list */}
      <div className="border border-border rounded-lg bg-card overflow-hidden">
        {loading ? (
          <div className="text-sm text-muted-foreground text-center py-6">Scanning…</div>
        ) : alerts.length === 0 ? (
          <div className="text-sm text-muted-foreground text-center py-6 flex items-center justify-center gap-2">
            <span className="text-emerald-500">✓</span> No open alerts
          </div>
        ) : (
          <div className="divide-y divide-border">
            {alerts.map((a) => (
              <Link
                key={a.id}
                to={`/equipment/${encodeURIComponent(a.tag)}`}
                className={`flex items-start gap-3 px-4 py-3 hover:bg-secondary/40 transition border-l-2 ${
                  a.priority === "HIGH"   ? "border-l-red-500"
                  : a.priority === "MEDIUM" ? "border-l-amber-500"
                  : "border-l-yellow-400"
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-sm font-semibold text-accent">
                      {a.tag}
                    </span>
                    <span className={`text-[10px] border px-1.5 py-0.5 rounded font-mono uppercase ${PRIORITY_STYLE[a.priority]}`}>
                      {a.priority}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {TYPE_LABEL[a.alert_type] ?? a.alert_type}
                    </span>
                  </div>
                  <p className="text-xs text-foreground/80 mt-1 line-clamp-1">{a.message}</p>
                </div>
                <div className="text-[10px] text-muted-foreground font-mono shrink-0 mt-0.5">
                  {new Date(a.created_at).toLocaleDateString()}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
