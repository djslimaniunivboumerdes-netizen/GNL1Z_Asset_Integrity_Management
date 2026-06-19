import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarClock, ChevronDown, ChevronUp, AlertTriangle, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ScheduleItem, ScheduleStatus } from "@/types/alerts";
import { buildSchedule } from "@/lib/alertEngine";

export function TestScheduleWidget() {
  const [items, setItems] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    loadSchedule();
  }, []);

  async function loadSchedule() {
    setLoading(true);
    try {
      const schedule = await buildSchedule();
      // Filter out OK status - only show OVERDUE and DUE_SOON
      const filtered = schedule.filter((item) => item.status !== "OK");
      setItems(filtered);
    } catch (err) {
      console.error("Failed to load schedule:", err);
    }
    setLoading(false);
  }

  const statusConfig: Record<ScheduleStatus, { label: string; color: string; icon: typeof AlertTriangle }> = {
    OVERDUE: { label: "Overdue", color: "bg-red-600", icon: AlertTriangle },
    "DUE_SOON": { label: "Due Soon", color: "bg-amber-500", icon: Clock },
    OK: { label: "OK", color: "bg-emerald-500", icon: Clock },
  };

  return (
    <Card className="border-border">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="flex items-center gap-2">
          <CalendarClock className="h-5 w-5 text-amber-500" />
          <CardTitle className="text-lg font-display">Test Schedule</CardTitle>
          {!loading && items.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {items.length} requiring attention
            </Badge>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setExpanded((e) => !e)}
          className="gap-1"
        >
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          {expanded ? "Hide" : "Show"}
        </Button>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="text-center py-4 text-muted-foreground text-sm">Loading schedule...</div>
        ) : items.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground text-sm">
            No overdue or upcoming tests. All equipment is up to date.
          </div>
        ) : (
          <div className="space-y-2">
            {/* Summary always visible */}
            <div className="flex gap-2 mb-3">
              <Badge className="bg-red-600 text-white">
                {items.filter((i) => i.status === "OVERDUE").length} Overdue
              </Badge>
              <Badge className="bg-amber-500 text-white">
                {items.filter((i) => i.status === "DUE_SOON").length} Due Soon
              </Badge>
            </div>

            {/* Expandable list */}
            {expanded && (
              <div className="divide-y divide-border border border-border rounded-lg">
                {items.map((item) => {
                  const cfg = statusConfig[item.status];
                  const Icon = cfg.icon;
                  return (
                    <div
                      key={item.tag}
                      className="flex items-center justify-between p-3 hover:bg-secondary/30 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Icon className={`h-4 w-4 shrink-0 ${item.status === "OVERDUE" ? "text-red-500" : "text-amber-500"}`} />
                        <div className="min-w-0">
                          <div className="text-sm font-medium truncate">{item.tag}</div>
                          <div className="text-xs text-muted-foreground">
                            Next due: {item.next_due ?? "—"}
                            {item.days_left !== null && (
                              <span className={item.status === "OVERDUE" ? "text-red-500 font-medium" : "text-amber-500 font-medium"}>
                                {" "}({item.days_left}d)
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <Badge className={`${cfg.color} text-white text-[10px] shrink-0`}>
                        {cfg.label}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            )}

            {!expanded && items.length > 0 && (
              <div className="text-xs text-muted-foreground text-center py-2">
                Click "Show" to view {items.length} items
              </div>
            )}

            <Button asChild variant="outline" size="sm" className="w-full mt-2">
              <Link to="/test-schedule">View Full Schedule →</Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
