import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { AlertTriangle, Flame, CircleAlert } from "lucide-react";

type Alert = {
  id: string;
  tag: string | null;
  train: string;
  priority: "P1" | "P2" | "P3";
  description: string;
  status: "OPEN" | "IN_PROGRESS" | "CLOSED";
  created_at: string;
};

export function FastAlertPanel() {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const { data } = await supabase
      .from("equipment_alerts")
      .select("*")
      .order("created_at", { ascending: false });

    setAlerts((data as Alert[]) ?? []);
  };

  const getStyle = (p: string) => {
    if (p === "P1") return "border-red-500 bg-red-500/10 animate-pulse shadow-red-500/30 shadow-lg";
    if (p === "P2") return "border-orange-400 bg-orange-400/10";
    return "border-yellow-400 bg-yellow-400/10";
  };

  const getIcon = (p: string) => {
    if (p === "P1") return <Flame className="text-red-500" />;
    if (p === "P2") return <AlertTriangle className="text-orange-400" />;
    return <CircleAlert className="text-yellow-400" />;
  };

  const active = alerts.filter(a => a.status !== "CLOSED");

  return (
    <div className="border border-border rounded-lg p-5 bg-card">
      <h3 className="font-bold mb-3">🚨 Fast Alerts</h3>

      {active.length === 0 ? (
        <p className="text-sm text-muted-foreground">No active alerts</p>
      ) : (
        <div className="space-y-3">
          {active
            .sort((a, b) => (a.priority === "P1" ? -1 : 1))
            .map((a) => (
              <Link
                to={`/equipment/${a.tag}`}
                key={a.id}
                className={`block border rounded-lg p-3 transition hover:scale-[1.01] ${getStyle(a.priority)}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getIcon(a.priority)}
                    <span className="font-bold">{a.priority}</span>
                    <span className="text-xs text-muted-foreground">
                      {a.train}
                    </span>
                  </div>

                  <span className="text-xs text-muted-foreground">
                    {new Date(a.created_at).toLocaleString()}
                  </span>
                </div>

                <p className="text-sm mt-2">{a.description}</p>
              </Link>
            ))}
        </div>
      )}
    </div>
  );
}
