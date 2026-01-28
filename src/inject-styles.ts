const STYLE_ID = 'dream-grid-styles';

const CSS = `
.dg-container {
  width: 100%;
  position: relative;
  contain: strict;
}
.dg-item {
  position: absolute;
  contain: layout style paint;
  will-change: transform;
}`;

let injected = false;

export function injectStyles() {
  if (injected || typeof document === 'undefined') return;
  if (document.getElementById(STYLE_ID)) {
    injected = true;
    return;
  }
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = CSS;
  document.head.appendChild(style);
  injected = true;
}
