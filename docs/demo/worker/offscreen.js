// 第 25 章演示用的 Worker：在 Worker 线程中用 OffscreenCanvas 绘制动画
// 页面通过 transferControlToOffscreen() 把画布的控制权转移过来

let ctx, width, height, angle = 0;

self.addEventListener('message', event => {
  const { canvas, dpr, color } = event.data;
  width = canvas.width / dpr;
  height = canvas.height / dpr;
  ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  self.color = color;
  requestAnimationFrame(draw);   // Dedicated Worker 中同样有 requestAnimationFrame
});

function draw() {
  angle += 0.05;
  ctx.clearRect(0, 0, width, height);
  ctx.save();
  ctx.translate(width / 2, height / 2);
  for (let i = 0; i < 12; i++) {
    ctx.rotate(Math.PI / 6);
    ctx.globalAlpha = (i + 1) / 12;
    ctx.fillStyle = self.color;
    ctx.fillRect(18, -4, 22, 8);
  }
  ctx.restore();
  ctx.save();
  ctx.translate(width / 2, height / 2);
  ctx.rotate(angle);
  ctx.fillStyle = self.color;
  ctx.fillRect(-6, -40, 12, 30);
  ctx.restore();
  requestAnimationFrame(draw);
}
