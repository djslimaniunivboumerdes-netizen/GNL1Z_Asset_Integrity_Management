// src/pages/Dashboard.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Calendar, Clock } from "lucide-react";

import { getAlertStats } from "@/lib/alertEngine";
import { supabase } from "@/integrations/supabase/client";

export default function Dashboard() {
  const navigate = useNavigate();

  const [alertStats, setAlertStats] = useState({
    totalOpen: 0,
    highPriority: 0,
    overdue: 0,
    failedTests: 0,
  });

  const [scheduleSummary, setScheduleSummary] = useState<any[]>([]);

  useEffect(() => {
    const loadDashboard = async () => {
      // Load Alert Stats
      const stats = await getAlertStats();
      setAlertStats(stats);

      // Load Next Test Schedule
      const { data } = await supabase
        .from('equipment_test_dates')
        .select(`
          tag,
          last_tested,
          next_test_due,
          equipment!inner(name)
        `)
        .order('next_test_due', { ascending: true })
        .limit(10);

      setScheduleSummary(data || []);
    };

    loadDashboard();
  }, []);

  const handleRowClick = (tag: string) => {
    navigate(`/equipment/${tag}`);
  };

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-display font-bold tracking-tight">GNL1Z Dashboard</h1>
        <Button onClick={() => window.location.reload()}>Refresh Dashboard</Button>
      </div>

      {/* Fast Alerts Widget */}
      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <AlertTriangle className="h-6 w-6 text-destructive" />
            Fast Alerts Center
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <p className="text-5xl font-mono font-bold text-destructive">{alertStats.totalOpen}</p>
              <p className="text-sm text-muted-foreground mt-1">Open Alerts</p>
            </div>
            <div className="text-center">
              <p className="text-5xl font-mono font-bold text-orange-500">{alertStats.highPriority}</p>
              <p className="text-sm text-muted-foreground mt-1">High Priority</p>
            </div>
            <div className="text-center">
              <p className="text-5xl font-mono font-bold text-red-600">{alertStats.overdue}</p>
              <p className="text-sm text-muted-foreground mt-1">Overdue Tests</p>
            </div>
            <div>
              <Button 
                variant="outline" 
                className="w-full h-12 text-base"
                onClick={() => navigate('/alerts')}
              >
                View All Alerts →
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Next Test Schedule - Clickable */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="flex items-center gap-3">
            <Calendar className="h-6 w-6" />
            Next Test Schedule
          </CardTitle>
          <Button variant="outline" onClick={() => navigate('/test-schedule')}>
            Full Schedule
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="border-b text-left text-sm text-muted-foreground">
                  <th className="py-4 font-medium">TAG</th>
                  <th className="py-4 font-medium">EQUIPMENT NAME</th>
                  <th className="py-4 font-medium">LAST TEST</th>
                  <th className="py-4 font-medium">NEXT DUE</th>
                  <th className="py-4 text-right font-medium">DAYS LEFT</th>
                  <th className="py-4 text-center font-medium">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {scheduleSummary.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center text-muted-foreground">
                      No upcoming tests found.
                    </td>
                  </tr>
                ) : (
                  scheduleSummary.map((item) => {
                    const dueDate = new Date(item.next_test_due);
                    const daysLeft = Math.ceil((dueDate.getTime() - Date.now()) / (86400000));

                    return (
                      <tr 
                        key={item.tag}
                        className="hover:bg-accent/50 cursor-pointer transition-colors group"
                        onClick={() => handleRowClick(item.tag)}
                      >
                        <td className="py-5 font-mono text-accent font-semibold group-hover:underline">
                          {item.tag}
                        </td>
                        <td className="py-5 text-sm text-foreground">
                          {item.equipment?.name || "—"}
                        </td>
                        <td className="py-5 text-muted-foreground">
                          {item.last_tested || "—"}
                        </td>
                        <td className="py-5 font-medium">
                          {item.next_test_due}
                        </td>
                        <td className="py-5 text-right font-mono font-bold">
                          {daysLeft}
                        </td>
                        <td className="py-5 text-center">
                          <Badge 
                            variant={daysLeft < 0 ? "destructive" : daysLeft <= 30 ? "secondary" : "default"}
                            className="font-mono"
                          >
                            {daysLeft < 0 ? "OVERDUE" : daysLeft <= 30 ? "DUE SOON" : "OK"}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
