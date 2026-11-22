// src/content/selection.ts

export interface SelectionInfo {
  text: string;
  rect: DOMRect | null;
  hasSelection: boolean;
}

/**
 * Accurately extracts currently selected text and its bounding box for positioning UI.
 * Supports window.getSelection(), inputs, textareas, and contenteditable elements.
 */
export function getSelectionInfo(): SelectionInfo {
  // 1. Try standard window.getSelection()
  const selection = window.getSelection();

  if (selection && !selection.isCollapsed && selection.rangeCount > 0) {
    const rawText = selection.toString();
    const text = rawText.trim();

    if (text) {
      try {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        return {
          text,
          rect,
          hasSelection: true,
        };
      } catch {
        return {
          text,
          rect: null,
          hasSelection: true,
        };
      }
    }
  }

  // 2. Fallback: Check if document.activeElement is an input or textarea with highlighted text
  const activeEl = document.activeElement as HTMLInputElement | HTMLTextAreaElement | null;
  if (
    activeEl &&
    (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA') &&
    typeof activeEl.selectionStart === 'number' &&
    typeof activeEl.selectionEnd === 'number' &&
    activeEl.selectionStart !== activeEl.selectionEnd
  ) {
    const start = Math.min(activeEl.selectionStart, activeEl.selectionEnd);
    const end = Math.max(activeEl.selectionStart, activeEl.selectionEnd);
    const text = activeEl.value.substring(start, end).trim();

    if (text) {
      return {
        text,
        rect: activeEl.getBoundingClientRect(),
        hasSelection: true,
      };
    }
  }

  return {
    text: '',
    rect: null,
    hasSelection: false,
  };
}
