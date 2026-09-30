export function redisDb() {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const tok = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !tok) return null;
  const cmd = async (a) => {
    const r = await fetch(url, { method: "POST", headers: { Authorization: "Bearer " + tok, "content-type": "application/json" }, body: JSON.stringify(a) });
    const o = await r.json();
    if (o.error) throw new Error(o.error);
    return o.result;
  };
  return {
    seed: tok,
    get: async (k) => { const v = await cmd(["GET", "ubk:" + k]); return v ? JSON.parse(v) : null; },
    set: async (k, v) => { await cmd(["SET", "ubk:" + k, JSON.stringify(v)]); },
    del: async (k) => { await cmd(["DEL", "ubk:" + k]); },
  };
}
