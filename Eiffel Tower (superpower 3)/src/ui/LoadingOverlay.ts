export function createLoadingOverlay(): HTMLElement {
  const el = document.createElement('div');
  el.style.cssText =
    'position:absolute;inset:0;display:flex;align-items:center;justify-content:center;' +
    'background:rgba(0,0,0,0.85);color:#e8e8e8;font:16px monospace;z-index:20;';
  el.innerHTML = '<span>Building tower\u2026</span>';
  return el;
}
