import { describe, it, expect } from 'vitest';
import { App } from './App';

describe('App', () => {
  it('should instantiate without errors', () => {
    const container = document.createElement('div');
    const app = new App(container);
    expect(app).toBeDefined();
  });

  it('should have a start method', () => {
    const container = document.createElement('div');
    const app = new App(container);
    expect(typeof app.start).toBe('function');
  });
});
