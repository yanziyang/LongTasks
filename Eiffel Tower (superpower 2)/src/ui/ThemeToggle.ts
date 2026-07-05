export function createThemeToggle(onToggle: () => void): HTMLButtonElement {
  const button = document.createElement('button');
  button.textContent = '☀️';
  button.style.position = 'absolute';
  button.style.top = '16px';
  button.style.right = '16px';
  button.style.zIndex = '10';
  button.addEventListener('click', () => {
    onToggle();
    button.textContent = button.textContent === '☀️' ? '🌙' : '☀️';
  });
  return button;
}
