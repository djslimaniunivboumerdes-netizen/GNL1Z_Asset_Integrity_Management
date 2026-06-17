import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Fuse from "fuse.js";
import { format, parseISO } from "date-fns";
import {
  ArrowLeft, Copy, Check, Download, Wrench, Anchor, Snowflake,
  Package, Info, Search, FileText, Save, CalendarIcon,
  ExternalLink, QrCode, X, ShieldCheck
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

import {
  getEquipmentByTag,
  isShellAndTube,
  type SparePart,
  type Equipment
} from "@/data";

import {
  predictWrench,
  predictToolKit,
  suggestShackle,
  safetyLoadKg,
  insulationRecommendation,
  exportToCsv,
  defaultBoltForType,
  recommendCrane,
} from "@/lib/industrial";

import { useI18n } from "@/contexts/I18nContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

import { SvgQr } from "@/components/SvgQr";
import { ImageGallery } from "@/components/ImageGallery";
import { MaintenanceTimeline } from "@/components/MaintenanceTimeline";
import NotFound from "./NotFound";

export default function EquipmentDetail() {
  const { tag = "" } = useParams();
  const { t, lang } = useI18n();
  const eq = getEquipmentByTag(decodeURIComponent(tag));

  const [qrOpen, setQrOpen] = useState(false);

  // 🧠 MULTIPLE NOTES STATE
  const [notes, setNotes] = useState<any[]>([]);
  const [newNote, setNewNote] = useState("");
  const [savingNote, setSavingNote] = useState(false);

  if (!eq) return <NotFound />;

  const boltSize = defaultBoltForType(eq.type.code);
  const wrench = predictWrench(boltSize);
  const tools = predictToolKit(boltSize);
  const shackle = suggestShackle(eq.technical.weight_kg);
  const safety = safetyLoadKg(eq.technical.weight_kg);
  const insulation = insulationRecommendation(eq.type.code, eq.technical.temperature_c);
  const crane = recommendCrane(eq.technical.weight_kg);

  const pageUrl = `${window.location.origin}/equipment/${encodeURIComponent(eq.tag)}`;

  // ───────────────────────────────
  // LOAD NOTES
  // ───────────────────────────────
  useEffect(() => {
    let active = true;

    (async () => {
      const { data } = await supabase
        .from("equipment_notes")
        .select("*")
        .eq("tag", eq.tag)
        .order("created_at", { ascending: false });

      if (active) setNotes(data ?? []);
    })();

    return () => {
      active = false;
    };
  }, [eq.tag]);

  // ───────────────────────────────
  // ADD NOTE
  // ───────────────────────────────
  const addNote = async () => {
    if (!newNote.trim()) return;

    setSavingNote(true);

    const { error } = await supabase.from("equipment_notes").insert({
      tag: eq.tag,
      note: newNote.trim(),
    });

    setSavingNote(false);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
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

  // ───────────────────────────────
  // DELETE NOTE
  // ───────────────────────────────
  const deleteNote = async (id: string) => {
    const { error } = await supabase
      .from("equipment_notes")
      .delete()
      .eq("id", id);

    if (error) {
      toast({
        title: "Delete failed",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    setNotes(notes.filter((n) => n.id !== id));
  };

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-7xl mx-auto">

      {/* BACK */}
      <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2">
        <Link to="/equipment">
          <ArrowLeft className="h-4 w-4 mr-1" /> {t("back")}
        </Link>
      </Button>

      {/* HEADER */}
      <div className="border rounded-lg bg-card p-6 mb-6">
        <h1 className="text-3xl font-display font-bold">{eq.tag}</h1>
        <p className="text-muted-foreground">{eq.name}</p>

        {eq.notes && (
          <p className="mt-2 text-sm italic text-muted-foreground">
            {eq.notes}
          </p>
        )}
      </div>

      {/* NOTES SECTION (NEW MULTI NOTES UI) */}
      <div className="border border-border rounded-lg bg-card p-5 mb-6">
        <h3 className="font-display font-semibold mb-3">Field Notes</h3>

        {/* input */}
        <div className="flex gap-2 mb-4">
          <Input
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Add a new note..."
          />
          <Button onClick={addNote} disabled={savingNote}>
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
        </div>

        {/* list */}
        <div className="space-y-2">
          {notes.length === 0 ? (
            <p className="text-sm text-muted-foreground">No notes yet.</p>
          ) : (
            notes.map((n) => (
              <div
                key={n.id}
                className="border rounded p-3 flex justify-between items-start"
              >
                <div>
                  <p className="text-sm">{n.note}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(n.created_at).toLocaleString()}
                  </p>
                </div>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => deleteNote(n.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* IMAGE + TIMELINE */}
      <ImageGallery tag={eq.tag} />
      <MaintenanceTimeline tag={eq.tag} />
    </div>
  );
}
