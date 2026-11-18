import { readFileSync } from "fs";
import { listAccepted } from "../src/lib/rsvpStore";

function loadEnv() {
  try {
    for (const line of readFileSync(".env.local", "utf8").split("\n")) {
      const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
      if (match && process.env[match[1]] == null) process.env[match[1]] = match[2];
    }
  } catch {
    // SITE_URL and sheet credentials can also come from the shell.
  }
}

function cell(value: string) {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

loadEnv();

async function main() {
  const origin = (process.env.SITE_URL || "http://localhost:3456").replace(/\/$/, "");
  const rows = await listAccepted({ missingFlightsOnly: !process.argv.includes("--all") });
  console.log(["lead_name", "email", "whatsapp", "flights_link", "whatsapp_link"].join(","));
  for (const row of rows) {
    const link = `${origin}/flights/${row.token}`;
    const digits = row.whatsapp.replace(/\D/g, "");
    const text = encodeURIComponent(`Add your flights for Nicole & Scott: ${link}`);
    const chat = digits ? `https://wa.me/${digits}?text=${text}` : "";
    console.log([row.lead_name, row.email, row.whatsapp, link, chat].map(cell).join(","));
  }
}

main();
