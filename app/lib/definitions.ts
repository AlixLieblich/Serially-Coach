// TypeScript shapes for Serially Coach’s Postgres data and UI.
// Use these in serial.ts, server actions, and components so queries and props
// stay aligned with tables like bag_styles, month_codes, year_codes, and place_codes.

// =========================
// CORE TABLES
// =========================

export type BagStyle = {
  bag_styles_id: number;
  style_number: string;
  style_name: string | null;
  category: string | null;
  production_start: number | null;
  production_end: number | null;
  notes: string | null;
};

export type BagColor = {
  bag_color_id: number;
  name: string;
};

export type BagStyleColor = {
  bag_styles_id: number; // references bag_styles.bag_styles_id
  bag_color_id: number; // references bag_colors.bag_color_id
};

// =========================
// LOOKUP TABLES (if still used)
// =========================

export type MonthCode = {
  code: string;
  month_name: string;
};

export type YearCode = {
  code: string;
  year: number;
};

export type PlaceCode = {
  code: string;
  location: string;
  notes: string | null;
};

// =========================
// JOINED / UI TYPES
// =========================

// Style with resolved colors (for frontend display)
export type StyleWithColors = {
  bag_styles_id: number;
  style_number: string;
  style_name: string | null;
  category: string | null;
  production_start: number | null;
  production_end: number | null;
  notes: string | null;
  colors: string[]; // resolved from join table
};

// Lightweight dropdown / selector type
export type StyleOption = {
  bag_styles_id: number;
  style_number: string;
  style_name: string | null;
};

// =========================
// FORM TYPES
// =========================

export type StyleForm = {
  style_number: string;
  style_name?: string;
  category?: string;
  production_start?: number;
  production_end?: number;
  notes?: string;
  colors: string[];
};

export type SerialLookupResult = {
  month: string;
  year: string;
  style: string;
  category: string;
  productionStart: string;
  productionEnd: string;
  colors: string[];
};

export type User = {
  id: string;
  name: string;
  email: string;
  password: string;
};

export type UserBag = {
  serial_number: string;
  notes: string | null;
  created_at: Date;
};

