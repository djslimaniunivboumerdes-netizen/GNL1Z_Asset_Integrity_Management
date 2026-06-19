// src/components/TestScheduleWidget.tsx
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarClock, AlertTriangle, ChevronRight, ArrowUpDown } from "lucide-react";
import { buildSchedule } from "@/lib/alertEngine";
import type { ScheduleItem, ScheduleStatus } from "@/types/alerts";
import { Badge } from "@/components/ui/badge";

type SortKey = "days_left" | "status" | "tag";

const STATUS_ORDER: Record<ScheduleStatus, number> = {
  OVERDUE:  0,
  DUE_SOON: 1,
  OK:       2,
};

function StatusBadge({ status, daysLeft }: { status: ScheduleStatus; daysLeft: number | null }) {
  if (status === "OVERDUE") {
    return (
      <Badge className="bg-red-600 text-white font-mono text-[10px] shrink-0">
        OVERDUE {daysLeft !== null ? `${Math.abs(daysLeft)}d` : ""}
      </Badge>
    );
  }
  if (status === "DUE_SOON") {
    return (
      <Badge className="bg-amber-500 text-white font-mono text-[10px] shrink-0">
        DUE SOON {daysLeft !== null ? `${daysLeft}d` : ""}
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="text-emerald-500 border-emerald-500/40 font-mono text-[10px] shrink-0">
      OK {daysLeft !== null ? `${daysLeft}d` : ""}
    </Badge>
  );
}

export function TestScheduleWidget() {
  const [items, setItems]   = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortKey, setSortKey] = useState<SortKey>("days_left");

  useEffect(() => {
    buildSchedule()
      .then(setItems)
      .finally(() => setLoading(false));
  }, []);

  const sorted = useMemo(() => {
    return [...items].sort((a, b) => {
      if (sortKey === "tag") return a.tag.localeCompare(b.tag);
      if (sortKey === "status") {
        const diff = STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
        return diff !== 0 ? diff : (a.days_left ?? 9999) - (b.days_left ?? 9999);
      }
      // days_left: nulls last, overdue first (negative days_left)
      const da = a.days_left ?? 9999;
      const db = b.days_left ?? 9999;
      return da - db;
    });
  }, [items, sortKey]);

  const visible   = sorted.slice(0, 15);
  const overdue   = items.filter((i) => i.status === "OVERDUE").length;
  const dueSoon   = items.filter((i) => i.status === "DUE_SOON").length;

  return (
    <section className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
        <div className="flex items-center gap-2">
          <CalendarClock className="h-4 w-4 text-accent" />
          <h2 className="text-sm uppercase tracking-widest font-mono text-muted-foreground">
            Next Test Schedule
          </h2>
          {overdue > 0 && (
            <Badge className="bg-red-600 text-white text-[10px]">
              {overdue} overdue
            </Badge>
          )}
          {dueSoon > 0 && (
            <Badge className="bg-amber-500 text-white text-[10px]">
              {dueSoon} due soon
            </Badge>
          )}
        </div>

        {/* Sort controls */}
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-muted-foreground mr-1 uppercase tracking-wider">
            Sort:
          </span>
          {(["days_left", "status", "tag"] as SortKey[]).map((k) => (
            <button
              key={k}
              onClick={() => setSortKey(k)}
              className={`text-[11px] px-2 py-0.5 rounded border transition font-mono ${
                sortKey === k
                  ? "bg-accent text-accent-foreground border-accent"
                  : "border-border text-muted-foreground hover:border-accent/50"
              }`}
            >
              {k === "days_left" ? "Days" : k === "status" ? "Status" : "Tag"}
            </button>
          ))}
        </div>
      </div>

      {/* Table header */}
      <div className="hidden md:grid grid-cols-[1fr_120px_120px_90px_auto] bg-secondary/60 text-[10px] uppercase tracking-wider text-muted-foreground px-4 py-2 rounded-t-lg border border-border border-b-0 font-semibold gap-2">
        <div className="flex items-center gap-1"><ArrowUpDown className="h-3 w-3" /> Tag</div>
        <div>Last Test</div>
        <div>Next Due</div>
        <div>Remaining</div>
        <div>Status</div>
      </div>

      {/* Rows */}
      <div className={`border border-border rounded-lg md:rounded-t-none overflow-hidden ${loading ? "opacity-60" : ""}`}>
        {loading ? (
          <div className="text-sm text-muted-foreground text-center py-10">Loading schedule…</div>
        ) : visible.length === 0 ? (
          <div className="text-sm text-muted-foreground text-center py-10 border border-dashed rounded">
            No scheduled tests found
          </div>
        ) : (
          <div className="divide-y divide-border">
            {visible.map((item) => (
              <Link
                key={item.tag}
                to={`/equipment/${encodeURIComponent(item.tag)}`}
                className="flex md:grid md:grid-cols-[1fr_120px_120px_90px_auto] items-center gap-2 px-4 py-3 hover:bg-secondary/40 transition text-sm"
              >
                {/* Tag */}
                <div className="flex items-center gap-2 min-w-0">
                  {item.status === "OVERDUE" && (
                    <AlertTriangle className="h-3.5 w-3.5 text-red-500 shrink-0" />
                  )}
                  <span className="font-mono font-semibold text-accent truncate">
                    {item.tag}
                  </span>
                </div>

                {/* Last test */}
                <div className="hidden md:block text-xs text-muted-foreground font-mono">
                  {item.last_test ?? "—"}
                </div>

                {/* Next due */}
                <div className="hidden md:block text-xs font-mono">
                  {item.next_due ?? "—"}
                </div>

                {/* Days remaining */}
                <div className={`hidden md:block text-xs font-bold font-mono ${
                  item.status === "OVERDUE"   ? "text-red-500"
                  : item.status === "DUE_SOON" ? "text-amber-500"
                  : "text-foreground"
                }`}>
                  {item.days_left === null
                    ? "—"
                    : item.days_left < 0
                    ? `−${Math.abs(item.days_left)}d`
                    : `${item.days_left}d`}
                </div>

                {/* Status badge */}
                <div className="ml-auto md:ml-0">
                  <StatusBadge status={item.status} daysLeft={item.days_left} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {sorted.length > 15 && (
        <div className="mt-2 text-xs text-muted-foreground text-right">
          Showing 15 of {sorted.length} — <Link to="/test-schedule" className="text-accent hover:underline">View all</Link>
        </div>
      )}
    </section>
  );
}
