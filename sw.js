// เปลี่ยนเลขเวอร์ชันทุกครั้งที่อัปเดต index.html เพื่อให้เครื่องผู้ใช้โหลดไฟล์ใหม่
const CACHE = "recruit-v3";
const FILES = ["./", "./index.html", "./manifest.json", "./icon-192.png", "./icon-512.png", "./apple-touch-icon.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES))); self.skipWaiting(); });
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});
// หน้าเว็บ: ลองโหลดใหม่จากเน็ตก่อน ถ้าออฟไลน์ใช้ของในเครื่อง · ไฟล์อื่น: ใช้ของในเครื่องก่อน
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  if (req.mode === "navigate") {
    // ถ้าเว็บต้นทางหาย (เช่น 404) หรือออฟไลน์ ให้เปิดจากของที่เก็บไว้ในเครื่องแทน
    e.respondWith(fetch(req).then(r => {
      if (!r.ok) return caches.match("./index.html").then(hit => hit || r);
      const cp = r.clone(); caches.open(CACHE).then(c => c.put("./index.html", cp)); return r;
    }).catch(() => caches.match("./index.html")));
    return;
  }
  e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(r => {
    if (r.ok && (req.url.startsWith(self.location.origin) || req.url.includes("fonts.g"))) { const cp = r.clone(); caches.open(CACHE).then(c => c.put(req, cp)); }
    return r;
  }).catch(() => hit)));
});
