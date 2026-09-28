// 第 22 章演示页的脚本：注册 Service Worker、显示状态、处理更新与安装

const $ = selector => document.querySelector(selector);
const log = message => {
  const time = new Date().toLocaleTimeString();
  $('#log').textContent = `[${time}] ${message}\n` + $('#log').textContent;
};

// ---- 在线 / 离线状态（第 14 章） ----
function showOnline() {
  $('#net').textContent = navigator.onLine ? '🟢 在线' : '🔴 离线（页面由 Service Worker 从缓存提供）';
}
window.addEventListener('online', showOnline);
window.addEventListener('offline', showOnline);
showOnline();

// ---- 注册 Service Worker ----
let userRequestedUpdate = false;

async function registerSW() {
  if (!('serviceWorker' in navigator)) {
    $('#sw').textContent = '当前浏览器不支持 Service Worker（或页面不是 HTTPS / localhost）';
    return;
  }

  const registration = await navigator.serviceWorker.register('./sw.js', { scope: './' });
  log(`已注册，scope = ${registration.scope}`);

  // 已经有一个新版本在等待（上次访问时下载好的）
  if (registration.waiting) showUpdate(registration.waiting);

  // 检测到新版本开始安装
  registration.addEventListener('updatefound', () => {
    const worker = registration.installing;
    log('发现新版本，正在安装……');
    worker.addEventListener('statechange', () => {
      log(`新版本状态：${worker.state}`);
      // 安装完成，而且当前页面已被旧版本控制 → 说明这是「更新」而不是首次安装
      if (worker.state === 'installed' && navigator.serviceWorker.controller) showUpdate(worker);
      renderStatus(registration);
    });
  });

  // 控制当前页面的 Service Worker 变了（新版本激活）
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    log('controllerchange：页面已由新的 Service Worker 控制');
    if (userRequestedUpdate) location.reload();
    renderStatus(registration);
  });

  renderStatus(registration);
  navigator.serviceWorker.ready.then(() => { renderStatus(registration); listCache(); });
}

function renderStatus(registration) {
  const state = w => (w ? w.state : '—');
  $('#sw').textContent =
    `active：${state(registration.active)}　waiting：${state(registration.waiting)}　installing：${state(registration.installing)}\n` +
    `当前页面是否被控制（navigator.serviceWorker.controller）：${navigator.serviceWorker.controller ? '是' : '否（首次访问时，刷新一次后才会被控制）'}`;
}

function showUpdate(worker) {
  $('#update').hidden = false;
  $('#update-btn').onclick = () => {
    userRequestedUpdate = true;
    worker.postMessage('SKIP_WAITING');   // 让等待中的新版本立即激活
  };
}

// ---- 查看缓存内容（Cache API 在页面中同样可用） ----
async function listCache() {
  if (!('caches' in window)) return;
  const lines = [];
  for (const name of await caches.keys()) {
    const cache = await caches.open(name);
    const requests = await cache.keys();
    lines.push(`📦 ${name}（${requests.length} 个条目）`);
    requests.forEach(r => lines.push('   ' + new URL(r.url).pathname));
  }
  $('#cache').textContent = lines.join('\n') || '（还没有缓存）';
}

// ---- 注销并清空（方便反复实验） ----
$('#reset').addEventListener('click', async () => {
  const registrations = await navigator.serviceWorker?.getRegistrations() ?? [];
  await Promise.all(registrations.map(r => r.unregister()));
  const names = (await caches?.keys()) ?? [];
  await Promise.all(names.filter(n => n.startsWith('pwa-demo-')).map(n => caches.delete(n)));
  log('已注销 Service Worker 并删除缓存。刷新页面会重新注册。');
  listCache();
});
$('#refresh-cache').addEventListener('click', listCache);

// ---- 安装为应用（Chromium 系浏览器提供 beforeinstallprompt） ----
let deferredPrompt = null;
window.addEventListener('beforeinstallprompt', event => {
  event.preventDefault();          // 阻止浏览器自己的迷你提示条，改由我们的按钮触发
  deferredPrompt = event;
  $('#install').hidden = false;
});
$('#install').addEventListener('click', async () => {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  log(`安装提示结果：${outcome}`);
  deferredPrompt = null;
  $('#install').hidden = true;
});
window.addEventListener('appinstalled', () => log('应用已安装 🎉'));

if (matchMedia('(display-mode: standalone)').matches) {
  log('当前以「已安装应用」模式运行（display-mode: standalone）');
}

registerSW().catch(error => log(`注册失败：${error.message}`));
