import { App } from './App';
import { checkWebGLSupport, showFallback } from './viewer/WebGLGuard';

const container = document.getElementById('app');
if (!container) {
  throw new Error('App container not found');
}

if (!checkWebGLSupport()) {
  showFallback(container, 'WebGL is not supported in this browser.');
} else {
  const app = new App(container);
  app.start();
}
