export function supabaseDb() {
  const base = (process.env.SUPABASE_URL || "").replace(/\/$/, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!base || !key) return null;
  const H = { apikey: key, Authorization: "Bearer " + key, "content-type": "application/json" };
  const T = base + "/rest/v1/ubk_kv";
  const fail = async (r) => { throw new Error("Supabase " + r.status + " " + (await r.text()).slice(0, 100)); };
  return {
    seed: key,
    get: async (k) => {
      const r = await fetch(`${T}?key=eq.${encodeURIComponent(k)}&select=value`, { headers: H });
      if (!r.ok) await fail(r);
      const a = await r.json();
      return a.length ? a[0].value : null;
    },
    set: async (k, v) => {
      const r = await fetch(`${T}?on_conflict=key`, { method: "POST", headers: { ...H, Prefer: "resolution=merge-duplicates,return=minimal" }, body: JSON.stringify({ key: k, value: v, updated_at: new Date().toISOString() }) });
      if (!r.ok) await fail(r);
    },
    del: async (k) => {
      const r = await fetch(`${T}?key=eq.${encodeURIComponent(k)}`, { method: "DELETE", headers: H });
      if (!r.ok) await fail(r);
    },
  };
}
