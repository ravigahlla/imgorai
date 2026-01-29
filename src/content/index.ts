import type { VerificationStatus } from '../lib/c2pa';

const BADGE_CLASS = 'imgorai-badge';
const VERIFIED_CLASS = 'imgorai-verified';
const UNVERIFIED_CLASS = 'imgorai-unverified';
const NO_CREDENTIALS_CLASS = 'imgorai-no-credentials';

interface VerifyResponse {
  success: boolean;
  status?: VerificationStatus;
  error?: string;
}

async function verifyImageElement(img: HTMLImageElement): Promise<void> {
  if (img.dataset.imgoraiChecked) return;
  img.dataset.imgoraiChecked = 'true';

  const imageUrl = img.src || img.currentSrc;
  if (!imageUrl || imageUrl.startsWith('data:image/svg')) return;

  try {
    const response: VerifyResponse = await chrome.runtime.sendMessage({
      type: 'VERIFY_IMAGE',
      imageUrl,
    });

    if (response.success && response.status) {
      addBadge(img, response.status);
    }
  } catch (error) {
    console.error('[ImGORAI] Failed to verify image:', error);
  }
}

function addBadge(img: HTMLImageElement, status: VerificationStatus): void {
  const wrapper = document.createElement('div');
  wrapper.style.position = 'relative';
  wrapper.style.display = 'inline-block';

  const badge = document.createElement('div');
  badge.className = BADGE_CLASS;

  if (!status.hasCredentials) {
    badge.classList.add(NO_CREDENTIALS_CLASS);
    badge.title = 'No C2PA credentials';
    badge.textContent = '?';
  } else if (status.isValid) {
    badge.classList.add(VERIFIED_CLASS);
    badge.title = `Verified${status.issuer ? ` by ${status.issuer}` : ''}`;
    badge.textContent = '✓';
  } else {
    badge.classList.add(UNVERIFIED_CLASS);
    badge.title = `Invalid: ${status.errors.join(', ')}`;
    badge.textContent = '✗';
  }

  img.parentNode?.insertBefore(wrapper, img);
  wrapper.appendChild(img);
  wrapper.appendChild(badge);
}

function observeImages(): void {
  // Check existing images
  document.querySelectorAll<HTMLImageElement>('img').forEach(verifyImageElement);

  // Observe new images
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (node instanceof HTMLImageElement) {
          verifyImageElement(node);
        } else if (node instanceof Element) {
          node.querySelectorAll<HTMLImageElement>('img').forEach(verifyImageElement);
        }
      }
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

// Inject styles
const styles = document.createElement('style');
styles.textContent = `
  .${BADGE_CLASS} {
    position: absolute;
    top: 4px;
    right: 4px;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: bold;
    color: white;
    z-index: 10000;
    cursor: pointer;
    box-shadow: 0 2px 4px rgba(0,0,0,0.3);
  }
  .${VERIFIED_CLASS} { background: #22c55e; }
  .${UNVERIFIED_CLASS} { background: #ef4444; }
  .${NO_CREDENTIALS_CLASS} { background: #6b7280; }
`;
document.head.appendChild(styles);

// Start observing when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', observeImages);
} else {
  observeImages();
}
