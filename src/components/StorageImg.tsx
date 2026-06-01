import { useState, useEffect, type ImgHTMLAttributes } from "react";
import { Cpu } from "lucide-react";

interface StorageImgProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "onError"> {
  storagePath: string;
  alt: string;
  fallbackClassName?: string;
}

/**
 * Resilient image loader.
 * 1. Try Supabase Storage public URL (bucket: equipment-images)
 * 2. Fall back to /images/<basename> in the public folder
 * 3. Show a Cpu icon if both fail
 *
 * NOTE: The equipment-images bucket lives on a different Supabase project
 * (gdkqetzkhgllwbpmqmux) than the app's auth/db project — that's intentional
 * and matches where the user uploaded the screenshots.
 */
const STORAGE_PROJECT = "https://gdkqetzkhgllwbpmqmux.supabase.co";
const BUCKET = "equipment-images";

const encodePath = (p: string) =>
  p.split("/").map(encodeURIComponent).join("/");

export function StorageImg({
  storagePath,
  alt,
  fallbackClassName,
  className,
  ...rest
}: StorageImgProps) {
  const primary = `${STORAGE_PROJECT}/storage/v1/object/public/${BUCKET}/${encodePath(storagePath)}`;
  const basename = storagePath.split("/").pop() ?? storagePath;
  const fallback = `/images/${encodeURIComponent(basename)}`;

  const [src, setSrc] = useState(primary);
  const [stage, setStage] = useState<"primary" | "fallback" | "failed">("primary");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setSrc(primary);
    setStage("primary");
    setLoaded(false);
  }, [primary]);

  const handleError = () => {
    if (stage === "primary") {
      setSrc(fallback);
      setStage("fallback");
    } else {
      setStage("failed");
    }
  };

  if (stage === "failed") {
    return (
      <div
        className={
          fallbackClassName ??
          `flex flex-col items-center justify-center gap-2 text-white/30 bg-muted ${className ?? ""}`
        }
      >
        <Cpu className="h-8 w-8" />
        <span className="text-[10px] font-mono uppercase tracking-widest">DCS Screen</span>
        <span className="text-[10px] text-white/20">Image unavailable</span>
      </div>
    );
  }

  return (
    <>
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <Cpu className="h-6 w-6 text-white/20 animate-pulse" />
        </div>
      )}
      <img
        key={src}
        src={src}
        alt={alt}
        loading="lazy"
        referrerPolicy="no-referrer"
        className={className}
        onLoad={() => setLoaded(true)}
        onError={handleError}
        {...rest}
      />
    </>
  );
}
