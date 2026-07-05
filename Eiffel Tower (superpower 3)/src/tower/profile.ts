import { BASE_HALF_WIDTH, PLATFORM_HALF_WIDTHS, HEIGHT_TOP } from '../constants';

const wBase = BASE_HALF_WIDTH;
const h1 = 57;
const w1 = PLATFORM_HALF_WIDTHS[57];
const h2 = 276;
const w2 = PLATFORM_HALF_WIDTHS[276];

function evalK(k: number): { err: number; wTop: number } {
  const A = Math.exp(-k * h1);
  const wTop = (w1 - wBase * A) / (1 - A);
  const pred2 = wTop + (wBase - wTop) * Math.exp(-k * h2);
  return { err: (pred2 - w2) * (pred2 - w2), wTop };
}

function solveCalibration(): { k: number; wTop: number } {
  let best = { err: Infinity, k: 0, wTop: 0 };
  for (let exp = -8; exp <= 2; exp += 0.0005) {
    const k = Math.pow(10, exp);
    const { err, wTop } = evalK(k);
    if (err < best.err) best = { err, k, wTop };
  }
  const lo = Math.pow(10, Math.log10(best.k) - 0.001);
  const hi = Math.pow(10, Math.log10(best.k) + 0.001);
  for (let k = lo; k <= hi; k += hi * 1e-8) {
    const { err, wTop } = evalK(k);
    if (err < best.err) best = { err, k, wTop };
  }
  return { k: best.k, wTop: best.wTop };
}

const { k, wTop } = solveCalibration();

export const CALIBRATION = { k, wTop, wBase };

export function profile(h: number): number {
  if (h < 0 || h > HEIGHT_TOP) {
    throw new RangeError(`height ${h} out of range [0, ${HEIGHT_TOP}]`);
  }
  return wTop + (wBase - wTop) * Math.exp(-k * h);
}
