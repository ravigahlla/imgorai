import { createC2pa, C2paReadResult } from 'c2pa';

let c2paInstance: Awaited<ReturnType<typeof createC2pa>> | null = null;

export async function initC2pa(): Promise<void> {
  if (!c2paInstance) {
    c2paInstance = await createC2pa({
      wasmSrc: chrome.runtime.getURL('wasm/toolkit_bg.wasm'),
      workerSrc: chrome.runtime.getURL('wasm/c2pa.worker.min.js'),
    });
  }
}

export async function verifyImage(imageUrl: string): Promise<C2paReadResult | null> {
  if (!c2paInstance) {
    await initC2pa();
  }

  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status}`);
    }

    const blob = await response.blob();
    const result = await c2paInstance!.read(blob);
    return result;
  } catch (error) {
    console.error('[ImGORAI] Verification failed:', error);
    return null;
  }
}

export interface VerificationStatus {
  hasCredentials: boolean;
  isValid: boolean;
  issuer?: string;
  timestamp?: string;
  errors: string[];
}

export function parseVerificationResult(result: C2paReadResult | null): VerificationStatus {
  if (!result || !result.manifestStore) {
    return {
      hasCredentials: false,
      isValid: false,
      errors: ['No C2PA credentials found'],
    };
  }

  const activeManifest = result.manifestStore.activeManifest;
  if (!activeManifest) {
    return {
      hasCredentials: false,
      isValid: false,
      errors: ['No active manifest found'],
    };
  }

  const validationStatus = result.manifestStore.validationStatus || [];
  const errors = validationStatus
    .filter((s) => s.code !== 'claimSignature.validated')
    .map((s) => s.explanation || s.code);

  return {
    hasCredentials: true,
    isValid: errors.length === 0,
    issuer: activeManifest.signatureInfo?.issuer,
    timestamp: activeManifest.signatureInfo?.time,
    errors,
  };
}
