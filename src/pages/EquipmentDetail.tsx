// src/pages/EquipmentDetail.tsx
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Fuse from "fuse.js";
import { format, parseISO } from "date-fns";
import { 
  ArrowLeft, Copy, Check, Download, Wrench, Anchor, Snowflake, 
  Package, Info, Search, FileText, Save, CalendarIcon, ExternalLink, 
  QrCode, X, ShieldCheck, AlertTriangle, Calendar 
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

import { getEquipmentByTag, isShellAndTube, type SparePart, type Equipment } from "@/data";
import {
  predictWrench, predictToolKit, suggestShackle, safetyLoadKg,
  insulationRecommendation, exportToCsv, defaultBoltForType, recommendCrane,
} from "@/lib/industrial";

import { useI18n } from "@/contexts/I18nContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

import { SvgQr } from "@/components/SvgQr";
import { ImageGallery } from "@/components/ImageGallery";
import { MaintenanceTimeline } from "@/components/MaintenanceTimeline";
import NotFound from "./NotFound";

// NEW IMPORTS
import { computeNextTestForTag } from "@/lib/testSchedule";
import { refreshAlertsForTag } from "@/lib/alertEngine";

const TRAINS = ["T100", "T200", "T300", "T400", "T500", "T600"];

export default function EquipmentDetail() {
  const { tag = "" } = useParams();
  const { t, lang } = useI18n();
  const eq = getEquipmentByTag(decodeURIComponent(tag));

  // ── Existing State ─────────────────────────────────────────────────────
  const [qrOpen, setQrOpen] = useState(false);
  const [notes, setNotes] = useState<any[]>([]);
  const [newNote, setNewNote] = useState("");
  const [train, setTrain] = useState("T100");
  const [savingNote, setSavingNote] = useState(false);

  // ── NEW: Test Schedule + Alerts ───────────────────────────────────────
  const [testInfo, setTestInfo] = useState<any>(null);
  const [activeAlerts, setActiveAlerts] = useState<any[]>([]);

  if (!eq) return <NotFound />;

  const boltSize = defaultBoltForType(eq.type.code);
  const wrench = predictWrench(boltSize);
  const tools = predictToolKit(boltSize);
  const shackle = suggestShackle(eq.technical.weight_kg);
  const safety = safetyLoadKg(eq.technical.weight_kg);
  const insulation = insulationRecommendation(eq.type.code, eq.technical.temperature_c);
  const crane = recommendCrane(eq.technical.weight_kg);

  const pageUrl = `${window.location.origin}/equipment/${encodeURIComponent(eq.tag)}`;

  // ── Load Notes + NEW Test Schedule + Alerts ───────────────────────────
  useEffect(() => {
    let active = true;

    (async () => {
      // Existing: Notes
      const { data: notesData, error } = await supabase
        .from("equipment_notes")
        .select("*")
        .eq("tag", eq.tag)
        .order("created_at", { ascending: false });

      if (error) console.error("Notes load error:", error.message);
      if (active) setNotes(notesData ?? []);

      // NEW: Test Schedule
      const testData = await computeNextTestForTag(eq.tag);
      if (active) setTestInfo(testData);

      // NEW: Active Alerts
      const { data: alertsData } = await supabase
        .from('alerts')
        .select('*')
        .eq('tag', eq.tag)
        .eq('status', 'OPEN')
        .order('created_at', { ascending: false });
      if (active) setActiveAlerts(alertsData || []);

      // Background refresh
      refreshAlertsForTag(eq.tag);
    })();

    return () => { active = false; };
  }, [eq.tag]);

  // ── Add note (unchanged) ──────────────────────────────────────────────
  const addNote = async () => {
    if (!newNote.trim()) return;
    setSavingNote(true);

    const { error } = await supabase.from("equipment_notes").insert({
      tag: eq.tag,
      train,
      note: newNote.trim(),
    });

    setSavingNote(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }

    setNewNote("");
    const { data } = await supabase
      .from("equipment_notes")
      .select("*")
      .eq("tag", eq.tag)
      .order("created_at", { ascending: false });
    setNotes(data ?? []);
  };

  // ── Delete note (unchanged) ───────────────────────────────────────────
  const deleteNote = async (id: string) => {
    const { error } = await supabase.from("equipment_notes").delete().eq("id", id);
    if (error) {
      toast({ title: "Delete failed", description: error.message, variant: "destructive" });
      return;
    }
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-7xl mx-auto">
      <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2">
        <Link to="/equipment"><ArrowLeft className="h-4 w-4 mr-1" /> {t("back")}</Link>
      </Button>

      {/* Hero Header - Unchanged */}
      <div className="relative overflow-hidden border border-border rounded-lg bg-gradient-industrial p-6 md:p-8 mb-6 text-white">
        {/* ... your existing hero code remains exactly the same ... */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="font-mono text-xs uppercase tracking-widest text-white/60 mb-2">{eq.type.name}</div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl md:text-4xl font-display font-bold tracking-tight">{eq.tag}</h1>
              <button onClick={() => setQrOpen(!qrOpen)} title="QR Code" className="shrink-0 h-9 w-9 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center transition-colors">
                {qrOpen ? <X className="h-4 w-4 text-white" /> : <QrCode className="h-4 w-4 text-accent" />}
              </button>
            </div>
            <p className="text-white/80 mt-2 max-w-2xl">{eq.name}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge className="bg-white/10 border border-white/20 text-white font-mono">{eq.unit}</Badge>
            <Badge className="bg-white/10 border border-white/20 text-white font-mono">{eq.section}</Badge>
            <Badge className="bg-accent text-accent-foreground font-mono">{eq.testing_status}</Badge>
          </div>
        </div>

        {qrOpen && (
          /* ... your existing QR section unchanged ... */
          <div className="mt-5 pt-5 border-t border-white/20 flex flex-col sm:flex-row items-start gap-5">
            <div className="bg-white rounded-xl p-2 shadow-lg shrink-0">
              <SvgQr value={pageUrl} size={160} />
            </div>
            {/* ... rest of QR code UI ... */}
          </div>
        )}
      </div>

      {/* ==================== NEW: TEST SCHEDULE ==================== */}
      <Card className="mb-6 border-accent/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Calendar className="h-5 w-5" /> Test Schedule & Integrity Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          {testInfo ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
              <div>
                <div className="text-sm text-muted-foreground">Last Test</div>
                <div className="text-2xl font-mono font-bold mt-1">{testInfo.lastTest}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Next Due</div>
                <div className="text-2xl font-mono font-bold mt-1 text-accent">{testInfo.nextDue}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Days Remaining</div>
                <div className="flex items-center justify-center md:justify-start gap-2 mt-1">
                  <span className="text-3xl font-mono font-bold">{testInfo.daysRemaining}</span>
                  <Badge variant={testInfo.status === 'OVERDUE' ? "destructive" : testInfo.status === 'DUE SOON' ? "secondary" : "default"}>
                    {testInfo.status}
                  </Badge>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">No test history recorded yet.</p>
          )}
        </CardContent>
      </Card>

      {/* ==================== NEW: ACTIVE ALERTS ==================== */}
      {activeAlerts.length > 0 && (
        <Card className="mb-6 border-destructive/50">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Active Alerts ({activeAlerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {activeAlerts.map((alert) => (
              <div key={alert.id} className="p-4 bg-destructive/10 border-l-4 border-destructive rounded-lg">
                <p className="font-medium">{alert.message}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {alert.alert_type} • {new Date(alert.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="tech" className="w-full">
        {/* TabsList unchanged */}
        <TabsList className="w-full justify-start overflow-x-auto h-auto bg-secondary/60 p-1">
          <TabsTrigger value="tech" className="gap-1.5"><Info className="h-3.5 w-3.5" /> {t("techInfo")}</TabsTrigger>
          <TabsTrigger value="pdr" className="gap-1.5"><Package className="h-3.5 w-3.5" /> {t("pdr")}</TabsTrigger>
          <TabsTrigger value="tools" className="gap-1.5"><Wrench className="h-3.5 w-3.5" /> {t("toolPredictor")}</TabsTrigger>
          <TabsTrigger value="lifting" className="gap-1.5"><Anchor className="h-3.5 w-3.5" /> {t("lifting")}</TabsTrigger>
          <TabsTrigger value="insulation" className="gap-1.5"><Snowflake className="h-3.5 w-3.5" /> {t("insulation")}</TabsTrigger>
        </TabsList>

        <TabsContent value="tech" className="mt-5 space-y-5">
          <TechInfoTab eq={eq} />
        </TabsContent>

        {/* Rest of your TabsContent unchanged */}
        <TabsContent value="pdr" className="mt-5"><PdrTab parts={eq.spare_parts.items ?? []} tag={eq.tag} /></TabsContent>
        <TabsContent value="tools" className="mt-5">
          <ToolsTab boltSize={boltSize} wrench={wrench} tools={tools} liftingMethod={eq.maintenance.lifting_method} extraTools={eq.maintenance.tools} />
        </TabsContent>
        {/* ... lifting and insulation tabs unchanged ... */}
      </Tabs>

      {/* Existing Log Button */}
      <div className="mt-6 flex justify-end">
        <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2">
          <Link to={`/equipment/${encodeURIComponent(eq.tag)}/log`}>
            <ShieldCheck className="h-4 w-4" /> Log maintenance test
          </Link>
        </Button>
      </div>

      {/* Field Notes - unchanged */}
      {/* ... your existing notes section ... */}

      <div className="mt-6 space-y-5">
        <ImageGallery tag={eq.tag} />
        <MaintenanceTimeline tag={eq.tag} />
      </div>
    </div>
  );
}

/* ==================== ALL OTHER FUNCTIONS REMAIN UNCHANGED ==================== */
function TechInfoTab({ eq }: { eq: Equipment }) {
  // ... your original TechInfoTab code unchanged ...
  return (
    <>
      {/* ... existing content ... */}
      <TestDatesEditor tag={eq.tag} initialLast={eq.maintenance.last_tested} initialNext={eq.maintenance.next_test_due} />
    </>
  );
}

/* Keep PressureCell, TestDatesEditor, DatePickerField, Field, BigStat, EmptyState, PdrTab, ToolsTab exactly as they were in your file */
