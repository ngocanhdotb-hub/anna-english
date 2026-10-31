// Service worker: giúp cài app, mở được giao diện khi mạng yếu và nhận thông báo nhắc học.
// Dữ liệu học không được lưu ở đây; trình duyệt luôn lấy từ máy chủ Supabase.
const CACHE = "anna-english-v1";
const SHELL = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys()
    .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});
// Ưu tiên bản mới từ mạng để bản cập nhật đến ngay; mất mạng mới dùng bản đã lưu
self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== self.location.origin) return;
  e.respondWith(
    fetch(e.request).then((res) => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(e.request, copy)); }
      return res;
    }).catch(() => caches.match(e.request).then((hit) => hit || caches.match("./index.html")))
  );
});
self.addEventListener("push", (e) => {
  let data = { title: "Anna English", body: "Đến giờ luyện nói rồi!" };
  try { data = Object.assign(data, e.data.json()); } catch (err) {}
  e.waitUntil(self.registration.showNotification(data.title, { body: data.body, icon: "./icon-192.png", badge: "./icon-192.png", tag: "daily-reminder" }));
});
self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
    const open = list.find((c) => "focus" in c);
    return open ? open.focus() : self.clients.openWindow("./");
  }));
});
