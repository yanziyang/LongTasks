import { App } from './App';

const container = document.getElementById('app');
if (!container) {
  throw new Error('App container not found');
}

const app = new App(container);
app.start();
