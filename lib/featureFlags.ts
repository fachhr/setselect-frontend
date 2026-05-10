/**
 * Market availability. Set to `false` to instantly disable a market
 * without reverting code or touching the database.
 */
export const MARKET_FLAGS = {
  bulgaria: true,
} as const;

/**
 * Sidebar filter visibility on the homepage card view.
 * Set to `true` to re-enable a filter in the sidebar.
 * These flags do NOT affect the table-view column filters.
 */
export const SIDEBAR_FILTERS = {
  workEligibility: false,
  salary: false,
  expertise: false,
} as const;

/** Candidate detail modal sections. Set to `true` to re-enable. */
export const CANDIDATE_DETAIL = {
  highlight: false,
} as const;
