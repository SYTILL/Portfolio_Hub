// One polite live region for screen-reader announcements (panel moved, etc.).
let region: HTMLDivElement | null = null;

export function announce(message: string) {
  if (!region) {
    region = document.createElement('div');
    region.className = 'sr';
    region.setAttribute('aria-live', 'polite');
    document.body.appendChild(region);
  }
  region.textContent = message;
}
