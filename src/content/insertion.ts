// src/content/insertion.ts
import { detectEditableElement } from './editable-detection';
import { copyToClipboard } from '../shared/utils/clipboard';
import { InsertResult } from '../shared/types';

/**
 * Safely inserts text into the active editable element.
 * STRICT SAFETY RULE: NEVER triggers Enter, submit buttons, form submissions, or auto-send!
 */
export async function insertTextSafely(text: string): Promise<InsertResult> {
  if (!text) {
    return { success: false, fallbackToCopy: false, reason: 'No text provided for insertion.' };
  }

  const target = detectEditableElement();

  // If no editable target or read-only, copy to clipboard
  if (!target.canInsert || !target.element) {
    await copyToClipboard(text);
    return {
      success: false,
      fallbackToCopy: true,
      reason: target.isReadOnly
        ? 'Field is read-only. Reply copied to clipboard instead!'
        : 'No editable field focused. Reply copied to clipboard instead!',
    };
  }

  const el = target.element;

  try {
    if (target.type === 'input' || target.type === 'textarea') {
      const inputEl = el as HTMLInputElement | HTMLTextAreaElement;
      inputEl.focus();

      const start = inputEl.selectionStart ?? inputEl.value.length;
      const end = inputEl.selectionEnd ?? inputEl.value.length;

      // Use modern setRangeText if available
      if (typeof inputEl.setRangeText === 'function') {
        inputEl.setRangeText(text, start, end, 'end');
      } else {
        const val = inputEl.value;
        inputEl.value = val.substring(0, start) + text + val.substring(end);
        inputEl.selectionStart = inputEl.selectionEnd = start + text.length;
      }

      // Dispatch standard InputEvent so React / Vue state updates cleanly
      inputEl.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
      inputEl.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));

      return { success: true, fallbackToCopy: false };
    }

    if (target.type === 'contenteditable') {
      el.focus();

      // Use document.execCommand('insertText') for native browser undo history
      const execSuccess = document.execCommand('insertText', false, text);

      if (!execSuccess) {
        // Fallback: Range insertion
        const sel = window.getSelection();
        if (sel && sel.rangeCount > 0) {
          const range = sel.getRangeAt(0);
          range.deleteContents();
          const textNode = document.createTextNode(text);
          range.insertNode(textNode);

          // Move cursor to end of inserted node
          range.setStartAfter(textNode);
          range.setEndAfter(textNode);
          sel.removeAllRanges();
          sel.addRange(range);
        } else {
          el.appendChild(document.createTextNode(text));
        }
      }

      // Notify host page framework of content mutation
      el.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
      return { success: true, fallbackToCopy: false };
    }
  } catch (err) {
    console.warn('[SnapReply] Insertion error, falling back to copy:', err);
  }

  // Graceful fallback to clipboard copy
  await copyToClipboard(text);
  return {
    success: false,
    fallbackToCopy: true,
    reason: 'Could not directly insert into this rich editor. Copied to clipboard!',
  };
}
