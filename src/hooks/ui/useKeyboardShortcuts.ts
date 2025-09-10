import { useEffect } from 'react';

interface KeyboardShortcutConfig {
  key: string;
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
  callback: () => void;
  enabled?: boolean;
}

export const useKeyboardShortcuts = (shortcuts: KeyboardShortcutConfig[]) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      shortcuts.forEach(({ key, ctrl, alt, shift, callback, enabled = true }) => {
        if (!enabled) return;

        const isCtrlPressed = ctrl ? event.ctrlKey || event.metaKey : !event.ctrlKey && !event.metaKey;
        const isAltPressed = alt ? event.altKey : !event.altKey;
        const isShiftPressed = shift ? event.shiftKey : !event.shiftKey;
        const isKeyPressed = event.key.toLowerCase() === key.toLowerCase();

        if (isCtrlPressed && isAltPressed && isShiftPressed && isKeyPressed) {
          event.preventDefault();
          callback();
        }
      });
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
};

// Common keyboard shortcuts
export const KEYBOARD_SHORTCUTS = {
  COPY: { key: 'c', ctrl: true },
  PASTE: { key: 'v', ctrl: true },
  SAVE: { key: 's', ctrl: true },
  ESCAPE: { key: 'Escape' },
  ENTER: { key: 'Enter' },
  ARROW_LEFT: { key: 'ArrowLeft' },
  ARROW_RIGHT: { key: 'ArrowRight' },
  ARROW_UP: { key: 'ArrowUp' },
  ARROW_DOWN: { key: 'ArrowDown' },
  TAB: { key: 'Tab' },
  SPACE: { key: ' ' },
} as const;