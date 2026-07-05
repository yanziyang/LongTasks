import {
  HEIGHT_TOTAL,
  HEIGHT_TOP,
  ANTENNA_HEIGHT,
  BASE_HALF_WIDTH,
  PLATFORM_HEIGHTS,
} from '../constants';

export function createOverlay(parent: HTMLElement): { el: HTMLElement } {
  const el = document.createElement('div');
  el.style.cssText =
    'position:absolute;top:12px;left:12px;padding:10px 12px;' +
    'background:rgba(10,10,18,0.7);color:#e8e8e8;font:13px/1.5 monospace;' +
    'border-radius:6px;pointer-events:none;max-width:240px;';

  const base = BASE_HALF_WIDTH * 2;
  const [p1, p2, p3] = PLATFORM_HEIGHTS;

  el.innerHTML =
    `<b>Eiffel Tower</b><br>` +
    `Height: ${HEIGHT_TOTAL} m (${HEIGHT_TOP} + ${ANTENNA_HEIGHT} antenna)<br>` +
    `Base: ${base} × ${base} m<br>` +
    `Platforms: ${p1} / ${p2} / ${p3} m<br>` +
    `<span style="opacity:0.7">~18,000 iron pieces · ~7,300 t</span>`;

  parent.appendChild(el);
  return { el };
}
