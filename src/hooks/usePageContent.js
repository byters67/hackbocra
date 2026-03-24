/**
 * usePageContent — returns local fallback content immediately (no Supabase fetch)
 */
export default function usePageContent(slug, lang, fallback) {
  return { page: fallback || null, loading: false };
}
