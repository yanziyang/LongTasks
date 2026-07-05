export function createLoadingOverlay(): HTMLElement {
  const overlay = document.createElement('div');
  overlay.textContent = 'Building tower…';
  overlay.style.position = 'absolute';
  overlay.style.inset = '0';
  overlay.style.display = 'flex';
  overlay.style.alignItems = 'center';
  overlay.style.justifyContent = 'center';
  overlay.style.background = 'rgba(0,0,0,0.8)';
  overlay.style.color = 'white';
  overlay.style.zIndex = '20';
  return overlay;
}
