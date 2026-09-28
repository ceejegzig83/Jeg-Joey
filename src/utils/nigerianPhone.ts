import { VTUNetwork } from '../types';

/**
 * Nigerian Phone Number Validation & Normalization Utility
 * Accepts:
 *  080xxxxxxxx
 *  081xxxxxxxx
 *  070xxxxxxxx
 *  071xxxxxxxx
 *  090xxxxxxxx
 *  091xxxxxxxx
 * Also normalizes +234 / 234 international format into 11-digit local Nigerian format.
 */

export const NIGERIAN_PHONE_REGEX = /^0(70|71|80|81|90|91)\d{8}$/;

export const NETWORK_PREFIXES: Record<VTUNetwork, string[]> = {
  MTN: [
    '0803', '0806', '0703', '0704', '0706', '0810', '0813', '0814', '0816',
    '0903', '0906', '0913', '0916'
  ],
  AIRTEL: [
    '0802', '0808', '0701', '0708', '0812', '0901', '0902', '0904', '0907', '0912', '0911'
  ],
  GLO: [
    '0805', '0807', '0705', '0811', '0815', '0905', '0915'
  ],
  '9MOBILE': [
    '0809', '0817', '0818', '0908', '0909'
  ]
};

/**
 * Normalizes a user-entered Nigerian phone number string to 11 digits (e.g. 08012345678).
 */
export function normalizeNigerianPhone(raw: string): string {
  if (!raw) return '';
  // Strip spaces, dashes, parentheses
  let cleaned = raw.replace(/[\s\-().]/g, '');
  if (cleaned.startsWith('+234')) {
    cleaned = '0' + cleaned.slice(4);
  } else if (cleaned.startsWith('234') && cleaned.length === 13) {
    cleaned = '0' + cleaned.slice(3);
  }
  return cleaned;
}

/**
 * Validates whether a phone number is a valid 11-digit Nigerian mobile number
 * starting with 080, 081, 070, 071, 090, or 091.
 */
export function validateNigerianPhone(raw: string): {
  isValid: boolean;
  normalized: string;
  detectedNetwork: VTUNetwork | null;
  error?: string;
} {
  const normalized = normalizeNigerianPhone(raw);

  if (!normalized) {
    return {
      isValid: false,
      normalized,
      detectedNetwork: null,
      error: 'Please enter a recipient Nigerian phone number.'
    };
  }

  if (!/^\d+$/.test(normalized)) {
    return {
      isValid: false,
      normalized,
      detectedNetwork: null,
      error: 'Phone number must contain digits only.'
    };
  }

  if (normalized.length !== 11) {
    return {
      isValid: false,
      normalized,
      detectedNetwork: null,
      error: `Nigerian phone number must be 11 digits (currently ${normalized.length} digits).`
    };
  }

  if (!NIGERIAN_PHONE_REGEX.test(normalized)) {
    return {
      isValid: false,
      normalized,
      detectedNetwork: null,
      error: 'Must start with a valid Nigerian mobile prefix: 080, 081, 070, 071, 090, or 091.'
    };
  }

  const prefix4 = normalized.slice(0, 4);
  let detectedNetwork: VTUNetwork | null = null;
  (Object.keys(NETWORK_PREFIXES) as VTUNetwork[]).forEach((net) => {
    if (NETWORK_PREFIXES[net].includes(prefix4)) {
      detectedNetwork = net;
    }
  });

  return {
    isValid: true,
    normalized,
    detectedNetwork
  };
}
