// Deterministic randomness, seeded from a string.
//
// Every varying choice in a deck — layout variant, mascot pose, accent
// rotation, the wobble on a hand-drawn mark — goes through here. Seed off the
// deck slug and the same deck renders byte-identically forever, while two
// different decks still look different. Math.random() would give you variety
// you can't reproduce, which makes visual regression testing impossible.

/** FNV-1a. Any string in, one uint32 out. */
export function hashSeed(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** mulberry32. Small, fast, good enough for layout jitter. */
export function makeRng(seed) {
  let a = typeof seed === 'string' ? hashSeed(seed) : seed >>> 0;

  const next = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  next.float = (min, max) => min + next() * (max - min);
  next.int = (min, max) => Math.floor(next.float(min, max + 1));
  next.pick = (arr) => arr[Math.floor(next() * arr.length)];
  next.bool = (p = 0.5) => next() < p;

  /** Fisher-Yates on a copy. Used for accent rotation without repeats. */
  next.shuffle = (arr) => {
    const out = arr.slice();
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(next() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  };

  return next;
}
