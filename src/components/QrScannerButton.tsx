import { useState, useRef, useCallback, useMemo } from "react";
import { ScanLine, X, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Fuse from "fuse.js";
import { getAllEquipmentTags } from "@/data";

interface QrScannerButtonProps {
  onScan: (value: string) => void;
}

export function QrScannerButton({ onScan }: QrScannerButtonProps) {
  const [open, setOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number>(0);
  const [manualInput, setManualInput] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // Build fuse index for equipment tags — fuzzy match on tag + name
  const fuse = useMemo(() => {
    const tags = getAllEquipmentTags();
    return new Fuse(tags, {
      threshold: 0.35,
      distance: 100,
      includeScore: false,
    });
  }, []);

  const handleInputChange = (value: string) => {
    setManualInput(value);
    if (value.trim().length >= 2) {
      const results = fuse.search(value, { limit: 8 });
      setSuggestions(results.map((r) => r.item));
    } else {
      setSuggestions([]);
    }
  };

  const handleSelect = (tag: string) => {
    onScan(tag);
    handleClose();
  };

  const stopCamera = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  const startScan = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      const scan = () => {
        if (!videoRef.current || !open) return;
        rafRef.current = requestAnimationFrame(scan);
      };
      rafRef.current = requestAnimationFrame(scan);
    } catch {
      // Fallback: let user type
    }
  }, [open]);

  const handleOpen = () => {
    setOpen(true);
    setSuggestions([]);
    setTimeout(startScan, 300);
  };

  const handleClose = () => {
    stopCamera();
    setOpen(false);
    setManualInput("");
    setSuggestions([]);
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleOpen}
        aria-label="Scan QR"
        title="Scan QR"
      >
        <ScanLine className="h-4 w-4" />
      </Button>

      <Dialog
        open={open}
        onOpenChange={(v) => {
          if (!v) handleClose();
        }}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-sm">Scan Equipment QR</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="relative aspect-square bg-black rounded-lg overflow-hidden border border-border">
              <video
                ref={videoRef}
                className="absolute inset-0 w-full h-full object-cover"
                muted
                playsInline
              />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-32 h-32 border-2 border-accent/60 rounded-lg" />
              </div>
            </div>

            {/* Fuzzy search with suggestions */}
            <div className="relative">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                  <input
                    value={manualInput}
                    onChange={(e) => handleInputChange(e.target.value)}
                    placeholder="Or type tag / ID…"
                    className="flex-1 h-9 w-full rounded-md border border-input bg-background px-3 pl-8 text-sm focus:outline-none focus:ring-1 focus:ring-accent"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && manualInput) {
                        onScan(manualInput);
                        handleClose();
                      }
                    }}
                  />
                </div>
                <Button
                  size="sm"
                  onClick={() => {
                    if (manualInput) {
                      onScan(manualInput);
                      handleClose();
                    }
                  }}
                >
                  Go
                </Button>
              </div>

              {/* Suggestions dropdown */}
              {suggestions.length > 0 && (
                <div className="absolute z-50 mt-1 w-full rounded-md border border-border bg-popover shadow-md max-h-48 overflow-y-auto">
                  {suggestions.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => handleSelect(tag)}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                    >
                      <span className="font-mono text-xs text-accent">{tag}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              className="w-full gap-1"
              onClick={handleClose}
            >
              <X className="h-4 w-4" /> Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
