/* ================================================================
   Web API 实战教程 · 共享脚本：侧边栏、目录、代码高亮、主题
   ================================================================ */
(function () {
  'use strict';

  var CHAPTERS = [
    { n: 1,  t: '异步 API',              d: 'Promise、async/await、并行与 requestAnimationFrame', part: '第一部分 · 数据与通信' },
    { n: 2,  t: 'Web Storage 简单持久化', d: 'localStorage、JSON 序列化与 storage 事件' },
    { n: 3,  t: 'URL 与路由',            d: 'URL、URLSearchParams、前端路由与 URLPattern' },
    { n: 4,  t: '网络请求',              d: 'Fetch、Beacon、SSE 与 WebSocket' },
    { n: 5,  t: 'IndexedDB',            d: '浏览器里的数据库：存储、索引、游标与分页' },
    { n: 6,  t: '观察 DOM 元素',          d: 'IntersectionObserver、MutationObserver、ResizeObserver', part: '第二部分 · 页面与交互' },
    { n: 7,  t: '表单',                  d: 'FormData、约束校验、自定义与异步校验' },
    { n: 8,  t: 'Web Animations API',   d: '用 JavaScript 驱动关键帧动画' },
    { n: 9,  t: 'Web Speech API',       d: '语音识别与语音合成', part: '第三部分 · 内容与多媒体' },
    { n: 10, t: '文件操作',              d: 'FileReader、拖放、文件系统访问与下载' },
    { n: 11, t: '国际化',                d: 'Intl：日期、数字、复数、分词与排序' },
    { n: 12, t: 'Web Components',       d: '自定义元素、Shadow DOM、模板与插槽', part: '第四部分 · 组件与界面' },
    { n: 13, t: 'UI 元素',               d: 'dialog、details、Popover、提示与通知' },
    { n: 14, t: '设备集成',              d: '电池、网络、定位、剪贴板、分享与振动', part: '第五部分 · 设备与工程' },
    { n: 15, t: '性能测量',              d: 'Performance API 与 PerformanceObserver' },
    { n: 16, t: '控制台',                d: '把 console 用到极致：样式、表格、计时与分组' },
    { n: 17, t: 'CSS 相关 API',          d: '高亮、字体加载、视图过渡与样式查询', part: '第六部分 · 样式与媒体' },
    { n: 18, t: '媒体',                  d: '录屏、摄像头拍照与录像、媒体能力检测' },
    { n: 19, t: '结语',                  d: '特性检测、polyfill 与 Web 平台的未来' },
    { n: 20, t: '事件系统深入',          d: '冒泡与捕获、事件委托、Pointer 与键盘事件', part: '第七部分 · 补充篇' },
    { n: 21, t: 'Web Worker 与主线程',   d: '事件循环、长任务、postMessage 与让出主线程' },
    { n: 22, t: 'Service Worker 与 PWA', d: '离线缓存、缓存策略、更新流程与安装' },
    { n: 23, t: 'Web Crypto 与 Passkeys', d: '随机数、哈希、加密、签名与无密码登录' },
    { n: 24, t: '前端安全',              d: 'XSS 防护、Sanitizer、CSP 与 Trusted Types' },
    { n: 25, t: 'Canvas 2D 绘图',        d: '路径、变换、像素处理、动画与 OffscreenCanvas' },
    { n: 26, t: 'Web Audio API',         d: '音频图、合成器、精确调度与可视化' },
    { n: 27, t: 'WebRTC 点对点通信',     d: '信令、SDP、ICE、数据通道与视频通话' }
  ];

  var cur = parseInt(document.body.dataset.chapter || '0', 10);

  /* ---------- 侧边栏 ---------- */
  var side = document.getElementById('sidebar');
  if (side) {
    var html = '<a class="brand" href="index.html"><span class="flame">&#129520;</span>' +
      '<span>Web API 实战<small>用浏览器原生能力写应用</small></span></a>';
    CHAPTERS.forEach(function (c) {
      if (c.part) html += '<div class="part">' + c.part + '</div>';
      html += '<a class="ch' + (c.n === cur ? ' active' : '') + '" href="ch' +
        pad(c.n) + '.html"><span class="n">' + c.n + '</span><span>' + c.t + '</span></a>';
    });
    side.innerHTML = html;
    var active = side.querySelector('a.ch.active');
    if (active) setTimeout(function () {
      active.scrollIntoView({ block: 'center' });
    }, 0);
  }

  /* ---------- 移动端菜单 ---------- */
  var btn = document.createElement('button');
  btn.id = 'menu-btn';
  btn.type = 'button';
  btn.setAttribute('aria-label', '目录');
  btn.innerHTML = '&#9776;';
  btn.onclick = function () { document.body.classList.toggle('nav-open'); };
  document.body.appendChild(btn);
  document.addEventListener('click', function (e) {
    if (document.body.classList.contains('nav-open') &&
        side && !side.contains(e.target) && e.target !== btn) {
      document.body.classList.remove('nav-open');
    }
  });

  /* ---------- 主题切换 ---------- */
  var tbtn = document.createElement('button');
  tbtn.id = 'theme-btn';
  tbtn.type = 'button';
  tbtn.setAttribute('aria-label', '切换深浅色');
  tbtn.innerHTML = '&#9789;';
  tbtn.onclick = function () {
    var root = document.documentElement;
    var now = root.getAttribute('data-theme');
    var dark = now ? now === 'dark'
      : window.matchMedia('(prefers-color-scheme: dark)').matches;
    root.setAttribute('data-theme', dark ? 'light' : 'dark');
    try { localStorage.setItem('webapi-doc-theme', dark ? 'light' : 'dark'); } catch (e) {}
  };
  document.body.appendChild(tbtn);
  try {
    var saved = localStorage.getItem('webapi-doc-theme');
    if (saved) document.documentElement.setAttribute('data-theme', saved);
  } catch (e) {}

  /* ---------- 箭头 marker（全局一次） ---------- */
  var defs = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  defs.setAttribute('width', '0'); defs.setAttribute('height', '0');
  defs.setAttribute('style', 'position:absolute');
  // SVG marker 的内容不会从引用它的元素继承 color，所以直接用 CSS 变量填色。
  function mk(id, color) {
    return '<marker id="' + id + '" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">' +
      '<path d="M0,0 L10,5 L0,10 z" fill="var(' + color + ')"/></marker>';
  }
  defs.innerHTML = '<defs>' + mk('ar', '--fg-faint') + mk('ar-a', '--accent') +
    mk('ar-b', '--blue') + mk('ar-g', '--green') + mk('ar-r', '--red') + mk('ar-p', '--purple') + '</defs>';
  document.body.appendChild(defs);

  /* ---------- 章节内目录 ---------- */
  var main = document.querySelector('main');
  var slot = document.getElementById('chapter-toc');
  if (slot && main) {
    var hs = main.querySelectorAll('h2');
    if (hs.length > 2) {
      var t = '<div class="h">本章目录</div><ol>';
      hs.forEach(function (h, i) {
        if (!h.id) h.id = 'sec-' + (i + 1);
        t += '<li><a href="#' + h.id + '">' + h.textContent + '</a></li>';
      });
      slot.className = 'toc';
      slot.innerHTML = t + '</ol>';
    }
  }

  /* ---------- 代码块：语言标签 + 复制 + 高亮 ---------- */
  var KW = ('const|let|var|function|return|if|else|await|async|import|from|export|default|new|class|' +
    'extends|implements|for|while|of|in|do|try|catch|finally|throw|switch|case|break|continue|' +
    'type|interface|enum|as|typeof|instanceof|delete|void|yield|static|get|set|' +
    'null|undefined|true|false|this|super').split('|');

  var RE_JS = new RegExp(
    '(\\/\\*[\\s\\S]*?\\*\\/|\\/\\/[^\\n]*)' +                       // 1 注释
    '|(`(?:\\\\[\\s\\S]|[^\\\\`])*`|\'(?:\\\\[\\s\\S]|[^\\\\\'\\n])*\'|"(?:\\\\[\\s\\S]|[^\\\\"\\n])*")' + // 2 字符串
    '|\\b(' + KW.join('|') + ')\\b' +                                 // 3 关键字
    '|\\b([A-Z][A-Za-z0-9_]*)\\b' +                                   // 4 类型/构造器
    '|\\b(\\d+(?:\\.\\d+)?)\\b' +                                     // 5 数字
    '|\\b([a-zA-Z_$][\\w$]*)(?=\\()',                                 // 6 函数调用
    'g');

  var RE_SH = /(#[^\n]*)|('(?:\\[\s\S]|[^\\'])*'|"(?:\\[\s\S]|[^\\"])*")|\b(npm|npx|node|git|cd|mkdir|curl|export)\b/g;

  // HTML：先切出注释和整个标签，再在标签内部上色（标签外的文字保持原样）
  var RE_HTML_TOK = /(<!--[\s\S]*?-->)|(<\/?[a-zA-Z][\w-]*(?:\s(?:"[^"]*"|'[^']*'|[^>"'])*)?\/?>)/g;
  var RE_TAG = /("[^"]*"|'[^']*')|(<\/?[a-zA-Z][\w-]*|\/?>)|([a-zA-Z_:@][\w:.-]*)/g;

  // CSS：注释 | 字符串 | @规则 | 属性名 | 数字单位
  var RE_CSS = /(\/\*[\s\S]*?\*\/)|("[^"\n]*"|'[^'\n]*')|(@[\w-]+|::?[\w-]+(?=[\s{,(:)]))|([\w-]+)(?=\s*:[^:{;]*[;}\n])|(-?\d*\.?\d+(?:px|ms|s|em|rem|%|deg|vh|vw|fr)?\b)/g;

  function esc(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function paint(src, re, classes) {
    var out = '', last = 0, m;
    re.lastIndex = 0;
    while ((m = re.exec(src)) !== null) {
      out += esc(src.slice(last, m.index));
      for (var g = 1; g < m.length; g++) {
        if (m[g] !== undefined) {
          out += classes[g - 1] ? '<span class="' + classes[g - 1] + '">' + esc(m[g]) + '</span>' : esc(m[g]);
          break;
        }
      }
      last = m.index + m[0].length;
      if (m[0].length === 0) re.lastIndex++;
    }
    return out + esc(src.slice(last));
  }

  function paintMarkup(src) {
    var out = '', last = 0, m;
    RE_HTML_TOK.lastIndex = 0;
    while ((m = RE_HTML_TOK.exec(src)) !== null) {
      out += esc(src.slice(last, m.index));
      out += m[1] ? '<span class="tk-cm">' + esc(m[1]) + '</span>'
                  : paint(m[2], RE_TAG, ['tk-st', 'tk-tg', 'tk-at']);
      last = m.index + m[0].length;
    }
    return out + esc(src.slice(last));
  }

  // HTML 里的 <script> / <style> 内容交给 JS / CSS 高亮
  function paintHTML(src) {
    var out = '', last = 0, m;
    var re = /(<script\b[^>]*>)([\s\S]*?)(<\/script>)|(<style\b[^>]*>)([\s\S]*?)(<\/style>)/g;
    while ((m = re.exec(src)) !== null) {
      out += paintMarkup(src.slice(last, m.index));
      if (m[1]) {
        out += paintMarkup(m[1]) +
          paint(m[2], RE_JS, ['tk-cm', 'tk-st', 'tk-kw', 'tk-tp', 'tk-nm', 'tk-fn']) +
          paintMarkup(m[3]);
      } else {
        out += paintMarkup(m[4]) +
          paint(m[5], RE_CSS, ['tk-cm', 'tk-st', 'tk-sl', 'tk-at', 'tk-nm']) +
          paintMarkup(m[6]);
      }
      last = m.index + m[0].length;
    }
    return out + paintMarkup(src.slice(last));
  }

  document.querySelectorAll('.code').forEach(function (box) {
    // 代码既可以写在 <pre> 里（需要转义 < 和 &），
    // 也可以写在 <script type="text/plain"> 里（原样书写，</script> 写成 <\/script>）。
    var raw = box.querySelector('script[type="text/plain"]');
    var pre = box.querySelector('pre');
    var code;
    if (raw) {
      code = raw.textContent.replace(/<\\\//g, '</');
      pre = document.createElement('pre');
      raw.replaceWith(pre);
    } else if (pre) {
      code = pre.textContent;
    } else {
      return;
    }
    code = code.replace(/^\s*\n/, '').replace(/\s+$/, '');

    var lang = box.dataset.lang || '';
    var file = box.dataset.file || '';
    var bar = document.createElement('div');
    bar.className = 'bar';
    bar.innerHTML = '<span class="tag">' + esc(file || lang || 'code') + '</span>';
    var cp = document.createElement('button');
    cp.className = 'copy'; cp.type = 'button'; cp.textContent = '复制';
    cp.onclick = function () {
      if (navigator.clipboard) navigator.clipboard.writeText(code);
      cp.textContent = '已复制'; setTimeout(function () { cp.textContent = '复制'; }, 1400);
    };
    bar.appendChild(cp);
    box.insertBefore(bar, pre);

    if (lang === 'bash' || lang === 'sh' || lang === 'shell') {
      pre.innerHTML = paint(code, RE_SH, ['tk-cm', 'tk-st', 'tk-kw']);
    } else if (lang === 'text' || lang === 'http') {
      pre.innerHTML = esc(code);
    } else if (lang === 'html') {
      pre.innerHTML = paintHTML(code);
    } else if (lang === 'css') {
      pre.innerHTML = paint(code, RE_CSS, ['tk-cm', 'tk-st', 'tk-sl', 'tk-at', 'tk-nm']);
    } else {
      pre.innerHTML = paint(code, RE_JS, ['tk-cm', 'tk-st', 'tk-kw', 'tk-tp', 'tk-nm', 'tk-fn']);
    }
  });

  /* ---------- 上一章 / 下一章 ---------- */
  var pager = document.getElementById('pager');
  if (pager && cur) {
    var prev = CHAPTERS.find(function (c) { return c.n === cur - 1; });
    var next = CHAPTERS.find(function (c) { return c.n === cur + 1; });
    var h = '';
    h += prev ? '<a class="prev" href="ch' + pad(prev.n) + '.html"><span>&larr; 上一章</span>第 ' + prev.n + ' 章 · ' + prev.t + '</a>'
              : '<a class="prev" href="index.html"><span>&larr; 返回</span>课程首页</a>';
    h += next ? '<a class="next" href="ch' + pad(next.n) + '.html"><span>下一章 &rarr;</span>第 ' + next.n + ' 章 · ' + next.t + '</a>'
              : '<a class="next" href="index.html"><span>完成 &rarr;</span>回到课程首页</a>';
    pager.className = 'pager';
    pager.innerHTML = h;
  }

  /* ---------- 首页目录 ---------- */
  var grid = document.getElementById('toc-grid');
  if (grid) {
    var g = '';
    CHAPTERS.forEach(function (c) {
      g += '<a class="toc-card" href="ch' + pad(c.n) + '.html">' +
        '<div class="n">第 ' + c.n + ' 章</div>' +
        '<div class="t">' + c.t + '</div>' +
        '<div class="d">' + c.d + '</div></a>';
    });
    grid.className = 'toc-grid';
    grid.innerHTML = g;
  }

  function pad(n) { return n < 10 ? '0' + n : '' + n; }
})();
