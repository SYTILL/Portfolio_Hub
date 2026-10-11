// SoundCloud's widget API, loaded the first time a track's player is shown.
interface Widget { bind(event: string, fn: () => void): void; unbind(event: string): void }
interface SCApi { Widget: ((el: HTMLIFrameElement) => Widget) & { Events: Record<'PLAY' | 'PAUSE' | 'FINISH', string> } }
declare global { interface Window { SC?: SCApi } }

let loading: Promise<SCApi> | null = null;
export function loadWidgetApi() {
  if (window.SC) return Promise.resolve(window.SC);
  loading ??= new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'https://w.soundcloud.com/player/api.js';
    s.async = true;
    s.onload = () => (window.SC ? resolve(window.SC) : reject(new Error('SoundCloud widget API missing')));
    s.onerror = () => { loading = null; reject(new Error('SoundCloud widget API failed to load')); };
    document.head.appendChild(s);
  });
  return loading;
}

export const embedUrl = (url: string) =>
  `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&color=%23d8bd7e&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false&visual=true`;
