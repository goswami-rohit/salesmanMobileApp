// src/components/ReusableConstants.tsx
// Reusable constants in forms
export const DEALER_TYPES = [ "Dealer-Best", "Sub Dealer-Best", "Dealer-Non Best", "Sub Dealer-Non Best",] as const;
export const BRANDS = ["Star", "Amrit", "Dalmia", "Topcem", "Black Tiger", "Surya Gold", "Max", "Taj", "Specify in remarks"];
export const UNITS = ["MT", "KG", "Bags"] as const;
export const FEEDBACKS = ["Interested", "Not Interested", "Follow-up Required"];

// Dynamically fetch area and regions of dealers/sub dealers from NEON later
export const REGIONS = ["Kamrup M", "Kamrup", "Karbi Anglong", "Dehmaji"];
export const AREAS = ["Guwahati", "Beltola", "Zoo Road", "Tezpur", "Diphu", "Nagaon", "Barpeta"];

// TVR specific consts
export const INFLUENCERS = [
  "Contractor",
  "Engineer",
  "Architect",
  "Mason",
  "Builder",
  "Petty Contractor",
];

export const QUALITY_COMPLAINT = [
  "Slow Setting",
  "Low weight",
  "Colour issues",
  "Cracks",
  "Miscellaneous",
];

export const PROMO_ACTIVITY = [
  "Mason Meet",
  "Table meet / Counter meet",
  "Mega mason meet",
  "Engineer meet",
  "Consumer Camp",
  "Miscellaneous",
];

export const CHANNEL_PARTNER_VISIT = [
  "Dealer Visit",
  "Sub dealer",
  "Authorized retailers",
  "Other Brand counters",
];
// end TVR specific consts

// New constants for PJP Form
export const PJP_STATUS = ["planned", "active", "completed", "cancelled"] as const;
