export function blendPixel(dst, src) {
  const srcA = src[3] / 255;
  const dstA = dst[3] / 255;

  const outA = srcA + dstA * (1 - srcA);
  if (outA === 0) return [0, 0, 0, 0];

  const r = Math.round((src[0] * srcA + dst[0] * dstA * (1 - srcA)) / outA);
  const g = Math.round((src[1] * srcA + dst[1] * dstA * (1 - srcA)) / outA);
  const b = Math.round((src[2] * srcA + dst[2] * dstA * (1 - srcA)) / outA);

  return [r, g, b, Math.round(outA * 255)];
}