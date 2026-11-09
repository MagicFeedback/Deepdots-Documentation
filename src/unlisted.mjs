// Topics published but not listed: kept out of the topic selector (unless you are already in
// them), the landing cards and the sitemap. Pages also set `pagefind: false` and a robots
// `noindex` meta, so only people with the link find them. Used for early-access products.
export const UNLISTED_TOPICS = [];

// Single pages published but not listed (same treatment, page by page: their frontmatter sets
// `sidebar.hidden`, `pagefind: false` and the robots `noindex` meta). DD-70: the survey version
// compatibility table, unlisted until popup SDK web 1.19.0 / native 0.7.10 are released.
export const UNLISTED_PAGES = ['popup-web/reference/survey-compatibility', 'popup-native/reference/survey-compatibility'];

export const isUnlistedPath = (path) =>
  UNLISTED_TOPICS.some((topic) => new RegExp(`/(es/|da/)?${topic}(/|$)`).test(path)) ||
  UNLISTED_PAGES.some((page) => new RegExp(`/(es/|da/)?${page}/?$`).test(path));
