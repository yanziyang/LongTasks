### Task 16: App — Top-Level Controller

- [ ] **Step 1: Create src/App.ts**

```typescript
import { Viewer } from './viewer/Viewer';
import { createThemeToggle } from './ui/ThemeToggle';
import { createInfoOverlay } from './ui/InfoOverlay';
import { createLoadingOverlay } from './ui/LoadingOverlay';

export class App {
  private viewer: Viewer;
  private loading: HTMLElement;
  private isDay = true;
  private infoOverlay: HTMLElement | null = null;
  private infoToggle: HTMLElement | null = null;
  private themeBtn: HTMLElement | null = null;

  constructor(private container: HTMLElement) {
    this.container.style.position = 'relative';
    this.loading = createLoadingOverlay();
    this.container.appendChild(this.loading);

    this.viewer = new Viewer(this.container);

    this.setupUI();
    this.setupKeyboard();
  }

  private setupUI(): void {
    this.themeBtn = createThemeToggle(() => {
      this.toggleTheme();
    });
    this.container.appendChild(this.themeBtn);

    const { element, toggle } = createInfoOverlay();
    this.infoOverlay = element;
    this.infoToggle = toggle;
    this.container.appendChild(element);
    this.container.appendChild(toggle);
  }

  private toggleTheme(): void {
    this.isDay = !this.isDay;
    this.viewer.setTheme(this.isDay ? 'day' : 'night');
  }

  private setupKeyboard(): void {
    this.container.tabIndex = 0;
    this.container.addEventListener('keydown', (event) => {
      switch (event.key.toLowerCase()) {
        case 'r':
          this.viewer.resetCamera();
          break;
        case 't':
          this.toggleTheme();
          break;
        case 'i':
          if (this.infoOverlay && this.infoToggle) {
            if (this.infoOverlay.style.display === 'none') {
              this.infoOverlay.style.display = 'block';
              this.infoToggle.style.display = 'none';
            } else {
              this.infoOverlay.style.display = 'none';
              this.infoToggle.style.display = 'block';
            }
          }
          break;
      }
    });
  }

  start(): void {
    requestAnimationFrame(() => {
      this.viewer.start();
      if (this.loading.parentNode) {
        this.container.removeChild(this.loading);
      }
    });
  }

  dispose(): void {
    this.viewer.dispose();
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/App.ts
git commit -m "feat: add App controller with keyboard shortcuts and UI wiring"
```
