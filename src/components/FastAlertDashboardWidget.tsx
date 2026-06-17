import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

type Priority = 1 | 2 | 3;

interface Alert {
  id: string;
  priority: Priority;
  train: string;
  equipment_tag: string;
  description: string;
  created_at: string;
}

function style(p: Priority) {
  if (p === 1)
    return "border-red-500 bg-red-500/10 animate-pulse shadow-lg shadow-red-500/30";
  if (p === 2)
    return "border-orange-500 bg-orange-500/10";
  return "border-yellow-400 bg-yellow-400/10";
}

export function FastAlertDashboardWidget() {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    supabase
      .from("fast_alerts")
      .select("id, priority, train, equipment_tag, description, created_at")
      .order("created_at", { ascending: false })
      .limit(5)
      .then(({ data }) => setAlerts((data as Alert[]) ?? []));
  }, []);

  const sorted = [
    ...alerts.filter(a => a.priority === 1),
    ...alerts.filter(a => a.priority === 2),
    ...alerts.filter(a => a.priority === 3),
  ];

  return (
    <div className="border rounded-lg p-4 bg-card">
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle className="h-4 w-4 text-red-500" />
        <h2 className="text-sm uppercase font-mono text-muted-foreground">
          Fast Alerts
        </h2>
      </div>

      <div className="space-y-2">
        {sorted.length === 0 ? (
          <p className="text-sm text-muted-foreground">No active alerts</p>
        ) : (
          sorted.map((a) => (
            <Link
              key={a.id}
              to={`/equipment/${encodeURIComponent(a.equipment_tag)}`}
              className={`block p-3 rounded border transition ${style(a.priority)}`}
            >
              <div className="flex justify-between">
                <span className="font-mono text-sm">{a.equipment_tag}</span>
                <span className="text-xs opacity-70">{a.train}</span>
              </div>
              <p className="text-xs mt-1 line-clamp-2">
                {a.description}
              </p>
            </Link>
          ))
        )}
      </div>
    </div>
  );
              }
