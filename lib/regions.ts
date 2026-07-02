export type Region = "kalbar" | "kalteng" | "kalsel";

/** Map region → data worksheet name in the spreadsheet. */
export const REGION_SHEETS: Record<Region, string> = {
  kalbar: "Sheet1",
  kalteng: "kalteng",
  kalsel: "kalsel",
};

/** Map region → engineer lookup worksheet name. */
export const REGION_ENGINER_SHEETS: Record<Region, string> = {
  kalbar: "Engineer",
  kalteng: "engineer_kalteng",
  kalsel: "engineer_kalsel",
};

export const REGION_LABELS: Record<Region, string> = {
  kalbar: "Kalbar",
  kalteng: "Kalteng",
  kalsel: "Kalsel",
};

export const REGION_TABS: Region[] = ["kalbar", "kalteng", "kalsel"];

/** Parse a region from a string, defaulting to Kalbar if invalid/missing. */
export function parseRegion(value: string | null | undefined): Region {
  return (value && REGION_SHEETS.hasOwnProperty(value))
    ? (value as Region)
    : "kalbar";
}
