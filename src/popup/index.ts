document.addEventListener('DOMContentLoaded', () => {
  const statusEl = document.getElementById('status');
  const checkBtn = document.getElementById('check-page');

  checkBtn?.addEventListener('click', async () => {
    if (statusEl) statusEl.textContent = 'Scanning page for images...';

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      console.log('[imgorai] Current tab:', tab);

      if (!tab?.id) {
        if (statusEl) statusEl.textContent = 'No active tab found.';
        return;
      }

      if (tab.url?.startsWith('chrome://') || tab.url?.startsWith('chrome-extension://')) {
        if (statusEl) statusEl.textContent = 'Cannot scan browser pages.';
        return;
      }

      const response = await chrome.tabs.sendMessage(tab.id, { type: 'SCAN_PAGE' });
      console.log('[imgorai] Scan response:', response);
      if (statusEl) statusEl.textContent = 'Scan complete. Check images for badges.';
    } catch (error) {
      console.error('[imgorai] Scan error:', error);
      if (statusEl) statusEl.textContent = 'Reload the page and try again.';
    }
  });
});
