export function createDayNightToggle(
  parent: HTMLElement,
  onToggle: (night: boolean) => void,
): { el: HTMLButtonElement } {
  const el = document.createElement('button');
  el.textContent = 'Night';
  el.style.cssText =
    'position:absolute;top:12px;right:12px;padding:8px 14px;' +
    'background:rgba(10,10,18,0.7);color:#e8e8e8;font:13px monospace;' +
    'border:1px solid #444;border-radius:6px;cursor:pointer;';
  let night = false;
  el.addEventListener('click', () => {
    night = !night;
    el.textContent = night ? 'Day' : 'Night';
    onToggle(night);
  });
  parent.appendChild(el);
  return { el };
}
