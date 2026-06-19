import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Camera, MapPin, FileText, Plus, ShieldAlert, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const ALERT_TYPES = [
  { value: "accident", label: "Accident", color: "bg-red-500" },
  { value: "almost_accident", label: "Almost Accident", color: "bg-orange-500" },
  { value: "leakage", label: "Leakage", color: "bg-blue-500" },
  { value: "dangerous", label: "Dangerous Condition", color: "bg-purple-500" },
  { value: "fire", label: "Fire / Explosion Risk", color: "bg-rose-600" },
  { value: "equipment_failure", label: "Equipment Failure", color: "bg-amber-500" },
  { value: "safety_violation", label: "Safety Violation", color: "bg-yellow-500" },
  { value: "other", label: "Other", color: "bg-gray-500" },
] as const;

const TRAINS = ["T100", "T200", "T300", "T400", "T500", "T600"] as const;

interface FastAlert {
  id: string;
  alert_type: string;
  location: string;
  description: string;
  photo_url: string | null;
  created_at: string;
  created_by?: string;
}

export function FastAlertDashboardWidget() {
  const [alerts, setAlerts] = useState<FastAlert[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form state
  const [alertType, setAlertType] = useState("");
  const [location, setLocation] = useState("");
  const [customLocation, setCustomLocation] = useState("");
  const [description, setDescription] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  useEffect(() => {
    loadAlerts();
  }, []);

  async function loadAlerts() {
    const { data, error } = await supabase
      .from("fast_alerts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10);
    if (!error && data) setAlerts(data as FastAlert[]);
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
    if (!alertType || !finalLocation || !description.trim()) {
      toast({ title: "Please fill all required fields", variant: "destructive" });
      return;
    }

    setLoading(true);

    let photoUrl: string | null = null;

    // Upload photo if present
    if (photo) {
      const fileExt = photo.name.split(".").pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).slice(2)}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("alert-photos")
        .upload(fileName, photo);

      if (!uploadError && uploadData) {
        const { data: urlData } = supabase.storage
          .from("alert-photos")
          .getPublicUrl(fileName);
        photoUrl = urlData?.publicUrl ?? null;
      }
    }

    const { error } = await supabase.from("fast_alerts").insert({
      alert_type: alertType,
      location: finalLocation,
      description: description.trim(),
      photo_url: photoUrl,
    });

    setLoading(false);

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
    setLocation("");
    setCustomLocation("");
    setDescription("");
    setPhoto(null);
    setPhotoPreview(null);
  }

  const typeInfo = (type: string) => ALERT_TYPES.find((t) => t.value === type);

  return (
    <Card className="border-border">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 text-red-500" />
          <CardTitle className="text-lg font-display">Fast Alerts</CardTitle>
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
            <Link to="/alerts">
              Alert Center →
            </Link>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* ── Submit Form ── */}
        {showForm && (
          <div className="border border-border rounded-lg p-4 space-y-3 bg-secondary/20">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Alert Type */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Alert Type *</label>
                <select
                  value={alertType}
                  onChange={(e) => setAlertType(e.target.value)}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="">Select type...</option>
                  {ALERT_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              {/* Location */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Location *</label>
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="">Select location...</option>
                  {TRAINS.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                  <option value="other">Other (specify)</option>
                </select>
              </div>
            </div>

            {/* Custom Location */}
            {location === "other" && (
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Custom Location *</label>
                <Input
                  value={customLocation}
                  onChange={(e) => setCustomLocation(e.target.value)}
                  placeholder="Enter location..."
                />
              </div>
            )}

            {/* Description */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Description *</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the alert in detail..."
                rows={3}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            {/* Photo Upload */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Photo</label>
              <div className="flex items-center gap-3">
                <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 border border-dashed border-border rounded-lg hover:bg-secondary transition-colors text-sm">
                  <Camera className="h-4 w-4" />
                  {photo ? photo.name : "Choose photo..."}
                  <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                </label>
                {photoPreview && (
                  <img src={photoPreview} alt="Preview" className="h-16 w-16 object-cover rounded border border-border" />
                )}
              </div>
            </div>

            <Button
              onClick={submitAlert}
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 text-white"
            >
              {loading ? "Submitting..." : "Submit Alert"}
            </Button>
          </div>
        )}

        {/* ── Recent Alerts List ── */}
        <div className="space-y-2">
          {alerts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm border border-dashed border-border rounded-lg">
              <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-40" />
              No alerts reported yet.
            </div>
          ) : (
            alerts.map((alert) => {
              const type = typeInfo(alert.alert_type);
              return (
                <div
                  key={alert.id}
                  className="border border-border rounded-lg p-3 flex gap-3 items-start hover:bg-secondary/30 transition-colors"
                >
                  {/* Type Badge */}
                  <div className="shrink-0">
                    <Badge className={`${type?.color ?? "bg-gray-500"} text-white border-0`}>
                      {type?.label ?? alert.alert_type}
                    </Badge>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                      <MapPin className="h-3 w-3" />
                      {alert.location}
                      <span className="text-border">|</span>
                      {new Date(alert.created_at).toLocaleDateString()}
                    </div>
                    <p className="text-sm text-foreground break-words">{alert.description}</p>
                  </div>

                  {/* Photo Thumbnail */}
                  {alert.photo_url && (
                    <img
                      src={alert.photo_url}
                      alt="Alert"
                      className="h-14 w-14 object-cover rounded border border-border shrink-0"
                    />
                  )}
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
