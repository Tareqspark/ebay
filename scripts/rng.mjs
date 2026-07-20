// Deterministic PRNG (mulberry32) so every generator script produces stable,
// reproducible output across runs.
export function createRng(seed) {
  let a = seed;
  const rand = () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const pick = (arr) => arr[Math.floor(rand() * arr.length)];
  const pickN = (arr, n) => {
    const pool = [...arr];
    const out = [];
    while (out.length < n && pool.length) {
      out.push(pool.splice(Math.floor(rand() * pool.length), 1)[0]);
    }
    return out;
  };
  const randInt = (min, max) => Math.floor(rand() * (max - min + 1)) + min;
  const chance = (p) => rand() < p;
  return { rand, pick, pickN, randInt, chance };
}
