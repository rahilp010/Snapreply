// src/content/editable-detection.ts

export type EditableType = 'input' | 'textarea' | 'contenteditable' | 'none';

export interface EditableTarget {
  element: HTMLElement | null;
  type: EditableType;
  isReadOnly: boolean;
  canInsert: boolean;
}

/**
 * Identifies whether an element or the currently focused element can safely accept text insertion.
 */
export function detectEditableElement(target?: Element | null): EditableTarget {
  const el = (target || document.activeElement) as HTMLElement | null;

  if (!el || el === document.body || el === document.documentElement) {
    // Try to find if active selection is inside a contenteditable
    const sel = window.getSelection();
    if (sel && sel.anchorNode) {
      const parent = sel.anchorNode.parentElement;
      const editableParent = parent?.closest('[contenteditable="true"], [role="textbox"], textarea, input') as HTMLElement | null;
      if (editableParent) {
        return analyzeElement(editableParent);
      }
    }
    return { element: null, type: 'none', isReadOnly: false, canInsert: false };
  }

  return analyzeElement(el);
}

function analyzeElement(el: HTMLElement): EditableTarget {
  // Input fields
  if (el instanceof HTMLInputElement) {
    const validTypes = ['text', 'search', 'email', 'url', 'tel', 'password'];
    if (validTypes.includes(el.type.toLowerCase())) {
      const isReadOnly = el.readOnly || el.disabled;
      return {
        element: el,
        type: 'input',
        isReadOnly,
        canInsert: !isReadOnly,
      };
    }
    return { element: el, type: 'none', isReadOnly: false, canInsert: false };
  }

  // Textareas
  if (el instanceof HTMLTextAreaElement) {
    const isReadOnly = el.readOnly || el.disabled;
    return {
      element: el,
      type: 'textarea',
      isReadOnly,
      canInsert: !isReadOnly,
    };
  }

  // ContentEditable / Rich text editors
  const isContentEditable =
    el.isContentEditable ||
    el.getAttribute('contenteditable') === 'true' ||
    el.getAttribute('role') === 'textbox' ||
    el.classList.contains('ProseMirror') ||
    el.classList.contains('public-DraftEditor-content');

  if (isContentEditable) {
    const isReadOnly = el.getAttribute('aria-readonly') === 'true';
    return {
      element: el,
      type: 'contenteditable',
      isReadOnly,
      canInsert: !isReadOnly,
    };
  }

  return { element: el, type: 'none', isReadOnly: false, canInsert: false };
}
