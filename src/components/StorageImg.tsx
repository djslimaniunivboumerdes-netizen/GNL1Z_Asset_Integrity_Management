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
  const SUPABASE_URL
