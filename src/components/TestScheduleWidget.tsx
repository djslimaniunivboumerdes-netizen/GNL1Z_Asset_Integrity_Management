import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { differenceInDays, parseISO } from "date-fns";
import { CalendarClock, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { EQUIPMENT } from "@/data";

interface DateRow {
  tag: string;
  next_test_due: string | null;
}

interface TrainRow {
  tag: string;
  train: string | null;
}

type ScheduleItem = {
  tag: string;
  next_test_due: string;
  train?: string | null;
  daysLeft: number;
};

export function TestScheduleWidget() {
  const [dates, setDates] = useState<Record<string, string>>({});
  const [trains, setTrains] = useState<Record<string, string>>({});

  // ── Load test dates ─────────────────────────────
  useEffect(() => {
    supabase
      .from("equipment_test_dates")
      .select("tag, next_test_due")
      .then(({ data }) => {
        const map: Record<string, string> = {};
        (data as DateRow[] | null)?.forEach((r) => {
          if (r.next_test_due) map[r.tag] = r.next_test_due;
        });
        setDates(map);
      });
  }, []);

  // ── Load train info (from equipment table OR fallback) ─────────────
  useEffect(() => {
    supabase
      .from("equipment")
      .select("tag, train")
      .then(({ data }) => {
        const map: Record<string, string> = {};
        (data as TrainRow[] | null)?.forEach((r) => {
          if (r.train) map[r.tag] = r.train;
        });
        setTrains(map);
      });
  }, []);

  // ── Build schedule list ─────────────────────────
  const schedule = useMemo(() => {
    const today = new Date();

    const list: ScheduleItem[] = [];

    for (const eq of EQUIPMENT) {
      const dueStr = dates[eq.tag] ?? eq.maintenance.next_test_due;
      if (!dueStr) continue;

      let dueDate: Date;
      try {
        dueDate = parseISO(dueStr);
      } catch {
        continue;
      }

      list.push({
        tag: eq.tag,
        next_test_due: dueStr,
        train: trains[eq.tag] ?? "—",
        daysLeft: differenceInDays(dueDate, today),
      });
    }

    return list.sort((a, b) => a.daysLeft - b.daysLeft);
  }, [dates, trains]);

  return (
    <section className="px-4 md:px-10 pb-2 max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="flex items-center gap-2 mb-4">
        <CalendarClock className="h-4 w-4 text-accent" />
        <h2 className="text-sm uppercase tracking-widest font-mono text-muted-foreground">
          Next Test Schedule
        </h2>
      </div>

      {/* LIST */}
      <div className="space-y-2">
        {schedule.length === 0 ? (
          <div className="text-sm text-muted-foreground border border-dashed rounded p-6 text-center">
            No scheduled tests found
          </div>
        ) : (
          schedule.slice(0, 12).map((item) => (
            <Link
              key={item.tag}
              to={`/equipment/${encodeURIComponent(item.tag)}`}
              className="flex items-center justify-between border rounded-lg bg-card p-4 hover:bg-secondary/40 transition"
            >
              {/* LEFT */}
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  {item.daysLeft < 0 && (
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                  )}
                  <span className="font-mono font-semibold text-accent">
                    {item.tag}
                  </span>

                  <span className="text-xs text-muted-foreground border px-2 py-0.5 rounded">
                    {item.train}
                  </span>
                </div>

                <div className="text-xs text-muted-foreground mt-1">
                  Next test:{" "}
                  {new Date(item.next_test_due).toLocaleDateString()}
                </div>
              </div>

              {/* RIGHT */}
              <div className="text-right">
                <div
                  className={`text-sm font-bold ${
                    item.daysLeft < 0
                      ? "text-red-500"
                      : item.daysLeft <= 30
                      ? "text-amber-500"
                      : "text-foreground"
                  }`}
                >
                  {item.daysLeft < 0
                    ? `${Math.abs(item.daysLeft)}d overdue`
                    : `${item.daysLeft}d left`}
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </section>
  );
}
