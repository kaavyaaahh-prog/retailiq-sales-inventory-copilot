import { UserProfile, StoreLocationProfile } from '../types';

export const DEFAULT_USER_PROFILE: UserProfile = {
  name: 'Vikram Sharma',
  email: 'vikram.sharma@retailiq.internal',
  initials: 'VS',
  role: 'Store Manager',
};

export const DEFAULT_STORE_PROFILE: StoreLocationProfile = {
  rawLocation: 'BR-042 (Indiranagar Central)',
  storeName: 'RetailIQ Supermarket',
  branchName: 'Indiranagar Central Branch',
  fullBranchDisplayName: 'RetailIQ Supermarket – Indiranagar Central Branch',
  storeId: 'BR-042',
  posTerminal: 'BR-042 (Terminal A-102)',
};

/**
 * Extracts store branch name, store ID, and formatted POS terminal string
 * from a user-entered store location / branch ID string.
 *
 * Examples:
 * - "BR-042 (Indiranagar Central)" -> branch: "Indiranagar Central", id: "BR-042"
 * - "Indiranagar Central (BR-042)" -> branch: "Indiranagar Central", id: "BR-042"
 * - "BR-042 - Indiranagar Central" -> branch: "Indiranagar Central", id: "BR-042"
 * - "Koramangala 4th Block" -> branch: "Koramangala 4th Block", id: "RT-KORAMANGALA"
 * - "BR-109" -> branch: "Branch BR-109", id: "BR-109"
 */
export function extractStoreProfileFromLocation(
  locationInput?: string
): StoreLocationProfile {
  const raw = (locationInput || '').trim();
  if (!raw) {
    return { ...DEFAULT_STORE_PROFILE };
  }

  let storeId = '';
  let branchName = '';

  // Helper to check if a token looks like a Store/Branch ID code
  const isIdLike = (str: string): boolean => {
    const s = str.trim();
    if (/^[A-Za-z]{1,4}[-_#]?\d{1,6}[A-Za-z]?$/i.test(s)) return true;
    if (/^(BR|RT|STR|STORE|LOC|ID|BLR|MUM|DEL|HYD)[-_#]?\w+/i.test(s)) return true;
    if (/^#?\d{2,6}$/.test(s)) return true;
    return false;
  };

  // Helper to normalize an ID code (e.g. "#42" -> "STR-42", "42" -> "BR-042")
  const formatId = (str: string): string => {
    const s = str.trim();
    if (s.startsWith('#')) return `STR-${s.slice(1)}`;
    if (/^\d+$/.test(s)) return `BR-${s.padStart(3, '0')}`;
    return s.toUpperCase();
  };

  // Pattern 1: Parentheses, e.g. "BR-042 (Indiranagar Central)" or "Indiranagar Central (BR-042)"
  const parenMatch = raw.match(/^([^(]+)\s*\(([^)]+)\)$/);
  if (parenMatch) {
    const part1 = parenMatch[1].trim();
    const part2 = parenMatch[2].trim();

    if (isIdLike(part1)) {
      storeId = formatId(part1);
      branchName = part2;
    } else if (isIdLike(part2)) {
      storeId = formatId(part2);
      branchName = part1;
    } else {
      // Fallback: shorter part is ID, longer is branch name
      if (part1.length <= part2.length) {
        storeId = formatId(part1);
        branchName = part2;
      } else {
        storeId = formatId(part2);
        branchName = part1;
      }
    }
  }

  // Pattern 2: Separators like " - ", " / ", " : ", " , "
  if (!branchName) {
    const parts = raw.split(/\s*[-/:]\s*/).map((p) => p.trim()).filter(Boolean);
    if (parts.length >= 2) {
      if (isIdLike(parts[0])) {
        storeId = formatId(parts[0]);
        branchName = parts.slice(1).join(' - ');
      } else if (isIdLike(parts[parts.length - 1])) {
        storeId = formatId(parts[parts.length - 1]);
        branchName = parts.slice(0, -1).join(' - ');
      } else {
        branchName = parts.join(' - ');
      }
    }
  }

  // Pattern 3: Single string or no separator matched
  if (!branchName) {
    if (isIdLike(raw)) {
      storeId = formatId(raw);
      branchName = `Branch ${storeId}`;
    } else {
      branchName = raw;
    }
  }

  // If no storeId extracted, derive one cleanly from the branch name
  if (!storeId) {
    const words = branchName.replace(/[^A-Za-z0-9\s]/g, '').split(/\s+/).filter(Boolean);
    if (words.length > 0) {
      const first = words[0].toUpperCase();
      storeId = `RT-${first.slice(0, 8)}`;
    } else {
      storeId = 'RT-560038';
    }
  }

  // Clean branchName
  const cleanBranch = branchName.trim() || 'Central Branch';

  const fullBranchDisplayName = cleanBranch.toLowerCase().includes('retailiq')
    ? cleanBranch
    : `RetailIQ Supermarket – ${cleanBranch}`;

  const posTerminal = `${storeId} (Terminal A-102)`;

  return {
    rawLocation: raw,
    storeName: 'RetailIQ Supermarket',
    branchName: cleanBranch,
    fullBranchDisplayName,
    storeId,
    posTerminal,
  };
}

/**
 * Extracts a formatted human-readable display name and initials from an email address or username.
 * 
 * Examples:
 * - "priya.nair@retailiq.internal" -> Name: "Priya Nair", Initials: "PN"
 * - "vikram.sharma@retailiq.internal" -> Name: "Vikram Sharma", Initials: "VS"
 * - "rahul.sharma@retailiq.internal" -> Name: "Rahul Sharma", Initials: "RS"
 * - "tanvanth.kaviya@gmail.com" -> Name: "Tanvanth Kaviya", Initials: "TK"
 * - "alex_turner@company.com" -> Name: "Alex Turner", Initials: "AT"
 * - "john-smith@store.com" -> Name: "John Smith", Initials: "JS"
 * - "anita@retailiq.internal" -> Name: "Anita", Initials: "AN"
 */
export function extractUserProfileFromEmail(
  emailInput: string,
  role: string = 'Store Manager'
): UserProfile {
  const raw = (emailInput || '').trim();
  if (!raw) {
    return { ...DEFAULT_USER_PROFILE, role };
  }

  // Extract the local part before @ if present
  const usernamePart = raw.includes('@') ? raw.split('@')[0] : raw;

  // Insert space between lower to upper transitions for camelCase (e.g. "priyaNair" -> "priya Nair")
  const withSpaces = usernamePart.replace(/([a-z])([A-Z])/g, '$1 $2');

  // Split by common delimiters: dot, underscore, hyphen, plus, space
  const tokens = withSpaces.split(/[._\-+\s]+/).filter(Boolean);

  const formattedWords: string[] = [];
  for (const token of tokens) {
    // Strip trailing digits (e.g. "nair2026" -> "nair", "john2" -> "john")
    const cleaned = token.replace(/\d+$/, '');
    const word = cleaned.length > 0 ? cleaned : token;
    if (word) {
      formattedWords.push(
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      );
    }
  }

  let displayName = '';
  let initials = '';

  if (formattedWords.length >= 2) {
    displayName = formattedWords.join(' ');
    // Initials from first and last word
    const firstChar = formattedWords[0].charAt(0).toUpperCase();
    const lastChar = formattedWords[formattedWords.length - 1].charAt(0).toUpperCase();
    initials = `${firstChar}${lastChar}`;
  } else if (formattedWords.length === 1) {
    displayName = formattedWords[0];
    initials =
      formattedWords[0].length >= 2
        ? formattedWords[0].slice(0, 2).toUpperCase()
        : formattedWords[0].toUpperCase();
  } else {
    displayName = 'Store Manager';
    initials = 'SM';
  }

  return {
    name: displayName,
    email: raw,
    initials,
    role,
  };
}
