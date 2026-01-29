document.addEventListener('DOMContentLoaded', () => {
  const statusEl = document.getElementById('status');
  const checkBtn = document.getElementById('check-page');

  checkBtn?.addEventListener('click', async () => {
    if (statusEl) statusEl.textContent = 'Scanning page for images...';

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab.id) {
        await chrome.tabs.sendMessage(tab.id, { type: 'SCAN_PAGE' });
        if (statusEl) statusEl.textContent = 'Scan complete. Check images for badges.';
      }
    } catch (error) {
      if (statusEl) statusEl.textContent = 'Error scanning page.';
      console.error('[ImGORAI] Scan error:', error);
    }
  });
});
