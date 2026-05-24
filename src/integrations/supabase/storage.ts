const BASE = "https://gdkqetzkhgllwbpmqmux.supabase.co/storage/v1/object/public/equipment-images";

export const storageUrls = {
  qr:  (id: string) => `https://gdkqetzkhgllwbpmqmux.supabase.co/functions/v1/qr-generator?id=${encodeURIComponent(id)}&format=png`,
  pid: (id: string) => `${BASE}/equipment/${encodeURIComponent(id.replace(/^X\d+-/, ""))}.pdf`,
  dcs: (f: string)  => `${BASE}/dcs/${encodeURIComponent(f)}`,
};
