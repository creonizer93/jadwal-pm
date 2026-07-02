export type Region = "kalbar" | "kalteng";

/** Map region → data worksheet name in the spreadsheet. */
export const REGION_SHEETS: Record<Region, string> = {
  kalbar: "Sheet1",
  kalteng: "kalteng",
};

/** Map region → engineer lookup worksheet name. */
export const REGION_ENGINER_SHEETS: Record<Region, string> = {
  kalbar: "Engineer",
  kalteng: "engineer_kalteng",
};

export const REGION_LABELS: Record<Region, string> = {
  kalbar: "Kalbar",
  kalteng: "Kalteng",
};

/** Parse a region from a string, defaulting to Kalbar if invalid/missing. */
export function parseRegion(value: string | null | undefined): Region {
  return value === "kalteng" ? "kalteng" : "kalbar";
}
