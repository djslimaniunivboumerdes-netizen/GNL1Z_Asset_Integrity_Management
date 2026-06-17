import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarClock, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

interface TestRow {
  tag: string;
  next_test_due: string | null;
  last_tested: string | null;
}

export default function TestSchedule() {
  const [rows, setRows] = useState<TestRow[]>([]);

  const load = async () => {
    const { data, error } = await supabase
      .from("equipment_test_dates")
      .select("*")
      .order("next_test_due");

    if (error) {
      toast({
        title: "Load failed",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    setRows(data ?? []);
  };

  useEffect(() => {
    load();
  }, []);

  const removeSchedule = async (tag: string) => {
    if (!confirm(`Remove ${tag} from test schedule?`)) return;

    const { error } = await supabase
      .from("equipment_test_dates")
      .delete()
      .eq("tag", tag);

    if (error) {
      toast({
        title: "Delete failed",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({ title: "Removed from schedule" });
    load();
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex items-center gap-2 mb-6">
        <CalendarClock className="h-5 w-5 text-accent" />
        <h1 className="text-2xl font-bold">
          Scheduled Equipment Tests
        </h1>
      </div>

      <div className="space-y-3">
        {rows.map((r) => {
          const train =
            r.tag.startsWith("X01") ? "T100" :
            r.tag.startsWith("X02") ? "T200" :
            r.tag.startsWith("X03") ? "T300" :
            r.tag.startsWith("X04") ? "T400" :
            r.tag.startsWith("X05") ? "T500" :
            r.tag.startsWith("X06") ? "T600" :
            "Unknown";

          return (
            <div
              key={r.tag}
              className="border rounded-lg p-4 bg-card flex justify-between items-center"
            >
              <div>
                <Link
                  to={`/equipment/${encodeURIComponent(r.tag)}`}
                  className="font-mono font-bold text-accent hover:underline"
                >
                  {r.tag}
                </Link>

                <div className="text-sm text-muted-foreground mt-1">
                  Train: {train}
                </div>

                <div className="text-sm">
                  Next Test:
                  <span className="ml-2 font-medium">
                    {r.next_test_due ?? "-"}
                  </span>
                </div>
              </div>

              <Button
                variant="destructive"
                size="sm"
                onClick={() => removeSchedule(r.tag)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Remove
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
                    }
