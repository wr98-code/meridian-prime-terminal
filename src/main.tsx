import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// ── Service Worker (PWA offline support) ──────────────────────────────────────
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}

// ── CSS Houdini Paint Worklet ─────────────────────────────────────────────────
if ('paintWorklet' in CSS) {
  (CSS as unknown as { paintWorklet: { addModule: (url: string) => void } })
    .paintWorklet.addModule('/houdini/zmPaint.js');
}

createRoot(document.getElementById("root")!).render(<App />);
