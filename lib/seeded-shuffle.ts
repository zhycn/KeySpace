export function seededShuffle<T>(arr: T[], seed: number): T[] {
  const a = [...arr];
  let s = seed;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 16807 + 0) % 2147483647;
    const j = s % (i + 1);
    const tempI = a[i];
    const tempJ = a[j];
    if (tempI !== undefined && tempJ !== undefined) {
      a[i] = tempJ;
      a[j] = tempI;
    }
  }
  return a;
}
