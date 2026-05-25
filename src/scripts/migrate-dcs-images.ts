// migrate-dcs-images.ts
// Run this script to download images from Google Drive and upload to Supabase Storage
// Usage: deno run --allow-net --allow-read --allow-write migrate-dcs-images.ts

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://gdkqetzkhgllwbpmqmux.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "your-service-role-key"; // Get from Supabase Dashboard → Project Settings → API → service_role key

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Map of panel IDs to their Google Drive IDs (from your current dcs_panels.ts)
const driveIds: Record<string, string> = {
  "general-train": "1iQjxrGDQmNsBiEYa-p4Eka6o91jc4V3",
  "liquefaction-1": "1S5Kz4g-u_JmUqedZUwhMZ3AFUcZsq5Wb",
  "liquefaction-2": "1gqGGdfzgn4P3cAHvatgpHkbvmeLIS66s",
  "mcr-1": "1MqVEqPzgwnFnAWixcB9dQJYqsBBoMewz",
  "mcr-2": "16-jYR0A_cEiTrIMyj7FxWY3bgM7-G3r2",
  "mcr-3": "1L70xNsbAwdVEtxuSSu-26qc8LNMlb8da",
  "propane-1": "1VDBIAuIPFMpJciRysH3mHQgI4ekXAUcL",
  "propane-2": "1Mfn71tgKTWKDes60E9K9gIKHNp8fWnko",
  "propane-3": "1llBWUC6JRbuyX-NaH4g5UUvDMS0JmiPh",
  "decarbonation-01": "1yGjd33Gw6lkS8wEzbyWwu4AgZBCsAxdc1",
  "decarbonation-2": "1pf4_y7xQNPidT4UO8OTOZ2rj9lTzupbj",
  "dehydration-1": "1IckhzaRS5hIGR-GYA8zAqjo-AHJSMwMt",
  "dehydration-2": "1yh5gAQtX71wMFonj1CRH-UfSQZixsAI6",
  "dehydration-3": "15Dt4V5VjmsszC3loQuCxftM4jjSThHoqAY",
  "scrubber": "1jGcSbG_6Lz7NJHufcTt8Q1QwQtJWU2SD",
  "demethanisation": "1Vf7j0oErkiyuj7CqVbDVdDKL0zevAr8k",
  "demethanisation-2": "1ujoMROHAioNA9pO_si3EA5LHBxJmx2su",
  "deethanisation": "1EY1EJOXvnXaL-jxMGwVBDiRWdp0rNil-",
  "depropanisation": "1HQIPVBNXgo2tYyeRnYYvEtSEJWTbX00c",
  "debutanisation": "1PB1heADPt eg5HzX24AdYatd-OXbRM98f",
  "fuel-gas": "1VS_X-cX_hLuxXhQKMEMbxKL1r3nFroee",
  "fuel-gas-1": "1AT09E3Ms6t0mIDp1h7h4Gv3x7d3lyBGu",
  "fuel-gas-oil-console": "1pdCPONMVJBMS102khxB6SrkHSwMjAPt3",
  "echangeur-recup-gpl": "15nKWgoHdmbHC8VIU6EkggaqrmOhvWOdE",
  "retour-condensat": "10PSTETdaNSFxQnPRVh_h19-w9ol99nxu",
  "op-data-t100": "1iujC-rgEHaVOikAnFnNDQkaY78pFyRVg",
  "op-data-t200": "14fc85LCC1CIo5a4_an6XGvFd_4EDEbC-",
  "op-data-t300": "18CcolGOL-ZEqkUdj-PDE6fP0weWZGNMi",
  "op-data-t500": "1nINTgtgIwfoi--3n77jDVY4Y8AySSnkA",
  "op-data-t600": "1Gdd6MKtg8tiPvin8bqkCc3GzEq9AyyE2",
};

async function migrate() {
  for (const [panelId, driveId] of Object.entries(driveIds)) {
    try {
      // Download from Google Drive
      const imageUrl = `https://lh3.googleusercontent.com/d/${driveId}=w1600`;
      console.log(`Downloading ${panelId}...`);

      const response = await fetch(imageUrl, { redirect: "follow" });
      if (!response.ok) {
        console.error(`Failed to download ${panelId}: ${response.status}`);
        continue;
      }

      const blob = await response.blob();
      const fileName = `${panelId}.jpg`;
      const filePath = `dcs/${fileName}`;

      // Upload to Supabase Storage
      console.log(`Uploading ${panelId} to Supabase...`);
      const { data, error } = await supabase.storage
        .from("equipment-images")
        .upload(filePath, blob, {
          contentType: "image/jpeg",
          upsert: true,
        });

      if (error) {
        console.error(`Upload failed for ${panelId}:`, error.message);
      } else {
        console.log(`✅ ${panelId} uploaded successfully!`);
        console.log(`   Public URL: ${SUPABASE_URL}/storage/v1/object/public/equipment-images/${filePath}`);
      }
    } catch (err) {
      console.error(`Error processing ${panelId}:`, err);
    }
  }

  console.log("\nMigration complete!");
}

migrate();
