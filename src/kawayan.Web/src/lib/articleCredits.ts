import { BLOGS_CREDITS_CATEGORY } from '@/lib/blogLabels';

function formatArticleDate(iso?: string | null) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
}

export function formatArticleCredits(fullName?: string | null, publishedAt?: string | null) {
  const parts: string[] = [];
  const name = fullName?.trim();
  if (name) parts.push(`By ${name}`);
  const date = formatArticleDate(publishedAt);
  if (date) parts.push(date);
  parts.push(BLOGS_CREDITS_CATEGORY);
  return parts.join(' · ');
}
