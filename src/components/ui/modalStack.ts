// Open modal <dialog>s, topmost last. A modal dialog makes everything outside it inert and sits in the top layer, so
// anything that must stay visible and clickable while one is open (the Toaster) renders inside the topmost one.

let stack: HTMLDialogElement[] = [];
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export function pushModal(d: HTMLDialogElement) {
  stack = [...stack.filter((x) => x !== d), d];
  emit();
}

export function popModal(d: HTMLDialogElement) {
  if (!stack.includes(d)) return;
  stack = stack.filter((x) => x !== d);
  emit();
}

export function subscribeModals(l: () => void) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

export const topModal = (): HTMLDialogElement | null => stack[stack.length - 1] ?? null;
