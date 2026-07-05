### Task 17: main.ts with WebGL Check

- [ ] **Step 1: Create src/main.ts**

```typescript
import { App } from './App';

function isWebGLAvailable(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(canvas.getContext('webgl2') || canvas.getContext('webgl'));
  } catch {
    return false;
  }
}

function showFallback(container: HTMLElement): void {
  container.innerHTML = '';
  container.style.cssText =
    'display:flex;align-items:center;justify-content:center;' +
    'color:white;font:16px monospace;background:#0a0a0a;height:100%;';
  container.textContent = 'Your browser does not support WebGL. Please use a modern browser.';
}

const container = document.getElementById('app');
if (!container) throw new Error('#app container not found');

if (!isWebGLAvailable()) {
  showFallback(container);
} else {
  const app = new App(container);
  app.start();
}
```

- [ ] **Step 2: Verify build compiles**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add src/main.ts
git commit -m "feat: add main entry point with WebGL support check"
```
