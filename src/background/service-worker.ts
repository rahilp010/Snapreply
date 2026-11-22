// src/background/service-worker.ts
import { ExtensionMessage } from '../shared/types';

// Setup Context Menus & First-run Onboarding
chrome.runtime.onInstalled.addListener((details) => {
  // Context menus
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: 'snapreply_root',
      title: 'SnapReply',
      contexts: ['selection'],
    });

    chrome.contextMenus.create({
      parentId: 'snapreply_root',
      id: 'snapreply_reply',
      title: 'Reply to selected message',
      contexts: ['selection'],
    });

    chrome.contextMenus.create({
      parentId: 'snapreply_root',
      id: 'snapreply_rewrite',
      title: 'Rewrite with SnapReply',
      contexts: ['selection'],
    });

    chrome.contextMenus.create({
      parentId: 'snapreply_root',
      id: 'snapreply_summarize',
      title: 'Summarize selection',
      contexts: ['selection'],
    });

    chrome.contextMenus.create({
      parentId: 'snapreply_root',
      id: 'snapreply_explain',
      title: 'Explain in simple terms',
      contexts: ['selection'],
    });
  });

  // Auto-inject content scripts into already open tabs so they work immediately
  chrome.tabs.query({ url: ['http://*/*', 'https://*/*'] }, (tabs) => {
    for (const tab of tabs) {
      if (tab.id) {
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['content/content.js'],
        }).catch(() => {
          // Ignore tabs that cannot be scripted (e.g. Chrome Web Store)
        });
      }
    }
  });

  // Open Onboarding on first install
  if (details.reason === 'install') {
    chrome.tabs.create({
      url: chrome.runtime.getURL('onboarding/index.html'),
    });
  }
});

// Handle Context Menu item clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (!tab?.id) return;

  const selectedText = info.selectionText || '';
  const message: ExtensionMessage<{ text: string; actionId: string }> = {
    type: 'OPEN_OVERLAY',
    payload: {
      text: selectedText,
      actionId: String(info.menuItemId),
    },
    source: 'background',
  };

  chrome.tabs.sendMessage(tab.id, message).catch((err) => {
    console.warn('[SnapReply] Could not send message to tab content script:', err);
  });
});

// Handle Keyboard Shortcuts
chrome.commands.onCommand.addListener((command) => {
  if (command === 'reply_selected') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs[0];
      if (activeTab?.id) {
        chrome.tabs.sendMessage(activeTab.id, {
          type: 'OPEN_OVERLAY',
          source: 'background',
        }).catch(console.warn);
      }
    });
  }
});
