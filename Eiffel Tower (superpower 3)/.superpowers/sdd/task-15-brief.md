### Task 15: UI Components — ThemeToggle, InfoOverlay, LoadingOverlay

- [ ] **Step 1: Create src/ui/ThemeToggle.ts**

```typescript
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
```

- [ ] **Step 2: Create src/ui/InfoOverlay.ts**

```typescript
import {
  HEIGHT_TOTAL,
  HEIGHT_TOP,
  ANTENNA_HEIGHT,
  BASE_HALF_WIDTH,
  PLATFORM_HEIGHTS,
} from '../constants';

export function createInfoOverlay(): { element: HTMLElement; toggle: HTMLElement } {
  const element = document.createElement('div');
  element.style.cssText =
    'position:absolute;bottom:12px;left:12px;padding:10px 12px;' +
    'background:rgba(10,10,18,0.7);color:#e8e8e8;font:13px/1.5 monospace;' +
    'border-radius:6px;max-width:280px;z-index:10;';

  const base = BASE_HALF_WIDTH * 2;
  const [p1, p2, p3] = PLATFORM_HEIGHTS;

  element.innerHTML =
    '<b>Eiffel Tower</b><br>' +
    `Height: ${HEIGHT_TOTAL} m (${HEIGHT_TOP} + ${ANTENNA_HEIGHT} antenna)<br>` +
    `Base: ${base} \u00D7 ${base} m<br>` +
    `Platforms: ${p1} / ${p2} / ${p3} m<br>` +
    '<span style="opacity:0.7">~18,000 iron pieces \u00B7 ~7,300 t</span>';

  const toggle = document.createElement('button');
  toggle.textContent = 'Info';
  toggle.style.cssText =
    'position:absolute;bottom:12px;left:12px;padding:4px 10px;' +
    'background:rgba(10,10,18,0.7);color:#e8e8e8;font:11px monospace;' +
    'border:1px solid #444;border-radius:4px;cursor:pointer;z-index:11;';
  toggle.style.display = 'none';

  element.addEventListener('mouseenter', () => {
    element.style.display = 'none';
    toggle.style.display = 'block';
  });

  toggle.addEventListener('click', () => {
    toggle.style.display = 'none';
    element.style.display = 'block';
  });

  return { element, toggle };
}
```

- [ ] **Step 3: Create src/ui/LoadingOverlay.ts**

```typescript
export function createLoadingOverlay(): HTMLElement {
  const el = document.createElement('div');
  el.style.cssText =
    'position:absolute;inset:0;display:flex;align-items:center;justify-content:center;' +
    'background:rgba(0,0,0,0.85);color:#e8e8e8;font:16px monospace;z-index:20;';
  el.innerHTML = '<span>Building tower\u2026</span>';
  return el;
}
```

- [ ] **Step 4: Commit**

```bash
git add src/ui/ThemeToggle.ts src/ui/InfoOverlay.ts src/ui/LoadingOverlay.ts
git commit -m "feat: add UI components — theme toggle, info overlay, loading overlay"
```
