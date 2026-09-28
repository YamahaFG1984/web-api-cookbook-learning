// 第 22 章演示用的 Service Worker
// 作用域（scope）是 demo/pwa/，只控制这个目录下的页面，不会影响教程的其他页面。

// 每次修改 App Shell 的内容时，把版本号加一：新缓存名会触发「安装新版本 → 清理旧缓存」
const VERSION = 'v1';
const CACHE = `pwa-demo-${VERSION}`;

// App Shell：离线时也必须能用的最小文件集合（相对 sw.js 所在目录）
const APP_SHELL = [
  './',
  './index.html',
  './app.js',
  './manifest.webmanifest',
  './icon.svg',
  './offline.html',
  '../../assets/style.css'
];

// ① install：预缓存 App Shell。addAll 任何一个文件失败，整个安装就失败
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(APP_SHELL))
  );
  // 这里故意不调用 self.skipWaiting()：
  // 新版本会进入 waiting 状态，由页面提示用户「有新版本」，用户同意后再切换（见 message 事件）
});

// ② activate：清理旧版本的缓存，并立即接管当前打开的页面
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys
        .filter(key => key.startsWith('pwa-demo-') && key !== CACHE)
        .map(key => caches.delete(key))
    );
    await self.clients.claim();
  })());
});

// ③ fetch：拦截这个作用域内页面发出的所有请求
self.addEventListener('fetch', event => {
  const { request } = event;
  if (request.method !== 'GET') return;           // 只处理 GET，其他请求交给浏览器

  if (request.mode === 'navigate') {
    // 页面导航：网络优先，保证在线时总能拿到最新的 HTML；离线时退回缓存，再退回离线页
    event.respondWith(networkFirst(request));
  } else {
    // 静态资源：先用缓存（快），同时在后台更新缓存（新）
    event.respondWith(staleWhileRevalidate(request, event));
  }
});

async function networkFirst(request) {
  const cache = await caches.open(CACHE);
  try {
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch (error) {
    return (await cache.match(request)) || (await cache.match('./offline.html'));
  }
}

async function staleWhileRevalidate(request, event) {
  const cache = await caches.open(CACHE);
  const cached = await cache.match(request);
  const update = fetch(request)
    .then(response => {
      if (response.ok) cache.put(request, response.clone());
      return response;
    })
    .catch(() => cached);
  // 有缓存就立即返回缓存，但让后台更新继续完成
  if (cached) {
    event.waitUntil(update);
    return cached;
  }
  return update;
}

// 页面发来 SKIP_WAITING：用户同意更新，立即激活新版本
self.addEventListener('message', event => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});
