import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ShieldAlert, Camera, MapPin, Plus, X, ChevronDown, ChevronUp,
  ZoomIn, Pencil, Trash2, CheckCircle, AlertTriangle
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

const ALERT_TYPES = [
  { value: "accident", label: "Accident", color: "bg-red-600" },
  { value: "almost_accident", label: "Almost Accident / Near Miss", color: "bg-orange-500" },
  { value: "leakage", label: "Leakage", color: "bg-blue-500" },
  { value: "dangerous", label: "Dangerous Situation", color: "bg-purple-600" },
  { value: "fire", label: "Fire / Explosion Risk", color: "bg-rose-700" },
  { value: "equipment_failure", label: "Equipment Failure", color: "bg-amber-600" },
  { value: "safety_violation", label: "Safety Violation", color: "bg-yellow-600" },
  { value: "other", label: "Other", color: "bg-gray-500" },
] as const;

const PRIORITIES = [
  { value: "P1", label: "P1 — Critical", color: "bg-red-600" },
  { value: "P2", label: "P2 — High", color: "bg-orange-500" },
  { value: "P3", label: "P3 — Medium", color: "bg-yellow-500" },
] as const;

const TRAINS = ["T100", "T200", "T300", "T400", "T500", "T600"] as const;

// Sonatrach GL1Z HSE contact info from the uploaded photo
const SONATRACH_HSE = {
  title: "Presque accident / situation dangereuse",
  titleAr: "شبه حادث / حالة خطرة",
  titleEn: "Near miss / Dangerous situation",
  phones: ["5177", "5999", "5542"],
  instruction: "If you see a dangerous act, incident, near miss or dangerous situation, fill out a card and place it in the suggestion box.",
  instructionFr: "Si vous voyez un acte dangereux, un incident, un presque accident ou une situation dangereuse, remplissez une carte et placez-la dans la boîte à suggestions.",
  instructionAr: "إذا رأيت عملا خطيرا، حادثا، شبه حادث أو موقفا خطيرا، قم بملء البطاقة وضعها في صندوق الاقتراحات",
  urgent: "If urgent action is required, please inform the control post chief immediately or call",
};

interface FastAlert {
  id: string;
  alert_type: string;
  priority: string;
  location: string;
  description: string;
  photo_url: string | null;
  created_at: string;
  status: string;
}

export function FastAlertDashboardWidget() {
  const [alerts, setAlerts] = useState<FastAlert[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);

  // Zoom modal
  const [zoomPhoto, setZoomPhoto] = useState<string | null>(null);

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editType, setEditType] = useState("");
  const [editPriority, setEditPriority] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editCustomLocation, setEditCustomLocation] = useState("");
  const [editDescription, setEditDescription] = useState("");

  // Form state
  const [alertType, setAlertType] = useState("");
  const [priority, setPriority] = useState("");
  const [location, setLocation] = useState("");
  const [customLocation, setCustomLocation] = useState("");
  const [description, setDescription] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadAlerts();
  }, []);

  async function loadAlerts() {
    const { data, error } = await supabase
      .from("fast_alerts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);
    if (!error && data) setAlerts(data as FastAlert[]);
  }

  // Convert HEIC to JPEG before upload
  async function convertHeicToJpeg(file: File): Promise<File> {
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (ext === "heic" || ext === "heif") {
      // For HEIC, we'll rename with .jpg extension
      // In production, use heic2any library
      const newName = file.name.replace(/\.heic$/i, ".jpg").replace(/\.heif$/i, ".jpg");
      return new File([file], newName, { type: "image/jpeg" });
    }
    return file;
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    if (file) {
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  }

  async function submitAlert() {
    const finalLocation = location === "other" ? customLocation.trim() : location;
    if (!alertType || !priority || !finalLocation || !description.trim()) {
      toast({ title: "Please fill all required fields", variant: "destructive" });
      return;
    }

    setSubmitting(true);

    let photoUrl: string | null = null;

    if (photo) {
      const converted = await convertHeicToJpeg(photo);
      const fileExt = converted.name.split(".").pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).slice(2)}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("alert-photos")
        .upload(fileName, converted);

      if (!uploadError && uploadData) {
        const { data: urlData } = supabase.storage
          .from("alert-photos")
          .getPublicUrl(fileName);
        photoUrl = urlData?.publicUrl ?? null;
      }
    }

    const { error } = await supabase.from("fast_alerts").insert({
      alert_type: alertType,
      priority: priority,
      location: finalLocation,
      description: description.trim(),
      photo_url: photoUrl,
      status: "OPEN",
    });

    setSubmitting(false);

    if (error) {
      toast({ title: "Failed to submit alert", description: error.message, variant: "destructive" });
      return;
    }

    toast({ title: "Alert submitted successfully" });
    setShowForm(false);
    resetForm();
    loadAlerts();
  }

  function resetForm() {
    setAlertType("");
    setPriority("");
    setLocation("");
    setCustomLocation("");
    setDescription("");
    setPhoto(null);
    setPhotoPreview(null);
  }

  // Edit alert
  function startEdit(alert: FastAlert) {
    setEditingId(alert.id);
    setEditType(alert.alert_type);
    setEditPriority(alert.priority);
    setEditLocation(TRAINS.includes(alert.location as any) ? alert.location : "other");
    setEditCustomLocation(TRAINS.includes(alert.location as any) ? "" : alert.location);
    setEditDescription(alert.description);
  }

  async function saveEdit() {
    if (!editingId || !editType || !editPriority) return;
    const finalLocation = editLocation === "other" ? editCustomLocation.trim() : editLocation;

    const { error } = await supabase
      .from("fast_alerts")
      .update({
        alert_type: editType,
        priority: editPriority,
        location: finalLocation,
        description: editDescription.trim(),
      })
      .eq("id", editingId);

    if (error) {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
      return;
    }

    toast({ title: "Alert updated" });
    setEditingId(null);
    loadAlerts();
  }

  // Delete alert
  async function deleteAlert(id: string) {
    if (!confirm("Delete this alert?")) return;
    const { error } = await supabase.from("fast_alerts").delete().eq("id", id);
    if (error) {
      toast({ title: "Delete failed", description: error.message, variant: "destructive" });
      return;
    }
    setAlerts((prev) => prev.filter((a) => a.id !== id));
    toast({ title: "Alert deleted" });
  }

  // Close (cloture) alert
  async function closeAlert(id: string) {
    const { error } = await supabase
      .from("fast_alerts")
      .update({ status: "CLOSED" })
      .eq("id", id);
    if (error) {
      toast({ title: "Close failed", description: error.message, variant: "destructive" });
      return;
    }
    setAlerts((prev) => prev.map((a) => a.id === id ? { ...a, status: "CLOSED" } : a));
    toast({ title: "Alert closed" });
  }

  const typeInfo = (type: string) => ALERT_TYPES.find((t) => t.value === type);
  const priorityInfo = (p: string) => PRIORITIES.find((pr) => pr.value === p);

  const openAlerts = alerts.filter((a) => a.status === "OPEN");
  const displayAlerts = expanded ? openAlerts : openAlerts.slice(0, 3);
  const hiddenCount = openAlerts.length - 3;

  return (
    <>
      <Card className="border-border">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-red-500" />
            <CardTitle className="text-lg font-display">Fast Alerts</CardTitle>
            {openAlerts.length > 0 && (
              <Badge variant="secondary" className="text-xs">{openAlerts.length} open</Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-1"
              onClick={() => setShowForm(!showForm)}
            >
              {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {showForm ? "Cancel" : "Report Alert"}
            </Button>
            <Button asChild variant="ghost" size="sm" className="gap-1">
              <Link to="/alerts">Alert Center →</Link>
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Sonatrach HSE Info Banner */}
          <div className="border border-red-200 bg-red-50 rounded-lg p-3 space-y-1">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <span className="text-sm font-semibold text-red-800">{SONATRACH_HSE.title}</span>
            </div>
            <div className="text-xs text-red-700">{SONATRACH_HSE.titleEn}</div>
            <div className="flex items-center gap-2 text-xs font-mono text-red-800 font-bold">
              {SONATRACH_HSE.phones.join(" / ")}
            </div>
          </div>

          {/* Submit Form */}
          {showForm && (
            <div className="border border-border rounded-lg p-4 space-y-3 bg-secondary/20">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Alert Type *</label>
                  <select value={alertType} onChange={(e) => setAlertType(e.target.value)} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                    <option value="">Select type...</option>
                    {ALERT_TYPES.map((t) => (<option key={t.value} value={t.value}>{t.label}</option>))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Priority *</label>
                  <select value={priority} onChange={(e) => setPriority(e.target.value)} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                    <option value="">Select priority...</option>
                    {PRIORITIES.map((p) => (<option key={p.value} value={p.value}>{p.label}</option>))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Location *</label>
                  <select value={location} onChange={(e) => setLocation(e.target.value)} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                    <option value="">Select location...</option>
                    {TRAINS.map((t) => (<option key={t} value={t}>{t}</option>))}
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              {location === "other" && (
                <Input value={customLocation} onChange={(e) => setCustomLocation(e.target.value)} placeholder="Enter location..." />
              )}
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the alert..." rows={3} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none" />
              <div className="flex items-center gap-3">
                <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 border border-dashed border-border rounded-lg hover:bg-secondary text-sm">
                  <Camera className="h-4 w-4" />
                  {photo ? photo.name : "Choose photo..."}
                  <input type="file" accept="image/*,.heic,.heif" className="hidden" onChange={handlePhotoChange} />
                </label>
                {photoPreview && <img src={photoPreview} alt="Preview" className="h-16 w-16 object-cover rounded border border-border" />}
              </div>
              <Button onClick={submitAlert} disabled={submitting} className="w-full bg-red-600 hover:bg-red-700 text-white">
                {submitting ? "Submitting..." : "Submit Alert"}
              </Button>
            </div>
          )}

          {/* Alerts List — Show only last 3, expand for rest */}
          <div className="space-y-2">
            {openAlerts.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground text-sm border border-dashed border-border rounded-lg">
                <ShieldAlert className="h-8 w-8 mx-auto mb-2 opacity-40" />
                No alerts reported.
              </div>
            ) : (
              <>
                {displayAlerts.map((alert) => {
                  const type = typeInfo(alert.alert_type);
                  const pri = priorityInfo(alert.priority);
                  const isEditing = editingId === alert.id;

                  return (
                    <div key={alert.id} className="border border-border rounded-lg p-3">
                      {isEditing ? (
                        /* Edit Mode */
                        <div className="space-y-2">
                          <div className="grid grid-cols-3 gap-2">
                            <select value={editType} onChange={(e) => setEditType(e.target.value)} className="h-9 rounded border px-2 text-xs">
                              {ALERT_TYPES.map((t) => (<option key={t.value} value={t.value}>{t.label}</option>))}
                            </select>
                            <select value={editPriority} onChange={(e) => setEditPriority(e.target.value)} className="h-9 rounded border px-2 text-xs">
                              {PRIORITIES.map((p) => (<option key={p.value} value={p.value}>{p.label}</option>))}
                            </select>
                            <select value={editLocation} onChange={(e) => setEditLocation(e.target.value)} className="h-9 rounded border px-2 text-xs">
                              {TRAINS.map((t) => (<option key={t} value={t}>{t}</option>))}
                              <option value="other">Other</option>
                            </select>
                          </div>
                          {editLocation === "other" && (
                            <Input value={editCustomLocation} onChange={(e) => setEditCustomLocation(e.target.value)} placeholder="Location..." className="h-9 text-xs" />
                          )}
                          <textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} rows={2} className="w-full rounded border px-2 py-1 text-xs resize-none" />
                          <div className="flex gap-2">
                            <Button size="sm" onClick={saveEdit} className="h-8 text-xs">Save</Button>
                            <Button size="sm" variant="ghost" onClick={() => setEditingId(null)} className="h-8 text-xs">Cancel</Button>
                          </div>
                        </div>
                      ) : (
                        /* View Mode */
                        <div className="flex gap-3 items-start">
                          <div className="shrink-0">
                            <Badge className={`${type?.color ?? "bg-gray-500"} text-white border-0`}>{type?.label ?? alert.alert_type}</Badge>
                            <Badge className={`${pri?.color ?? "bg-gray-500"} text-white border-0 mt-1 block text-center`}>{pri?.label ?? alert.priority}</Badge>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                              <MapPin className="h-3 w-3" />{alert.location}
                              <span className="text-border">|</span>
                              {new Date(alert.created_at).toLocaleDateString()}
                            </div>
                            <p className="text-sm text-foreground break-words">{alert.description}</p>
                          </div>
                          {alert.photo_url && (
                            <button onClick={() => setZoomPhoto(alert.photo_url)} className="shrink-0 relative group">
                              <img src={alert.photo_url} alt="" className="h-14 w-14 object-cover rounded border border-border" />
                              <div className="absolute inset-0 bg-black/40 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <ZoomIn className="h-4 w-4 text-white" />
                              </div>
                            </button>
                          )}
                          <div className="shrink-0 flex flex-col gap-1">
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => startEdit(alert)}><Pencil className="h-3 w-3" /></Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-emerald-600" onClick={() => closeAlert(alert.id)}><CheckCircle className="h-3 w-3" /></Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteAlert(alert.id)}><Trash2 className="h-3 w-3" /></Button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Show More / Less toggle */}
                {openAlerts.length > 3 && (
                  <Button variant="ghost" size="sm" className="w-full gap-1 text-muted-foreground" onClick={() => setExpanded((e) => !e)}>
                    {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    {expanded ? "Show less" : `Show ${hiddenCount} more`}
                  </Button>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Full-screen Zoom Modal */}
      {zoomPhoto && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={() => setZoomPhoto(null)}>
          <button className="absolute top-4 right-4 text-white hover:text-gray-300" onClick={() => setZoomPhoto(null)}>
            <X className="h-8 w-8" />
          </button>
          <img src={zoomPhoto} alt="Full size" className="max-w-full max-h-full object-contain rounded-lg" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </>
  );
          }
