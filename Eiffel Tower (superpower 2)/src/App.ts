import { Viewer } from './viewer/Viewer';
import { createThemeToggle } from './ui/ThemeToggle';
import { createInfoOverlay } from './ui/InfoOverlay';
import { createLoadingOverlay } from './ui/LoadingOverlay';

export class App {
  private viewer: Viewer;
  private loading: HTMLElement;

  constructor(private container: HTMLElement) {
    this.container.style.position = 'relative';
    this.loading = createLoadingOverlay();
    this.container.appendChild(this.loading);

    this.viewer = new Viewer(this.container);

    this.setupUI();
    this.setupKeyboard();
  }

  private setupUI(): void {
    let isDay = true;
    const themeToggle = createThemeToggle(() => {
      isDay = !isDay;
      this.viewer.setTheme(isDay ? 'day' : 'night');
    });
    this.container.appendChild(themeToggle);

    const { element: info, toggle: infoToggle } = createInfoOverlay();
    this.container.appendChild(info);
    this.container.appendChild(infoToggle);
  }

  private setupKeyboard(): void {
    this.container.addEventListener('keydown', (event) => {
      switch (event.key.toLowerCase()) {
        case 'r':
          this.viewer.resetCamera();
          break;
        case 't':
          this.viewer.setTheme('day');
          break;
        case 'i':
          break;
      }
    });
    this.container.tabIndex = 0;
  }

  start(): void {
    requestAnimationFrame(() => {
      this.viewer.start();
      this.container.removeChild(this.loading);
    });
  }

  dispose(): void {
    this.viewer.dispose();
  }
}
