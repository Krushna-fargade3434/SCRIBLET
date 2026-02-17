import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { registerSW } from "virtual:pwa-register";

// Initialize dark mode from localStorage
const theme = localStorage.getItem('theme');
if (theme === 'dark') {
  document.documentElement.classList.add('dark');
} else if (theme === 'light') {
  document.documentElement.classList.remove('dark');
} else {
  // Default to light mode if no preference
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  if (prefersDark) {
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  }
}

// Register service worker with better offline capabilities
const updateSW = registerSW({
  immediate: true,
  onNeedRefresh() {
    if (confirm("New content available. Reload to update?")) {
      updateSW(true);
    }
  },
  onOfflineReady() {
    console.log("✅ App ready to work offline");
    // Optional: Show a toast notification
    const event = new CustomEvent("offline-ready");
    window.dispatchEvent(event);
  },
  onRegistered(registration) {
    console.log("✅ Service Worker registered successfully");
    // Check for updates every hour
    if (registration) {
      setInterval(() => {
        registration.update();
      }, 60 * 60 * 1000);
    }
  },
  onRegisterError(error) {
    console.error("❌ Service Worker registration failed:", error);
  },
});

// Handle offline/online events
window.addEventListener("online", () => {
  console.log("🌐 Back online");
});

window.addEventListener("offline", () => {
  console.log("📵 Gone offline - cached content available");
});

createRoot(document.getElementById("root")!).render(<App />);
