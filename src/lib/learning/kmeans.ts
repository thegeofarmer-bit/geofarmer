export type Vector = number[];

function rng(seed: number) {
  let t = seed >>> 0;
  return () => {
    t = (t + 0x6d2b79f5) >>> 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

export function distance(a: Vector, b: Vector): number {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += (a[i] - b[i]) ** 2;
  return Math.sqrt(s);
}

export function standardize(rows: Vector[]): { rows: Vector[]; mean: Vector; sd: Vector } {
  const dims = rows[0]?.length ?? 0;
  const mean = Array.from({ length: dims }, (_, j) => rows.reduce((s, r) => s + r[j], 0) / rows.length);
  const sd = Array.from({ length: dims }, (_, j) => {
    const v = rows.reduce((s, r) => s + (r[j] - mean[j]) ** 2, 0) / rows.length;
    return Math.sqrt(v) || 1;
  });
  return { rows: rows.map((r) => r.map((x, j) => (x - mean[j]) / sd[j])), mean, sd };
}

function nearest(point: Vector, centroids: Vector[]): number {
  let best = 0;
  let bestD = Infinity;
  centroids.forEach((c, i) => {
    const d = distance(point, c);
    if (d < bestD) {
      bestD = d;
      best = i;
    }
  });
  return best;
}

function seedCentroids(rows: Vector[], k: number, random: () => number): Vector[] {
  const centroids = [rows[Math.floor(random() * rows.length)]];
  while (centroids.length < k) {
    const weights = rows.map((r) => Math.min(...centroids.map((c) => distance(r, c))) ** 2);
    let pick = random() * weights.reduce((a, b) => a + b, 0);
    let i = 0;
    while (pick > weights[i] && i < rows.length - 1) pick -= weights[i++];
    centroids.push(rows[i]);
  }
  return centroids.map((c) => [...c]);
}

export interface Clustering {
  k: number;
  labels: number[];
  centroids: Vector[];
  inertia: number;
}

function runOnce(rows: Vector[], k: number, random: () => number): Clustering {
  let centroids = seedCentroids(rows, k, random);
  let labels = rows.map((r) => nearest(r, centroids));
  for (let iter = 0; iter < 100; iter++) {
    centroids = centroids.map((c, i) => {
      const members = rows.filter((_, r) => labels[r] === i);
      return members.length ? c.map((_, j) => members.reduce((s, m) => s + m[j], 0) / members.length) : c;
    });
    const next = rows.map((r) => nearest(r, centroids));
    if (next.every((l, i) => l === labels[i])) break;
    labels = next;
  }
  const inertia = rows.reduce((s, r, i) => s + distance(r, centroids[labels[i]]) ** 2, 0);
  return { k, labels, centroids, inertia };
}

export function kmeans(rows: Vector[], k: number, { seed = 42, restarts = 8 } = {}): Clustering {
  const random = rng(seed + k);
  let best: Clustering | null = null;
  for (let i = 0; i < restarts; i++) {
    const run = runOnce(rows, k, random);
    if (!best || run.inertia < best.inertia) best = run;
  }
  return best!;
}

function silhouette(rows: Vector[], labels: number[]): number {
  const k = Math.max(...labels) + 1;
  let total = 0;
  rows.forEach((r, i) => {
    const byCluster = Array.from({ length: k }, () => ({ sum: 0, n: 0 }));
    rows.forEach((o, j) => {
      if (i === j) return;
      byCluster[labels[j]].sum += distance(r, o);
      byCluster[labels[j]].n++;
    });
    const own = byCluster[labels[i]];
    const a = own.n ? own.sum / own.n : 0;
    const b = Math.min(...byCluster.filter((_, c) => c !== labels[i] && byCluster[c].n).map((c) => c.sum / c.n));
    total += own.n && Number.isFinite(b) ? (b - a) / Math.max(a, b) : 0;
  });
  return total / rows.length;
}

export function bestClustering(rows: Vector[], kRange: [number, number] = [3, 6]): Clustering & { silhouette: number } {
  let best: (Clustering & { silhouette: number }) | null = null;
  for (let k = kRange[0]; k <= Math.min(kRange[1], rows.length - 1); k++) {
    const c = kmeans(rows, k);
    const s = silhouette(rows, c.labels);
    if (!best || s > best.silhouette) best = { ...c, silhouette: s };
  }
  return best!;
}
