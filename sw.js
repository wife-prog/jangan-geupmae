// 앱 화면은 캐시해서 빨리 열고, 데이터(app.json)는 항상 새로 받아오되 오프라인이면 캐시를 씀
const CACHE = "jangan-v1";
const SHELL = ["./", "./index.html", "./manifest.json", "./icons/icon-192.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL))); self.skipWaiting(); });
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== location.origin) return;
  // 같은 사이트 파일은 모두 '네트워크 먼저, 실패하면 캐시' (데이터·화면 모두 매일 바뀔 수 있음)
  e.respondWith(fetch(e.request).then(r => {
    const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return r;
  }).catch(() => caches.match(e.request).then(r => r || caches.match("./index.html"))));
});
