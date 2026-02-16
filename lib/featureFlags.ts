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
