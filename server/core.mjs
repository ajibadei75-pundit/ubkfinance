import crypto from "node:crypto";

const DEFAULT = { cl: { "Nursery 1": 25000, "Nursery 2": 25000, "Primary 1": 35000, "Primary 2": 35000, "Primary 3": 40000 }, st: [], ex: [], seq: 0 };
const hash = (p, salt) => crypto.scryptSync(p, salt, 32).toString("hex");
const same = (a, b) => a.length === b.length && crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
const mkUser = (n, e, p, r) => { const salt = crypto.randomBytes(16).toString("hex"); return { n, e: e.toLowerCase(), r, salt, h: hash(p, salt) }; };
const pub = (u) => ({ n: u.n, e: u.e, r: u.r });

export async function handle({ method: m, path, search, auth, body, db }) {
  const R = (status, b) => ({ status, body: b });
  if (!db) return R(500, { error: "Database not connected. Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your hosting settings, then redeploy." });
  const SECRET = process.env.AUTH_SECRET || crypto.createHash("sha256").update("ubk|" + (db.seed || "")).digest("hex");
  const sign = (t) => crypto.createHmac("sha256", SECRET).update(t).digest("hex");
  const token = (u) => { const b = Buffer.from(JSON.stringify({ e: u.e, r: u.r, n: u.n, x: Date.now() + 12 * 36e5 })).toString("base64url"); return b + "." + sign(b); };
  const who = () => {
    const [b, s] = auth.slice(7).split(".");
    if (!b || !s || !same(sign(b), s)) return null;
    try { const o = JSON.parse(Buffer.from(b, "base64url")); return o.x > Date.now() ? o : null; } catch { return null; }
  };
  try {
    let users = (await db.get("users")) || [];
    if (!users.length) {
      users = [mkUser("School Admin", process.env.ADMIN_EMAIL || "admin@umarschool.edu", process.env.ADMIN_PASSWORD || "8vU2V47nG2EuvXeqmsI5", "admin")];
      await db.set("users", users);
    }
    if (path === "/api/login" && m === "POST") {
      const e = String(body.e || "").toLowerCase(), key = "lock-" + crypto.createHash("sha1").update(e).digest("hex");
      const lk = (await db.get(key)) || { n: 0, t: 0 }, fresh = Date.now() - lk.t < 9e5;
      if (lk.n >= 5 && fresh) return R(429, { error: "Too many attempts" });
      const u = users.find((x) => x.e === e);
      if (!u || !same(hash(String(body.p || ""), u.salt), u.h)) {
        await db.set(key, { n: (fresh ? lk.n : 0) + 1, t: Date.now() });
        return R(401, { error: "Invalid credentials" });
      }
      if (lk.n) await db.del(key);
      return R(200, { token: token(u), user: pub(u) });
    }
    const me = who();
    if (!me) return R(401, { error: "Unauthorized" });
    if (path === "/api/state" && m === "GET") return R(200, (await db.get("state")) || { v: 0, data: DEFAULT });
    if (path === "/api/state" && m === "PUT") {
      if (me.r === "viewer") return R(403, { error: "Read-only" });
      const cur = (await db.get("state")) || { v: 0, data: DEFAULT };
      if (body.v !== cur.v) return R(409, cur);
      const d = body.data || {};
      if (!Array.isArray(d.st) || !Array.isArray(d.ex) || !d.cl) return R(400, { error: "Bad data" });
      const next = { v: cur.v + 1, data: { cl: d.cl, st: d.st, ex: d.ex, seq: d.seq || 0 } };
      await db.set("state", next);
      return R(200, { v: next.v });
    }
    if (path === "/api/password" && m === "POST") {
      const u = users.find((x) => x.e === me.e);
      if (!u || String(body.n || "").length < 8 || !same(hash(String(body.o || ""), u.salt), u.h)) return R(400, { error: "Rejected" });
      u.salt = crypto.randomBytes(16).toString("hex"); u.h = hash(body.n, u.salt);
      await db.set("users", users);
      return R(200, { ok: 1 });
    }
    if (me.r !== "admin") return R(403, { error: "Forbidden" });
    if (path === "/api/users" && m === "GET") return R(200, users.map(pub));
    if (path === "/api/users" && m === "POST") {
      const e = String(body.e || "").toLowerCase();
      if (!body.n || !e || String(body.p || "").length < 8 || !["admin", "bursar", "viewer"].includes(body.r)) return R(400, { error: "Invalid details" });
      if (users.some((x) => x.e === e)) return R(409, { error: "Email already exists" });
      users.push(mkUser(body.n, e, body.p, body.r));
      await db.set("users", users);
      return R(200, { ok: 1 });
    }
    if (path === "/api/users" && m === "DELETE") {
      const e = (search.get("e") || "").toLowerCase();
      if (e === me.e) return R(400, { error: "Cannot remove yourself" });
      await db.set("users", users.filter((x) => x.e !== e));
      return R(200, { ok: 1 });
    }
    return R(404, { error: "Not found" });
  } catch (err) {
    return R(500, { error: "Server storage error: " + String(err.message || err).slice(0, 120) });
  }
}
