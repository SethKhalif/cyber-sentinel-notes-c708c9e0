import { useEffect, useCallback } from "react";
import { useTheme } from "@/hooks/useTheme";
import { toast } from "sonner";

interface ShortcutActions {
  onCreateNote?: () => void;
  onToggleMode?: () => void;
  onSearch?: () => void;
  onDelete?: () => void;
}

const SHORTCUTS = [
  { keys: "Ctrl+N", mac: "⌘+N", label: "New note" },
  { keys: "Ctrl+M", mac: "⌘+M", label: "Toggle Notes/CVE mode" },
  { keys: "Ctrl+K", mac: "⌘+K", label: "Focus search" },
  { keys: "Ctrl+J", mac: "⌘+J", label: "Toggle theme" },
  { keys: "Ctrl+/", mac: "⌘+/", label: "Show shortcuts" },
];

export function useKeyboardShortcuts(actions: ShortcutActions = {}) {
  const { toggleTheme } = useTheme();

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (!mod) return;

      // Ignore when typing in inputs (unless it's a global shortcut)
      const target = e.target as HTMLElement;
      const isInput = target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable;

      switch (e.key.toLowerCase()) {
        case "n":
          e.preventDefault();
          actions.onCreateNote?.();
          break;
        case "m":
          if (!isInput) {
            e.preventDefault();
            actions.onToggleMode?.();
          }
          break;
        case "k":
          e.preventDefault();
          actions.onSearch?.();
          break;
        case "j":
          if (!isInput) {
            e.preventDefault();
            toggleTheme();
          }
          break;
        case "/":
          if (!isInput) {
            e.preventDefault();
            showShortcutsToast();
          }
          break;
        default:
          break;
      }
    },
    [actions, toggleTheme]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}

function showShortcutsToast() {
  const isMac = navigator.platform.toUpperCase().includes("MAC");
  const lines = SHORTCUTS.map(
    (s) => `${isMac ? s.mac : s.keys} — ${s.label}`
  ).join("\n");
  toast.info("Keyboard Shortcuts", { description: lines, duration: 5000 });
}

export { SHORTCUTS };
