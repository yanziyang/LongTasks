import { Viewer } from './viewer/Viewer';
import { createThemeToggle } from './ui/ThemeToggle';
import { createInfoOverlay } from './ui/InfoOverlay';
import { createLoadingOverlay } from './ui/LoadingOverlay';

export class App {
  private viewer: Viewer;
  private loading: HTMLElement;
  private isDay = true;
  private infoOverlay: HTMLElement | null = null;

  constructor(private container: HTMLElement) {
    this.container.style.position = 'relative';
    this.loading = createLoadingOverlay();
    this.container.appendChild(this.loading);

    this.viewer = new Viewer(this.container);

    this.setupUI();
    this.setupKeyboard();
  }

  private setupUI(): void {
    const themeToggle = createThemeToggle(() => {
      this.toggleTheme();
    });
    this.container.appendChild(themeToggle);

    const { element: info, toggle: infoToggle } = createInfoOverlay();
    this.infoOverlay = info;
    this.container.appendChild(info);
    this.container.appendChild(infoToggle);
  }

  private toggleTheme(): void {
    this.isDay = !this.isDay;
    this.viewer.setTheme(this.isDay ? 'day' : 'night');
  }

  private setupKeyboard(): void {
    this.container.addEventListener('keydown', (event) => {
      switch (event.key.toLowerCase()) {
        case 'r':
          this.viewer.resetCamera();
          break;
        case 't':
          this.toggleTheme();
          break;
        case 'i':
          if (this.infoOverlay) {
            this.infoOverlay.style.display =
              this.infoOverlay.style.display === 'none' ? 'block' : 'none';
          }
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
