import { CONTACT, EVENTS } from "@/data/weddingData";
import type { ResponseRow } from "@/lib/rsvpStore";

function firstName(name: string) {
  return name.trim().split(/\s+/)[0] || name;
}

function joinNames(names: string[]) {
  const firsts = names.map(firstName);
  if (firsts.length <= 1) return firsts[0] ?? "";
  if (firsts.length === 2) return `${firsts[0]} and ${firsts[1]}`;
  return `${firsts.slice(0, -1).join(", ")} and ${firsts.at(-1)}`;
}

function page(title: string, body: string, button?: { href: string; label: string }, extra?: string) {
  return `<!doctype html>
<html>
<body style="margin:0;background:#F3F0E8;color:#16282B;">
  <div style="max-width:480px;margin:0 auto;padding:48px 20px;font-family:Georgia,'Times New Roman',serif;">
    <h1 style="margin:0 0 24px;font-weight:300;font-size:40px;line-height:1.05;letter-spacing:-0.02em;">${title}</h1>
    <div style="font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.5;">${body}</div>
    ${button ? `<a href="${button.href}" style="display:block;margin-top:28px;background:#16282B;color:#F3F0E8;text-align:center;text-decoration:none;font-family:Arial,Helvetica,sans-serif;font-size:17px;font-weight:500;line-height:56px;">${button.label}</a>` : ""}
    ${extra ? `<p style="margin:20px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:15px;">${extra}</p>` : ""}
  </div>
</body>
</html>`;
}

async function deliver(to: string, subject: string, text: string, html: string) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;
  if (!key || !from) {
    console.log(`[rsvp email]\nTo: ${to}\nSubject: ${subject}\n${text}`);
    return;
  }
  const { Resend } = await import("resend");
  const resend = new Resend(key);
  const result = await resend.emails.send({ from, to, subject, text, html });
  if (result.error) throw new Error(result.error.message);
}

export async function sendRsvpEmail(row: ResponseRow, origin: string) {
  const names = joinNames(row.guests.length ? row.guests : [row.lead_name]);
  if (row.attending === "no") {
    const text = "Thank you, we'll miss you.";
    await deliver(row.email, "Thank you", text, page("Thank you, we'll miss you.", `<p style="margin:0;">${text}</p>`));
    return;
  }
  const lines = row.guests.map((name) => {
    const count = EVENTS.filter((event) => row.events[event.slug]?.includes(name)).length;
    const diet = row.dietary[name];
    const events = count === 0 ? "Not attending" : `${count} of ${EVENTS.length} events`;
    return `${firstName(name)}: ${events}${diet ? ` · ${diet}` : ""}`;
  });
  const flights = `${origin}/flights/${row.token}`;
  const edit = `${origin}/rsvp/edit/${row.token}`;
  const text = [`Thank you, ${names}.`, "", ...lines, "", `Add your flights: ${flights}`, `Change your reply: ${edit}`].join("\n");
  const html = page(
    `Thank you, ${names}.`,
    lines.map((line) => `<p style="margin:0 0 8px;">${line}</p>`).join(""),
    { href: flights, label: "Add your flights" },
    `<a href="${edit}" style="color:#16282B;">Change your reply</a>`,
  );
  await deliver(row.email, "You're coming", text, html);
}

export async function sendFlightReminder(row: ResponseRow, origin: string) {
  const url = `${origin}/flights/${row.token}`;
  const text = `Add your flights for Nicole & Scott's wedding: ${url}`;
  const html = page(
    "Your flights",
    `<p style="margin:0;">Add your flights for Nicole &amp; Scott's wedding.</p>`,
    { href: url, label: "Add your flights" },
    `Or email <a href="mailto:${CONTACT.email}" style="color:#16282B;">${CONTACT.person}</a>.`,
  );
  await deliver(row.email, "Your flights for Nicole & Scott's wedding", text, html);
}
