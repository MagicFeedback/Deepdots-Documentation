// Topics published but not listed: kept out of the topic selector (unless you are already in
// them), the landing cards and the sitemap. Pages also set `pagefind: false` and a robots
// `noindex` meta, so only people with the link find them. Used for early-access products.
export const UNLISTED_TOPICS = [];

export const isUnlistedPath = (path) =>
  UNLISTED_TOPICS.some((topic) => new RegExp(`/(es/|da/)?${topic}(/|$)`).test(path));
