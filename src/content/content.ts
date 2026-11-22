// src/content/content.ts
// Ensure process.env polyfill exists in browser content script context
if (typeof window !== 'undefined') {
  (window as any).process = (window as any).process || { env: { NODE_ENV: 'production' } };
}

import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import { getSelectionInfo } from './selection';
import { insertTextSafely } from './insertion';
import { getSettings, onSettingsChanged } from '../shared/storage';
import { UserSettings, ExtensionMessage } from '../shared/types';
import { QuickActionBubble } from './overlay/QuickActionBubble';
import { OverlayView } from './overlay/OverlayView';
import { FloatingOrbWidget } from './overlay/FloatingOrbWidget';
import { isQuestionText } from '../shared/prompts';

class SnapReplyContentApp {
  private shadowHost: HTMLElement | null = null;
  private shadowRoot: ShadowRoot | null = null;
  private reactRoot: Root | null = null;
  private settings: UserSettings | null = null;

  private isOverlayOpen = false;
  private isBubbleVisible = false;
  private hasSelection = false;
  private isQuestion = false;
  private bubbleLabel = '';
  private currentSelectionText = '';
  private bubblePosition = { x: 0, y: 0 };
  private overlayPosition = { x: 0, y: 0 };

  async init() {
    this.settings = await getSettings();

    // Listen for setting changes
    onSettingsChanged((newSettings) => {
      this.settings = newSettings;
      this.render();
    });

    this.createShadowDOM();
    this.attachEventListeners();
    this.listenToExtensionMessages();

    // Immediately render floating orb & widgets on page load!
    this.render();
  }

  private createShadowDOM() {
    if (document.getElementById('snapreply-host')) {
      return;
    }

    this.shadowHost = document.createElement('div');
    this.shadowHost.id = 'snapreply-host';
    this.shadowHost.style.position = 'fixed';
    this.shadowHost.style.top = '0';
    this.shadowHost.style.left = '0';
    this.shadowHost.style.width = '0';
    this.shadowHost.style.height = '0';
    this.shadowHost.style.zIndex = '2147483647';
    this.shadowHost.style.pointerEvents = 'none';

    this.shadowRoot = this.shadowHost.attachShadow({ mode: 'open' });

    // Inject stylesheet link
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = chrome?.runtime?.getURL ? chrome.runtime.getURL('content/content.css') : '';
    this.shadowRoot.appendChild(link);

    // Also fetch CSS text and inject as <style> for zero-delay Shadow DOM styling
    try {
      if (chrome?.runtime?.getURL) {
        const cssUrl = chrome.runtime.getURL('content/content.css');
        fetch(cssUrl)
          .then((res) => {
            if (res.ok) return res.text();
            throw new Error('css fetch failed');
          })
          .then((css) => {
            if (this.shadowRoot) {
              const style = document.createElement('style');
              style.textContent = css;
              this.shadowRoot.appendChild(style);
            }
          })
          .catch(() => {});
      }
    } catch {}

    // Mount point
    const mountPoint = document.createElement('div');
    mountPoint.id = 'snapreply-mount';
    mountPoint.style.pointerEvents = 'auto';

    // Apply dark class if system / user prefers dark
    if (this.settings?.theme === 'dark' || (this.settings?.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      mountPoint.classList.add('dark');
    }

    this.shadowRoot.appendChild(mountPoint);

    // Safely append to document body or documentElement
    const mountHost = () => {
      const parent = document.body || document.documentElement;
      if (parent && !parent.contains(this.shadowHost)) {
        parent.appendChild(this.shadowHost);
      }
    };

    if (document.body || document.documentElement) {
      mountHost();
    } else {
      document.addEventListener('DOMContentLoaded', mountHost);
    }

    this.reactRoot = createRoot(mountPoint);
  }

  private render() {
    if (!this.reactRoot || !this.settings) return;

    this.reactRoot.render(
      React.createElement(
        React.Fragment,
        null,
        // Persistent Draggable Floating Orb with Red Selection Badge
        this.settings.floatingActionEnabled !== false
          ? React.createElement(FloatingOrbWidget, {
              hasSelection: this.hasSelection,
              isQuestion: this.isQuestion,
              selectedTextLength: this.currentSelectionText.length,
              isOverlayOpen: this.isOverlayOpen,
              onToggle: () => {
                if (this.isOverlayOpen) {
                  this.isOverlayOpen = false;
                  this.render();
                } else {
                  this.openOverlay(this.currentSelectionText);
                }
              },
            })
          : null,
        // Floating Quick Action Capsule near highlighted text
        this.isBubbleVisible && !this.isOverlayOpen && this.settings.floatingActionEnabled
          ? React.createElement(QuickActionBubble, {
              x: this.bubblePosition.x,
              y: this.bubblePosition.y,
              isQuestion: this.isQuestion,
              label: this.bubbleLabel,
              onOpen: () => this.openOverlay(this.currentSelectionText, this.bubblePosition.x, this.bubblePosition.y),
              onDismiss: () => {
                this.isBubbleVisible = false;
                this.render();
              },
            })
          : null,
        // Full Rounded Shape Popup Modal
        this.isOverlayOpen
          ? React.createElement(OverlayView, {
              initialText: this.currentSelectionText,
              initialX: this.overlayPosition.x,
              initialY: this.overlayPosition.y,
              settings: this.settings,
              onClose: () => {
                this.isOverlayOpen = false;
                this.render();
              },
            })
          : null
      )
    );
  }

  private openOverlay(text?: string, x?: number, y?: number) {
    let targetText = (text && text.trim()) ? text.trim() : (this.currentSelectionText && this.currentSelectionText.trim()) ? this.currentSelectionText.trim() : '';
    if (!targetText) {
      const info = getSelectionInfo();
      if (info.hasSelection && info.text.trim()) {
        targetText = info.text.trim();
      } else {
        const sel = window.getSelection()?.toString()?.trim();
        if (sel) {
          targetText = sel;
        }
      }
    }

    if (targetText) {
      this.currentSelectionText = targetText;
      this.hasSelection = true;
      this.isQuestion = isQuestionText(targetText);
    }

    this.isBubbleVisible = false;
    this.isOverlayOpen = true;

    const posX = x !== undefined ? Math.min(x, window.innerWidth - 440) : window.innerWidth / 2 - 215;
    const posY = y !== undefined ? Math.min(y, window.innerHeight - 560) : 90;
    this.overlayPosition = { x: Math.max(20, posX), y: Math.max(20, posY) };

    this.render();
  }

  private attachEventListeners() {
    // Continuously capture selection on change, mouseup, and keyboard selection
    const recordSelection = () => {
      const info = getSelectionInfo();
      if (info.hasSelection && info.text.trim().length > 0) {
        const text = info.text.trim();
        this.hasSelection = true;
        this.currentSelectionText = text;
        const isQ = isQuestionText(text);
        this.isQuestion = isQ;
        this.bubbleLabel = isQ ? 'Answer Question with SnapReply...' : 'Reply with SnapReply...';

        if (typeof chrome !== 'undefined' && chrome?.storage?.local) {
          chrome.storage.local.set({
            snapreply_last_selection: text,
            snapreply_is_question: isQ,
            snapreply_selection_timestamp: Date.now(),
          });
        }
        this.render();
      } else {
        if (this.hasSelection) {
          this.hasSelection = false;
          this.render();
        }
      }
    };

    document.addEventListener('selectionchange', () => {
      setTimeout(recordSelection, 20);
    });
    document.addEventListener('keyup', recordSelection);

    // Copy event listener: automatically detect copied questions!
    document.addEventListener('copy', () => {
      setTimeout(() => {
        const info = getSelectionInfo();
        const copied = info.text || window.getSelection()?.toString()?.trim() || '';
        if (copied && copied.length > 2) {
          const isQ = isQuestionText(copied);
          this.hasSelection = true;
          this.currentSelectionText = copied;
          this.isQuestion = isQ;
          this.bubbleLabel = isQ ? 'Answer Copied Question...' : 'Reply to Copied Message...';

          if (typeof chrome !== 'undefined' && chrome?.storage?.local) {
            chrome.storage.local.set({
              snapreply_last_selection: copied,
              snapreply_is_question: isQ,
              snapreply_selection_timestamp: Date.now(),
            });
          }

          // If copied text is a question and floating action is enabled, show bubble!
          if (isQ && this.settings?.floatingActionEnabled && !this.isOverlayOpen) {
            this.bubblePosition = {
              x: window.innerWidth / 2,
              y: 80,
            };
            this.isBubbleVisible = true;
          }
          this.render();
        }
      }, 30);
    });

    // Selection listener for floating bubble
    document.addEventListener('mouseup', (e) => {
      // Don't trigger if click occurred inside SnapReply shadow DOM
      if (this.shadowHost?.contains(e.target as Node)) return;

      setTimeout(() => {
        const info = getSelectionInfo();
        if (info.hasSelection && info.text.trim().length > 2 && this.settings?.floatingActionEnabled && !this.isOverlayOpen) {
          this.hasSelection = true;
          this.currentSelectionText = info.text.trim();
          const isQ = isQuestionText(this.currentSelectionText);
          this.isQuestion = isQ;
          this.bubbleLabel = isQ ? 'Answer Question with SnapReply...' : 'Reply with SnapReply...';
          recordSelection();

          if (info.rect) {
            this.bubblePosition = {
              x: info.rect.left + info.rect.width / 2,
              y: info.rect.top,
            };
          } else {
            this.bubblePosition = { x: e.clientX, y: e.clientY };
          }
          this.isBubbleVisible = true;
          this.render();
        } else if (!info.hasSelection) {
          this.hasSelection = false;
          if (this.isBubbleVisible) {
            this.isBubbleVisible = false;
          }
          this.render();
        }
      }, 50);
    });
  }

  private listenToExtensionMessages() {
    if (typeof chrome === 'undefined' || !chrome?.runtime?.onMessage) return;

    chrome.runtime.onMessage.addListener(
      (message: ExtensionMessage<any>, _sender, sendResponse) => {
        switch (message.type) {
          case 'GET_SELECTION': {
            const info = getSelectionInfo();
            const text = (info.hasSelection && info.text) ? info.text : this.currentSelectionText;
            sendResponse({ text });
            break;
          }

          case 'OPEN_OVERLAY': {
            const text = message.payload?.text || getSelectionInfo().text;
            this.openOverlay(text);
            sendResponse({ success: true });
            break;
          }

          case 'INSERT_TEXT': {
            const textToInsert = message.payload?.text;
            if (textToInsert) {
              insertTextSafely(textToInsert).then((result) => {
                sendResponse(result);
              });
              return true; // asynchronous response
            }
            sendResponse({ success: false, reason: 'No text provided.' });
            break;
          }
        }
      }
    );
  }
}

// Start content script app safely
const app = new SnapReplyContentApp();
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    app.init().catch(console.error);
  });
} else {
  app.init().catch(console.error);
}
