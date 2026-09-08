/**
 * AegisVault Cryptographic and Password Utility Functions
 */

const CHARSETS = {
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  numbers: '0123456789',
  symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?',
};

/**
 * Generates a cryptographically secure random password using Web Crypto API.
 */
export function generatePassword({
  length = 16,
  uppercase = true,
  lowercase = true,
  numbers = true,
  symbols = true,
} = {}) {
  let pool = '';
  const guaranteed = [];

  if (uppercase) {
    pool += CHARSETS.uppercase;
    guaranteed.push(getRandomChar(CHARSETS.uppercase));
  }
  if (lowercase) {
    pool += CHARSETS.lowercase;
    guaranteed.push(getRandomChar(CHARSETS.lowercase));
  }
  if (numbers) {
    pool += CHARSETS.numbers;
    guaranteed.push(getRandomChar(CHARSETS.numbers));
  }
  if (symbols) {
    pool += CHARSETS.symbols;
    guaranteed.push(getRandomChar(CHARSETS.symbols));
  }

  if (pool.length === 0) {
    pool = CHARSETS.lowercase + CHARSETS.numbers;
    guaranteed.push(getRandomChar(CHARSETS.lowercase));
  }

  const remainingLength = Math.max(0, length - guaranteed.length);
  const randomChars = [];

  const randomValues = new Uint32Array(remainingLength);
  window.crypto.getRandomValues(randomValues);

  for (let i = 0; i < remainingLength; i++) {
    const randomIndex = randomValues[i] % pool.length;
    randomChars.push(pool[randomIndex]);
  }

  const allChars = [...guaranteed, ...randomChars];
  return shuffleArray(allChars).join('');
}

function getRandomChar(str) {
  const array = new Uint32Array(1);
  window.crypto.getRandomValues(array);
  return str[array[0] % str.length];
}

function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const rand = new Uint32Array(1);
    window.crypto.getRandomValues(rand);
    const j = rand[0] % (i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Calculates client-side password entropy and strength metric.
 */
export function evaluatePasswordStrength(password) {
  if (!password) {
    return { score: 0, percent: 0, label: 'Empty', color: '#64748b' };
  }

  let score = 0;
  const len = password.length;

  if (len >= 8) score += 20;
  if (len >= 12) score += 20;
  if (len >= 16) score += 20;

  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 15;
  if (/\d/.test(password)) score += 10;
  if (/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)) score += 15;

  score = Math.min(100, score);

  if (score < 40) {
    return { score, percent: score, label: 'Weak', color: '#f43f5e' };
  } else if (score < 70) {
    return { score, percent: score, label: 'Fair', color: '#f59e0b' };
  } else if (score < 90) {
    return { score, percent: score, label: 'Good', color: '#3b82f6' };
  } else {
    return { score, percent: score, label: 'Strong (High Entropy)', color: '#10b981' };
  }
}

/**
 * Safe clipboard copy utility with fallback.
 */
export async function copyTextToClipboard(text) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand('copy');
      textArea.remove();
      return true;
    }
  } catch (err) {
    console.error('Copy failed:', err);
    return false;
  }
}
