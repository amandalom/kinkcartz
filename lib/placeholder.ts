function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

// Deterministic two-tone gradient + monogram letter, derived from the
// product name. Stands in for real product photography without using
// anyone else's copyrighted images.
export function placeholderFor(name: string) {
  const h = hash(name);
  const hue1 = h % 360;
  const hue2 = (hue1 + 40 + (h % 60)) % 360;
  return {
    background: `linear-gradient(135deg, hsl(${hue1} 45% 18%), hsl(${hue2} 55% 10%))`,
    letter: name.trim().charAt(0).toUpperCase() || "?",
  };
}
