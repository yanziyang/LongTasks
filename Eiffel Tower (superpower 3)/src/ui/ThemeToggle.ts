export function createThemeToggle(onToggle: () => void): HTMLElement {
  const el = document.createElement('button');
  el.textContent = '\u2600 Day';
  el.style.cssText =
    'position:absolute;top:12px;right:12px;padding:8px 14px;' +
    'background:rgba(10,10,18,0.7);color:#e8e8e8;font:13px monospace;' +
    'border:1px solid #444;border-radius:6px;cursor:pointer;z-index:10;';

  let isNight = false;
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;

  el.addEventListener('click', () => {
    if (debounceTimer) return;
    debounceTimer = setTimeout(() => { debounceTimer = null; }, 300);

    isNight = !isNight;
    el.textContent = isNight ? '\uD83C\uDF19 Night' : '\u2600 Day';
    onToggle();
  });

  return el;
}
