// 第 21 章演示用的 Worker：在后台线程中统计质数个数
// 收到 { id, limit }，回复 { id, count, ms }

function countPrimes(limit) {
  let count = 0;
  for (let n = 2; n <= limit; n++) {
    let isPrime = true;
    for (let d = 2; d * d <= n; d++) {
      if (n % d === 0) { isPrime = false; break; }
    }
    if (isPrime) count++;
  }
  return count;
}

self.addEventListener('message', event => {
  const { id, limit } = event.data;
  const start = performance.now();
  const count = countPrimes(limit);
  self.postMessage({ id, count, ms: performance.now() - start });
});
