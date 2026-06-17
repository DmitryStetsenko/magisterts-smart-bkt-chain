// Helper to generate HTML-friendly element IDs from titles
export const getSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9а-яєіїґ\s-]/g, '')
    .replace(/\s+/g, '-');
};

// Helper to check if item is a valid displayable card
export const isValidItem = (item: any): boolean => {
  if (!item) return false;
  if (item.type === 'kv') {
    return !!(item.key && item.key.trim() !== '');
  }
  return !!(item.raw_text && item.raw_text.trim() !== '' && item.raw_text.trim() !== '---');
};
