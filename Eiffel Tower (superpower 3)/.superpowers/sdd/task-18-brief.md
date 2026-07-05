### Task 18: Integration Smoke Test

- [ ] **Step 1: Create tests/smoke.test.ts**

```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { JSDOM } from 'jsdom';

describe('smoke', () => {
  let dom: JSDOM;

  beforeAll(() => {
    dom = new JSDOM('<!DOCTYPE html><div id="app"></div>', {
      url: 'http://localhost',
      pretendToBeVisual: true,
    });
    (globalThis as any).window = dom.window;
    (globalThis as any).document = dom.window.document;
    (globalThis as any).HTMLElement = dom.window.HTMLElement;
    (globalThis as any).HTMLCanvasElement = dom.window.HTMLCanvasElement;
    (globalThis as any).HTMLButtonElement = dom.window.HTMLButtonElement;
    (globalThis as any).navigator = dom.window.navigator;
    (globalThis as any).requestAnimationFrame = (cb: FrameRequestCallback) => setTimeout(cb, 16) as unknown as number;
    (globalThis as any).cancelAnimationFrame = (id: number) => clearTimeout(id);
    (globalThis as any).performance = { now: () => Date.now() };

    const getContext = dom.window.HTMLCanvasElement.prototype.getContext;
    dom.window.HTMLCanvasElement.prototype.getContext = function (
      contextId: string,
      options?: any,
    ) {
      if (contextId === 'webgl2' || contextId === 'webgl') return null;
      return getContext.call(this, contextId, options);
    };
  });

  afterAll(() => {
    dom.window.close();
  });

  it('test runner works', () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 2: Run all tests**

```bash
npm test
```

Expected: All tests pass.

- [ ] **Step 3: Run build**

```bash
npm run build
```

Expected: Build succeeds.

- [ ] **Step 4: Commit**

```bash
git add tests/smoke.test.ts
git commit -m "test: add smoke test with jsdom and WebGL mock"
```
