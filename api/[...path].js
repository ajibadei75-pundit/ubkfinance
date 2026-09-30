import { handle } from "../server/core.mjs";
import { pickDb } from "../server/db.mjs";

export default async function handler(req, res) {
  let body = req.body;
  if (body === undefined) {
    const chunks = [];
    for await (const c of req) chunks.push(c);
    body = Buffer.concat(chunks).toString();
  }
  if (typeof body === "string") { try { body = JSON.parse(body || "{}"); } catch { body = {}; } }
  const u = new URL(req.url, "http://localhost");
  const r = await handle({ method: req.method, path: u.pathname.replace(/\/$/, ""), search: u.searchParams, auth: req.headers.authorization || "", body: body || {}, db: pickDb() });
  res.setHeader("cache-control", "no-store");
  res.status(r.status).json(r.body);
}
