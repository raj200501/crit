// Kept so existing imports don't churn: the heart questions and the cardiology rule set now live in src/lib/packs.
// `reviewItems` here is the cardiology rule set; a tree's own list comes from packFor(tree).reviewItems.
export { HEART_CHOICES } from "./packs/choices";
export { BASIS, CRITERIA_FOOTNOTE, reviewItems } from "./packs/cardiology";
export { FIRST_DEGREE, SECOND_DEGREE, stillToConfirm } from "./packs/shared";
export type { Choice, Flag, Tier } from "./packs/types";
export { isCardiac } from "./conditions";
