import { getStore, getDeployStore } from "@netlify/blobs";
import crypto from "node:crypto";

const store = () => Netlify.context?.deploy?.context === "production"
  ? getStore({ name: "ubk", consistency: "strong" })
  : getDeployStore({ name: "ubk", consistency: "strong" });
const SECRET = process.env.AUTH_SECRET || "";
const j = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { "content-type": "application/json", "cache-control": "no-store" } });
const hash = (p, salt) => crypto.scryptSync(p, salt, 32).toString("hex");
const sign = (t) => crypto.createHmac("sha256", SECRET).update(t).digest("hex");
const same = (a, b) => a.length === b.length && crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
const token = (u) => { const b = Buffer.from(JSON.stringify({ e: u.e, r: u.r, n: u.n, x: Date.now() + 12 * 36e5 })).toString("base64url"); return b + "." + sign(b); };
const who = (req) => {
  const [b, s] = (req.headers.get("authorization") || "").slice(7).split(".");
  if (!b || !s || !SECRET || !same(sign(b), s)) return null;
  try { const o = JSON.parse(Buffer.from(b, "base64url")); return o.x > Date.now() ? o : null; } catch { return null; }
};
const mkUser = (n, e, p, r) => { const salt = crypto.randomBytes(16).toString("hex"); return { n, e: e.toLowerCase(), r, salt, h: hash(p, salt) }; };
const pub = (u) => ({ n: u.n, e: u.e, r: u.r });
const DEFAULT = { cl: { "Nursery 1": 25000, "Nursery 2": 25000, "Primary 1": 35000, "Primary 2": 35000, "Primary 3": 40000 }, st: [], ex: [], seq: 0 };

export default async (req) => {
  if (!SECRET) return j({ error: "AUTH_SECRET is not configured" }, 500);
  const db = store(), path = new URL(req.url).pathname.replace(/\/$/, ""), m = req.method;
  let users = (await db.get("users", { type: "json" })) || [];
  if (!users.length) {
    users = [mkUser("School Admin", process.env.ADMIN_EMAIL || "admin@umarschool.edu", process.env.ADMIN_PASSWORD || "admin123", "admin")];
    await db.setJSON("users", users);
  }
  const body = m === "GET" || m === "DELETE" ? {} : await req.json().catch(() => ({}));

  if (path === "/api/login" && m === "POST") {
    const e = String(body.e || "").toLowerCase(), key = "lock-" + crypto.createHash("sha1").update(e).digest("hex");
    const lk = (await db.get(key, { type: "json" })) || { n: 0, t: 0 }, fresh = Date.now() - lk.t < 9e5;
    if (lk.n >= 5 && fresh) return j({ error: "Too many attempts" }, 429);
    const u = users.find((x) => x.e === e);
    if (!u || !same(hash(String(body.p || ""), u.salt), u.h)) {
      await db.setJSON(key, { n: (fresh ? lk.n : 0) + 1, t: Date.now() });
      return j({ error: "Invalid credentials" }, 401);
    }
    if (lk.n) await db.delete(key);
    return j({ token: token(u), user: pub(u) });
  }
  const me = who(req);
  if (!me) return j({ error: "Unauthorized" }, 401);

  if (path === "/api/state" && m === "GET") {
    const s = (await db.get("state", { type: "json" })) || { v: 0, data: DEFAULT };
    return j(s);
  }
  if (path === "/api/state" && m === "PUT") {
    if (me.r === "viewer") return j({ error: "Read-only" }, 403);
    const cur = (await db.get("state", { type: "json" })) || { v: 0, data: DEFAULT };
    if (body.v !== cur.v) return j(cur, 409);
    const d = body.data || {};
    if (!Array.isArray(d.st) || !Array.isArray(d.ex) || !d.cl) return j({ error: "Bad data" }, 400);
    const next = { v: cur.v + 1, data: { cl: d.cl, st: d.st, ex: d.ex, seq: d.seq || 0 } };
    await db.setJSON("state", next);
    return j({ v: next.v });
  }
  if (path === "/api/password" && m === "POST") {
    const u = users.find((x) => x.e === me.e);
    if (!u || String(body.n || "").length < 8 || !same(hash(String(body.o || ""), u.salt), u.h)) return j({ error: "Rejected" }, 400);
    u.salt = crypto.randomBytes(16).toString("hex"); u.h = hash(body.n, u.salt);
    await db.setJSON("users", users);
    return j({ ok: 1 });
  }
  if (me.r !== "admin") return j({ error: "Forbidden" }, 403);
  if (path === "/api/users" && m === "GET") return j(users.map(pub));
  if (path === "/api/users" && m === "POST") {
    const e = String(body.e || "").toLowerCase();
    if (!body.n || !e || String(body.p || "").length < 8 || !["admin", "bursar", "viewer"].includes(body.r)) return j({ error: "Invalid details" }, 400);
    if (users.some((x) => x.e === e)) return j({ error: "Email already exists" }, 409);
    users.push(mkUser(body.n, e, body.p, body.r));
    await db.setJSON("users", users);
    return j({ ok: 1 });
  }
  if (path === "/api/users" && m === "DELETE") {
    const e = (new URL(req.url).searchParams.get("e") || "").toLowerCase();
    if (e === me.e) return j({ error: "Cannot remove yourself" }, 400);
    await db.setJSON("users", users.filter((x) => x.e !== e));
    return j({ ok: 1 });
  }
  return j({ error: "Not found" }, 404);
};

export const config = { path: "/api/*" };
