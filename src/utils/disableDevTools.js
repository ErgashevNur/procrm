const isLocalhost = () =>
  ['localhost', '127.0.0.1', '[::1]'].includes(window.location.hostname);

export function disableDevTools() {
  if (isLocalhost()) return;

  // O'ng tugma menyusini o'chirish (Inspect Element)
  document.addEventListener('contextmenu', (e) => e.preventDefault());

  // F12, Ctrl+Shift+I/J/C/K, Ctrl+U, Mac: Cmd+Option+I/J/C
  document.addEventListener(
    'keydown',
    (e) => {
      const key = e.key.toUpperCase();
      const blocked =
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && ['I', 'J', 'C', 'K'].includes(key)) ||
        (e.ctrlKey && key === 'U') ||
        (e.metaKey && e.altKey && ['I', 'J', 'C'].includes(key));

      if (blocked) {
        e.preventDefault();
        e.stopPropagation();
      }
    },
    true
  );

  // Console metodlarini o'chirish
  const noop = () => undefined;
  const methods = ['log', 'warn', 'error', 'info', 'debug', 'table', 'dir', 'trace', 'group', 'groupEnd'];
  methods.forEach((m) => {
    if (typeof console[m] === 'function') console[m] = noop;
  });

  // DevTools ochilganligini aniqlash (oyna o'lchami farqi orqali)
  const check = () => {
    const widthDiff = window.outerWidth - window.innerWidth > 200;
    const heightDiff = window.outerHeight - window.innerHeight > 200;
    if (widthDiff || heightDiff) {
      document.body.innerHTML = '';
      window.location.replace(window.location.href);
    }
  };
  setInterval(check, 1000);
}
