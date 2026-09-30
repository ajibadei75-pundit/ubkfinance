import { getStore, getDeployStore } from "@netlify/blobs";
import { handle } from "../../server/core.mjs";
import { supabaseDb } from "../../server/supabase.mjs";

export default async (req) => {
  const s = Netlify.context?.deploy?.context === "production"
    ? getStore({ name: "ubk", consistency: "strong" })
    : getDeployStore({ name: "ubk", consistency: "strong" });
  const db = supabaseDb() || { seed: process.env.AUTH_SECRET || "", get: (k) => s.get(k, { type: "json" }), set: (k, v) => s.setJSON(k, v), del: (k) => s.delete(k) };
  const u = new URL(req.url);
  const body = req.method === "GET" || req.method === "DELETE" ? {} : await req.json().catch(() => ({}));
  const r = await handle({ method: req.method, path: u.pathname.replace(/\/$/, ""), search: u.searchParams, auth: req.headers.get("authorization") || "", body, db });
  return new Response(JSON.stringify(r.body), { status: r.status, headers: { "content-type": "application/json", "cache-control": "no-store" } });
};
export const config = { path: "/api/*" };
