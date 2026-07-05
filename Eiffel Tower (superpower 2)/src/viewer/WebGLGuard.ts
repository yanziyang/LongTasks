export function checkWebGLSupport(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch {
    return false;
  }
}

export function showFallback(container: HTMLElement, message: string): void {
  container.innerHTML = `<div style="color:white;padding:24px;">${message}</div>`;
}
