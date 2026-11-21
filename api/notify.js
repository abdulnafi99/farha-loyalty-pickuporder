/* Web Push — hantar notifikasi walaupun app pelanggan / admin ditutup.
   Vercel Serverless Function: /api/notify
   GET  → { key }  (kunci awam VAPID untuk langganan push)
   POST → { no }   dengan header Authorization: Bearer <Firebase ID token>
          Pelayan baca pesanan dari Realtime Database, tentukan apa yang berubah, dan hantar push:
          · pesanan baru / bukti DuitNow baru → semua peranti admin (/pushAdmin)
          · status / bayaran berubah (dibuat oleh admin) → peranti pelanggan (/push/{uid})
          Teks notifikasi dibina di pelayan dari data pesanan, bukan dari pelanggan.
   Pemboleh ubah persekitaran (Vercel → Settings → Environment Variables):
     FIREBASE_SERVICE_ACCOUNT  JSON kunci akaun servis Firebase (Project settings → Service accounts)
     VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY  pasangan kunci Web Push
     VAPID_SUBJECT (pilihan)   cth. mailto:admin@farha.app
     FIREBASE_DB_URL (pilihan) URL Realtime Database */
const admin = require("firebase-admin");
const webpush = require("web-push");

const DB_URL = process.env.FIREBASE_DB_URL || "https://farha-apporder-default-rtdb.asia-southeast1.firebasedatabase.app";
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "admin@farha.app").split(",").map(s => s.trim().toLowerCase()).filter(Boolean);
const NEW_WINDOW = 30 * 60e3; // pesanan "baru" hanya diumumkan dalam 30 minit pertama

let ready = false;
function init() {
  if (ready) return;
  const sa = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || "null");
  if (!sa || !process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) throw new Error("not-configured");
  if (!admin.apps.length) admin.initializeApp({ credential: admin.credential.cert(sa), databaseURL: DB_URL });
  webpush.setVapidDetails(process.env.VAPID_SUBJECT || "mailto:admin@farha.app", process.env.VAPID_PUBLIC_KEY, process.env.VAPID_PRIVATE_KEY);
  ready = true;
}
const rm = n => "RM " + (+n || 0).toFixed(2);

async function sendTo(db, path, payload) {
  const subs = (await db.ref(path).get()).val() || {};
  let sent = 0;
  await Promise.all(Object.entries(subs).map(async ([k, v]) => {
    try {
      await webpush.sendNotification(JSON.parse(v.sub), JSON.stringify(payload), { TTL: 6 * 3600, urgency: "high" });
      sent++;
    } catch (e) {
      if (e && (e.statusCode === 404 || e.statusCode === 410)) await db.ref(`${path}/${k}`).remove().catch(() => {});
    }
  }));
  return sent;
}

function customerMessage(o, prevSig) {
  const prevStatus = (prevSig || "").split("|")[0];
  if (o.status !== prevStatus) {
    return {
      preparing: `Pesanan ${o.no} diterima dan sedang disediakan.`,
      ready: `Pesanan ${o.no} dah siap! Sila ambil di kaunter.`,
      done: `Terima kasih! +${o.earn || 0} point dikreditkan untuk ${o.no}.`,
      cancelled: `Pesanan ${o.no} dibatalkan oleh kedai.`,
    }[o.status] || null;
  }
  if (o.payRejected) return `Bukti bayaran ${o.no} ditolak. Sila hantar semula atau bayar di kaunter.`;
  if (o.paid) return `Bayaran ${o.pay === "duitnow" ? "DuitNow " : ""}untuk ${o.no} disahkan.`;
  return null;
}

module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  if (req.method === "GET") return res.status(200).json({ key: process.env.VAPID_PUBLIC_KEY || "" });
  if (req.method !== "POST") return res.status(405).json({ error: "method" });
  try { init(); } catch (e) { return res.status(503).json({ error: "not-configured" }); }

  const token = String(req.headers.authorization || "").replace(/^Bearer\s+/i, "");
  let user;
  try { user = await admin.auth().verifyIdToken(token); } catch (e) { return res.status(401).json({ error: "auth" }); }

  let body = req.body || {};
  if (typeof body === "string") { try { body = JSON.parse(body); } catch (e) { body = {}; } }
  const no = String(body.no || "");
  if (!/^[A-Za-z0-9-]{1,24}$/.test(no)) return res.status(400).json({ error: "no" });

  const db = admin.database();
  const rec = (await db.ref(`orders/${no}`).get()).val();
  if (!rec) return res.status(404).json({ error: "order" });
  const isAdmin = ADMIN_EMAILS.includes(String(user.email || "").toLowerCase());
  const isOwner = rec.uid === user.uid;
  if (!isAdmin && !isOwner) return res.status(403).json({ error: "forbidden" });

  let o = {};
  try { o = JSON.parse(rec.data || "{}"); } catch (e) {}
  o.no = no; o.status = rec.status || o.status;

  const logRef = db.ref(`pushLog/${no}`);
  const log = (await logRef.get()).val() || {};
  const upd = {}, now = Date.now();
  let sent = 0;

  // → admin: pesanan baru
  if (o.status === "new" && !log.newSent && now - (+o.ts || 0) < NEW_WINDOW) {
    const qty = (o.items || []).reduce((a, i) => a + (+i.qty || 0), 0);
    const when = o.pickupAt ? ` · ${o.preorder ? "pre-order " : ""}ambil ${new Date(o.pickupAt).toLocaleString("ms-MY", { timeZone: "Asia/Kuala_Lumpur", weekday: o.preorder ? "short" : undefined, hour: "numeric", minute: "2-digit" })}` : "";
    sent += await sendTo(db, "pushAdmin", {
      title: `Pesanan baru · ${no}`,
      body: `${o.name || "Pelanggan"} · ${qty} item · ${rm(o.total)} · ${o.pay === "duitnow" ? "DuitNow" : "Tunai"}${when}`,
      url: "admin.html#orders", order: no, tag: "new-" + no,
    });
    upd.newSent = now; upd.proof = o.proofAt || null;
  }
  // → admin: bukti DuitNow dihantar semula
  else if (o.pay === "duitnow" && o.proofAt && !o.paid && log.newSent && log.proof !== o.proofAt && o.status !== "cancelled") {
    sent += await sendTo(db, "pushAdmin", {
      title: `Bukti DuitNow baru · ${no}`,
      body: `${o.name || "Pelanggan"} hantar semula bukti bayaran ${rm(o.total)}. Sila semak.`,
      url: "admin.html#orders", order: no, tag: "proof-" + no,
    });
    upd.proof = o.proofAt;
  }

  // → pelanggan: status / bayaran berubah (hanya bila admin yang ubah)
  const sig = `${o.status}|${o.paid ? 1 : 0}|${o.payRejected ? 1 : 0}`;
  if (log.cust === undefined) upd.cust = sig;           // kali pertama: rekod sahaja, jangan hantar
  else if (log.cust !== sig && isAdmin) {
    const msg = customerMessage(o, log.cust);
    if (msg && rec.uid) sent += await sendTo(db, `push/${rec.uid}`, { title: "Farha", body: msg, url: "index.html#track", order: no, tag: "ord-" + no });
    upd.cust = sig;
  }

  if (Object.keys(upd).length) await logRef.update(upd);
  return res.status(200).json({ ok: true, sent });
};
