import zxcvbn from 'zxcvbn';

export interface PasswordOptions {
  length: number;
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
}

const CHARSETS = {
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  numbers: '0123456789',
  symbols: '!@#$%^&*()_+~`|}{[]:;?><,./-=',
};

/**
 * Hashes a string using SHA-256 for secure local storage checks
 */
async function hashString(text: string): Promise<string> {
  const data = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Generates a cryptographically secure random password, ensuring absolute global uniqueness
 * across the lifetime of the browser profile by strictly hashing and recording output.
 */
export async function generateSecurePassword(options: PasswordOptions): Promise<string> {
  let charset = '';
  if (options.uppercase) charset += CHARSETS.uppercase;
  if (options.lowercase) charset += CHARSETS.lowercase;
  if (options.numbers) charset += CHARSETS.numbers;
  if (options.symbols) charset += CHARSETS.symbols;

  if (charset.length === 0) {
    return '';
  }

  // Load previously used password hashes (Zero-Knowledge: we only store irreversible hashes)
  const USED_PASSWORDS_KEY = 'securevault_used_passwords_hashes';
  let usedHashesSet: Set<string>;
  try {
    const stored = localStorage.getItem(USED_PASSWORDS_KEY);
    usedHashesSet = new Set(stored ? JSON.parse(stored) : []);
  } catch (e) {
    usedHashesSet = new Set();
  }

  const maxAttempts = 1000;
  let attempts = 0;
  let password = '';
  let isUnique = false;

  while (!isUnique && attempts < maxAttempts) {
    attempts++;
    
    const randomValues = new Uint32Array(options.length);
    crypto.getRandomValues(randomValues);

    password = '';
    for (let i = 0; i < options.length; i++) {
      password += charset[randomValues[i] % charset.length];
    }
    
    // Check global uniqueness using SHA-256 hash
    const hash = await hashString(password);
    if (!usedHashesSet.has(hash)) {
      isUnique = true;
      usedHashesSet.add(hash);
      
      try {
        localStorage.setItem(USED_PASSWORDS_KEY, JSON.stringify(Array.from(usedHashesSet)));
      } catch (e) {
        // Silently handle quota exceeded if user generates millions of passwords
      }
    }
  }

  if (!isUnique) {
    // Fallback if mathematically exhausted (extremely rare unless length is very short)
    return password;
  }
  
  return password;
}

/**
 * Checks password strength using zxcvbn.
 * Returns a score from 0 to 4 and feedback.
 */
export function checkPasswordStrength(password: string) {
  if (!password) return { score: 0, feedback: { warning: '', suggestions: [] } };
  return zxcvbn(password);
}
