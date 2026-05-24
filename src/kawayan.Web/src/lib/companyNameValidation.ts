const LATIN_NAME = /^[A-Za-z0-9\s.\-'&,()]+$/;
const BAYBAYIN = /[\u1700-\u171F]/;

export function isValidLatinName(value: string) {
  const trimmed = value.trim();
  return trimmed.length > 0 && LATIN_NAME.test(trimmed) && !BAYBAYIN.test(trimmed);
}

export function hasBaybayinChars(value: string) {
  return BAYBAYIN.test(value);
}

export function companyNameInitials(nameMain?: string, fallback = 'Co') {
  return (nameMain?.trim() || fallback)
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}
