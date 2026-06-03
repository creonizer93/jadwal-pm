"use client";

import { useState } from "react";

interface SiteRowProps {
  rowIndex: number;
  type: "MR" | "VW";
  site_id: string;
  tower_name: string;
  jadwal: string;
  onChange: (rowIndex: number, value: string) => void;
  isTarget?: boolean;
  isDone?: boolean;
  moSite?: string;
}

function formatSiteId(raw: string): string {
  const m = raw.match(/^([A-Z]+)-(\d+)-(.+)$/);
  if (m) return `${m[1]} ${m[2]}‑${m[3]}`;
  return raw;
}

export default function SiteRow({
  rowIndex,
  type,
  site_id,
  tower_name,
  jadwal,
  onChange,
  isTarget = false,
  isDone = false,
}: SiteRowProps) {
  const [value, setValue] = useState(jadwal);
  const [focused, setFocused] = useState(false);
  const isFilled = value.trim() !== "";

  const typeColor = type === "MR" ? "#007aff" : "#af52de";
  const statusColor = isDone
    ? "#34c759"
    : isFilled
      ? "#ff9500"
      : "rgba(118,118,128,0.2)";

  return (
    <div
      id={isTarget ? "first-unfilled" : undefined}
      ref={(el) => {
        if (isTarget && el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }}
      className={`glass-card p-3 ${
        isDone ? "opacity-60" : ""
      } ${!isFilled && !isDone && focused ? "ring-2 ring-[#007aff] ring-offset-1 ring-offset-[#f2f2f7]" : ""}`}
    >
      {/* Row 1: Nama Site */}
      <div className="flex items-center gap-2">
        <div
          className="h-2 w-2 shrink-0 rounded-full"
          style={{ backgroundColor: statusColor }}
        />
        <span className="text-[14px] font-[590] tracking-[-0.2px] text-[#1c1c1e]">
          {tower_name}
        </span>
        {isDone && (
          <span className="shrink-0 rounded bg-[#34c759]/12 px-1 py-px text-[9px] font-[590] text-[#34c759]">
            ✓
          </span>
        )}
      </div>

      {/* Row 2: Site ID - type + date */}
      <div className="mt-1.5 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-[12px] tracking-[-0.06px] text-[#8e8e93]">
            {formatSiteId(site_id)}
          </span>
          <span className="text-[12px] tracking-[-0.06px] text-[#aeaeb2]">—</span>
          <span
            className="shrink-0 rounded px-1.5 py-px text-[10px] font-[590]"
            style={{ backgroundColor: `${typeColor}16`, color: typeColor }}
          >
            {type}
          </span>
        </div>

        {isDone ? (
          <span className="rounded-lg bg-[#34c759]/8 px-2 py-1 text-[13px] font-[590] tracking-[-0.08px] text-[#34c759]">
            {value || "-"}
          </span>
        ) : (
          <div className="flex items-center gap-1.5">
            <input
              type="date"
              value={value}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              onChange={(e) => {
                setValue(e.target.value);
                onChange(rowIndex, e.target.value);
              }}
              className={`w-[128px] rounded-lg border bg-white/60 px-2 py-1 text-[13px] tracking-[-0.08px] outline-none text-center ${
                isFilled
                  ? "border-[#34c759] bg-[#34c759]/8 text-[#34c759]"
                  : focused
                    ? "border-[#007aff] bg-[#007aff]/8 ring-1 ring-[#007aff]"
                    : "border-[rgba(118,118,128,0.14)] bg-[rgba(118,118,128,0.04)] text-[#aeaeb2]"
              }`}
            />
            {isFilled && (
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#34c759] text-[11px] text-white">
                ✓
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
