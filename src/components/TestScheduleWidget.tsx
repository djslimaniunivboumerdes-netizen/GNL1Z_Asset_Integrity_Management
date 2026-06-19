import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { CalendarClock, ChevronDown, ChevronUp, Clock, AlertTriangle, MoreVertical, Pencil, Trash2, CheckCircle, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import type { ScheduleItem, ScheduleStatus } from "@/types/alerts";
import { buildSchedule } from "@/lib/alertEngine";
import { differenceInDays, parseISO, format } from "date-fns";

interface ScheduleItemWithId extends ScheduleItem {
  id?: string;
}

export function TestScheduleWidget() {
  const [items, setItems] = useState<ScheduleItemWithId[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNextDue, setEditNextDue] = useState("");
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadSchedule();
    // Close menu when clicking outside
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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

  function formatDate(dateStr: string | null): string {
    if (!dateStr) return "—";
    try {
      return format(parseISO(dateStr), "yyyy-MM-dd");
    } catch {
      return dateStr;
    }
  }

  function daysLeftText(days: number | null): string {
    if (days === null) return "";
    if (days < 0) return `(${Math.abs(days)}d overdue)`;
    return `(${days}d)`;
  }

  async function deleteTest(id: string, tag: string) {
    if (!confirm(`Delete test record for ${tag}?`)) return;
    const { error } = await supabase
      .from("equipment_test_dates")
      .delete()
      .eq("id", id);
    if (error) {
      toast({ title: "Delete failed", description: error.message, variant: "destructive" });
      return;
    }
    setItems((prev) => prev.filter((item) => item.id !== id));
    toast({ title: "Test deleted" });
    setMenuOpen(null);
  }

  async function closeTest(id: string) {
    // Mark as completed by setting next_due far in future or status
    const { error } = await supabase
      .from("equipment_test_dates")
      .update({ next_test_due: null, status: "COMPLETED" })
      .eq("id", id);
    if (error) {
      toast({ title: "Close failed", description: error.message, variant: "destructive" });
      return;
    }
    setItems((prev) => prev.filter((item) => item.id !== id));
    toast({ title: "Test marked as completed" });
    setMenuOpen(null);
  }

  function startEdit(item: ScheduleItemWithId) {
    setEditingId(item.id ?? null);
    setEditNextDue(item.next_due ?? "");
    setMenuOpen(null);
  }

  async function saveEdit(id: string) {
    if (!editNextDue) return;
    const { error } = await supabase
      .from("equipment_test_dates")
      .update({ next_test_due: editNextDue })
      .eq("id", id);
    if (error) {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Test updated" });
    setEditingId(null);
    loadSchedule();
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
            {/* Summary badges */}
            <div className="flex gap-2 mb-3">
              <Badge className="bg-red-600 text-white">
                {items.filter((i) => i.status === "OVERDUE").length} Overdue
              </Badge>
              <Badge className="bg-amber-500 text-white">
                {items.filter((i) => i.status === "DUE_SOON").length} Due Soon
              </Badge>
            </div>

            {/* Items list */}
            {expanded && (
              <div className="divide-y divide-border border border-border rounded-lg">
                {items.map((item) => {
                  const cfg = statusConfig[item.status];
                  const Icon = cfg.icon;
                  const isEditing = editingId === item.id;

                  return (
                    <div
                      key={item.id ?? item.tag}
                      className="flex items-center justify-between p-3 hover:bg-secondary/30 transition-colors relative"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <Icon className={`h-4 w-4 shrink-0 ${item.status === "OVERDUE" ? "text-red-500" : "text-amber-500"}`} />
                        <div className="min-w-0">
                          {/* Equipment tag - NOT a link */}
                          <div className="text-sm font-medium truncate">{item.tag}</div>

                          {isEditing ? (
                            <div className="flex items-center gap-2 mt-1">
                              <input
                                type="date"
                                value={editNextDue}
                                onChange={(e) => setEditNextDue(e.target.value)}
                                className="h-8 rounded border border-input px-2 text-xs"
                              />
                              <Button size="sm" className="h-8 text-xs" onClick={() => item.id && saveEdit(item.id)}>Save</Button>
                              <Button size="sm" variant="ghost" className="h-8 text-xs" onClick={() => setEditingId(null)}><X className="h-3 w-3" /></Button>
                            </div>
                          ) : (
                            <div className="text-xs text-muted-foreground">
                              Next due: {formatDate(item.next_due)}
                              {item.days_left !== null && (
                                <span className={item.status === "OVERDUE" ? "text-red-500 font-medium" : "text-amber-500 font-medium"}>
                                  {" "}{daysLeftText(item.days_left)}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Badge className={`${cfg.color} text-white text-[10px]`}>
                          {cfg.label}
                        </Badge>

                        {/* 3-dot menu */}
                        <div className="relative" ref={menuOpen === item.id ? menuRef : undefined}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => setMenuOpen(menuOpen === item.id ? null : item.id ?? null)}
                          >
                            <MoreVertical className="h-3.5 w-3.5 text-muted-foreground" />
                          </Button>

                          {menuOpen === item.id && (
                            <div className="absolute right-0 top-full mt-1 z-50 bg-popover border border-border rounded-md shadow-lg py-1 min-w-[140px]">
                              <button
                                className="w-full text-left px-3 py-1.5 text-xs hover:bg-secondary flex items-center gap-2"
                                onClick={() => startEdit(item)}
                              >
                                <Pencil className="h-3 w-3" /> Edit
                              </button>
                              <button
                                className="w-full text-left px-3 py-1.5 text-xs hover:bg-secondary flex items-center gap-2 text-emerald-600"
                                onClick={() => item.id && closeTest(item.id)}
                              >
                                <CheckCircle className="h-3 w-3" /> Close
                              </button>
                              <div className="border-t border-border my-1" />
                              <button
                                className="w-full text-left px-3 py-1.5 text-xs hover:bg-secondary flex items-center gap-2 text-destructive"
                                onClick={() => item.id && deleteTest(item.id, item.tag)}
                              >
                                <Trash2 className="h-3 w-3" /> Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
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
