// Supabase backend. The URL and anon key are public by design; the data is locked
// behind secret-checked SQL functions, so UBK_DB_SECRET is what protects it.
const URL0 = (process.env.SUPABASE_URL || "https://aufhvlhktvxxchheukly.supabase.co").replace(/\/$/, "");
const KEY = process.env.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1Zmh2bGhrdHZ4eGNoaGV1a2x5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA0ODIyMjcsImV4cCI6MjEwNjA1ODIyN30.uWaIfRMxXCDnZmlFpRf1CV0KU6A7yksltspiKzuKP4M";

export function supabaseDb() {
  const secret = process.env.UBK_DB_SECRET;
  if (!secret) return null;
  const headers = { apikey: KEY, "content-type": "application/json" };
  if (!KEY.startsWith("sb_")) headers.Authorization = "Bearer " + KEY;
  const rpc = async (fn, args) => {
    const r = await fetch(`${URL0}/rest/v1/rpc/${fn}`, { method: "POST", headers, body: JSON.stringify({ p_secret: secret, ...args }) });
    const t = await r.text();
    if (!r.ok) throw new Error("Supabase " + r.status + " " + t.slice(0, 100));
    return t ? JSON.parse(t) : null;
  };
  return {
    seed: secret,
    get: (k) => rpc("ubk_get", { p_key: k }),
    set: (k, v) => rpc("ubk_set", { p_key: k, p_value: v }),
    del: (k) => rpc("ubk_del", { p_key: k }),
  };
}
