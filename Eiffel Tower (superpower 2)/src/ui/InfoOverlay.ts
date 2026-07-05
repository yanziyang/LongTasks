export function createInfoOverlay(): { element: HTMLElement; toggle: HTMLButtonElement } {
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.bottom = '16px';
  container.style.left = '16px';
  container.style.zIndex = '10';
  container.style.background = 'rgba(0,0,0,0.5)';
  container.style.color = 'white';
  container.style.padding = '12px';
  container.style.borderRadius = '4px';
  container.style.maxWidth = '280px';
  container.innerHTML = `
    <h2>Eiffel Tower</h2>
    <p>Height: 330 m (including antenna)</p>
    <p>Built: 1887–1889</p>
    <p>Located in Paris, France.</p>
  `;

  const toggle = document.createElement('button');
  toggle.textContent = 'ℹ️';
  toggle.style.position = 'absolute';
  toggle.style.bottom = '16px';
  toggle.style.left = '16px';
  toggle.style.zIndex = '11';
  toggle.addEventListener('click', () => {
    container.style.display = container.style.display === 'none' ? 'block' : 'none';
  });

  return { element: container, toggle };
}
