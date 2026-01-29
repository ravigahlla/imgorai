import { verifyImage, parseVerificationResult, VerificationStatus } from '../lib/c2pa';

interface VerifyMessage {
  type: 'VERIFY_IMAGE';
  imageUrl: string;
}

interface VerifyResponse {
  success: boolean;
  status?: VerificationStatus;
  error?: string;
}

chrome.runtime.onMessage.addListener(
  (message: VerifyMessage, _sender, sendResponse: (response: VerifyResponse) => void) => {
    if (message.type === 'VERIFY_IMAGE') {
      handleVerification(message.imageUrl)
        .then(sendResponse)
        .catch((error) => {
          sendResponse({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        });
      return true; // Keep message channel open for async response
    }
  }
);

async function handleVerification(imageUrl: string): Promise<VerifyResponse> {
  // Validate URL before processing
  if (!isValidImageUrl(imageUrl)) {
    return {
      success: false,
      error: 'Invalid image URL',
    };
  }

  const result = await verifyImage(imageUrl);
  const status = parseVerificationResult(result);

  return {
    success: true,
    status,
  };
}

function isValidImageUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:', 'data:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}
