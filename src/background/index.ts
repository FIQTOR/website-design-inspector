/**
 * Service Worker (Manifest V3 Background Script)
 * Facilitates tab lifecycle, messaging relays, and storage defaults.
 */

chrome.runtime.onInstalled.addListener(() => {
  console.log('[Website Design Inspector] Installed successfully.');
  chrome.storage.local.set({
    isInspecting: false,
    recentInspections: []
  });
});

// Reset inspecting state when tab navigation occurs
chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status === 'loading') {
    chrome.tabs.sendMessage(tabId, { type: 'STOP_INSPECTION' }).catch(() => {
      // Ignored if tab hasn't loaded content script yet
    });
  }
});

// Relay messages if needed between popup and active tab
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'RELAY_TO_ACTIVE_TAB') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length > 0 && tabs[0].id) {
        chrome.tabs.sendMessage(tabs[0].id, message.payload, (response) => {
          sendResponse(response);
        });
      } else {
        sendResponse({ error: 'No active tab found' });
      }
    });
    return true; // Keep message channel open for async response
  }
});

