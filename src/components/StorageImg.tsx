import { useState, useEffect, type ImgHTMLAttributes } from "react";
import { Cpu } from "lucide-react";

interface StorageImgProps
  extends Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "onError"> {
  storagePath: string;
  alt: string;
  fallbackClassName?: string;
}

export function StorageImg({
  storagePath,
  alt,
  fallbackClassName,
  className,
  ...rest
}: StorageImgProps) {
  // 1. Get the Supabase URL from Vite environment variables
  const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
  
  // 2. State to handle image loading errors
  const [error, setError] = useState(false);

  // 3. Construct the public URL for the asset
  // Assumes your bucket name is 'images' (change if necessary)
  const imageUrl = `${SUPABASE_URL}/storage/v1/object/public/images/${storagePath}`;

  // Reset error state if the path changes
  useEffect(() => {
    setError(false);
  }, [storagePath]);

  // 4. Render fallback icon if the URL is missing or image fails to load
  if (!SUPABASE_URL || error) {
    return (
      <div className={`flex items-center justify-center bg-muted text-muted-foreground ${className} ${fallbackClassName}`}>
        <Cpu className="h-1/2 w-1/2 max-h-8 max-w-8 animate-pulse" />
      </div>
    );
  }

  // 5. Render the actual image
  return (
    <img
      src={imageUrl}
      alt={alt}
      className={className}
      onError={() => setError(true)}
      {...rest}
    />
  );
}
