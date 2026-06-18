// src/pages/Dashboard.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Clock, Calendar } from "lucide-react";
import { getAlertStats } from "@/lib/alertEngine";
import { supabase } from "@/integrations/supabase/client";

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalOpen: 0,
    highPriority: 0,
    overdue: 0,
    failedTests: 0,
  });

  const [scheduleSummary, setScheduleSummary] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const alertData = await getAlertStats();
      setStats(alertData);

      // Load test schedule
      const { data } = await supabase
        .from('equipment_test_dates')
        .select(`
          tag,
          last_tested,
          next_test_due,
          equipment!inner(tag, name)
        `)
        .order('next_test_due', { ascending: true })
        .limit(8);  // Show more on dashboard

      setScheduleSummary(data || []);
    };

    loadData();
  }, []);

  const handleEquipmentClick = (tag: string) => {
    navigate(`/equipment/${tag}`);
  };

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-display font-bold tracking-tight">GNL1Z Dashboard</h1>
        <Button onClick={() => window.location.reload()}>Refresh All</Button>
      </div>

      {/* Fast Alerts Widget - Clickable soon */}
      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <AlertTriangle className="h-6 w-6 text-destructive" />
            Fast Alerts Center
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-4xl font-mono font-bold text-destructive">{stats.totalOpen}</p>
              <p className="text-sm text-muted-foreground">Open Alerts</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-mono font-bold text-orange-500">{stats.highPriority}</p>
              <p className="text-sm text-muted-foreground">High Priority</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-mono font-bold text-red-600">{stats.overdue}</p>
              <p className="text-sm text-muted-foreground">Overdue Tests</p>
            </div>
            <div className="text-center">
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={() => navigate('/alerts')}
              >
                View All Alerts →
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Next Test Schedule - Now Clickable */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-3">
            <Calendar className="h-5 w-5" />
            Next Test Schedule
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/test-schedule')}
          >
            View Full Schedule
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3">Tag</th>
                  <th className="text-left py-3">Equipment Name</th>
                  <th className="text-left py-3">Last Test</th>
                  <th className="text-left py-3">Next Due</th>
                  <th className="text-right py-3">Days Left</th>
                  <th className="text-center py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {scheduleSummary.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-muted-foreground">
                      No upcoming tests scheduled.
                    </td>
                  </tr>
                ) : (
                  scheduleSummary.map((item) => {
                    const dueDate = new Date(item.next_test_due);
                    const daysLeft = Math.ceil((dueDate.getTime() - Date.now()) / (1000 * 3600 * 24));
                    
                    return (
                      <tr 
                        key={item.tag} 
                        className="border-b hover:bg-accent/50 cursor-pointer transition-colors"
                        onClick={() => handleEquipmentClick(item.tag)}
                      >
                        <td className="py-4 font-mono font-medium text-accent">{item.tag}</td>
                        <td className="py-4 text-sm">{item.equipment?.name || '—'}</td>
                        <td className="py-4 text-muted-foreground">{item.last_tested || '—'}</td>
                        <td className="py-4 font-medium">{item.next_test_due}</td>
                        <td className="py-4 text-right font-mono">
                          {daysLeft > 0 ? `+${daysLeft}` : daysLeft}
                        </td>
                        <td className="py-4 text-center">
                          <Badge 
                            variant={daysLeft < 0 ? "destructive" : daysLeft <= 30 ? "secondary" : "default"}
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
