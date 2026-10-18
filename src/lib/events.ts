// Small app-wide signals: replay the entry sequence, fire a meteor, reset the panel layout, show a toast.
const bus = new EventTarget();
type Signal = 'replay' | 'meteor' | 'reset-layout' | 'enter-map';

export const emit = (name: Signal) => bus.dispatchEvent(new Event(name));
export const on = (name: Signal, fn: () => void) => {
  bus.addEventListener(name, fn);
  return () => bus.removeEventListener(name, fn);
};

export const toast = (message: string) => bus.dispatchEvent(new CustomEvent('toast', { detail: message }));
export const onToast = (fn: (message: string) => void) => {
  const handler = (e: Event) => fn((e as CustomEvent<string>).detail);
  bus.addEventListener('toast', handler);
  return () => bus.removeEventListener('toast', handler);
};
