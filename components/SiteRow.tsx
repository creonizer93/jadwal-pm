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

export default function SiteRow({
  rowIndex,
  type,
  site_id,
  tower_name,
  jadwal,
  onChange,
  isTarget = false,
  isDone = false,
  moSite = "",
}: SiteRowProps) {
  const [value, setValue] = useState(jadwal);
  const [focused, setFocused] = useState(false);
  const isFilled = value.trim() !== "";

  const accentColor = type === "MR" ? "#007aff" : "#af52de";
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
      className={`glass-card flex items-center gap-3 p-4 ${
        isDone ? "opacity-60" : ""
      } ${!isFilled && !isDone && focused ? "ring-2 ring-[#007aff] ring-offset-2 ring-offset-[#f2f2f7]" : ""}`}
    >
      {/* Left accent bar */}
      <div
        className="h-full w-1 shrink-0 self-stretch rounded-full"
        style={{ backgroundColor: statusColor }}
      />

      {/* Tower info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <div className="truncate text-[15px] font-[590] tracking-[-0.23px] text-[#1c1c1e]">
            {tower_name}
          </div>
          {isDone && (
            <span className="shrink-0 rounded-full bg-[#34c759]/12 px-2 py-0.5 text-[10px] font-[590] text-[#34c759]">
              ✓ DONE
            </span>
          )}
        </div>
        <div className="mt-0.5 flex items-center gap-2">
          <span className="text-[13px] tracking-[-0.08px] text-[#8e8e93]">
            {site_id}
          </span>
          <span
            className="rounded-full px-2 py-0.5 text-[10px] font-[590]"
            style={{
              backgroundColor: `${accentColor}12`,
              color: accentColor,
            }}
          >
            {type}
          </span>
          {moSite && (
            <span className="truncate rounded-full bg-[rgba(118,118,128,0.08)] px-2 py-0.5 text-[10px] text-[#8e8e93] max-w-[120px]">
              {moSite}
            </span>
          )}
        </div>
      </div>

      {/* Date input */}
      <div className="flex items-center gap-2">
        {isDone ? (
          <span className="rounded-xl bg-[#34c759]/8 px-3 py-2 text-[15px] font-[590] tracking-[-0.23px] text-[#34c759]">
            {value || "-"}
          </span>
        ) : (
          <div className="relative">
            {!isFilled && (
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-[13px] text-[#aeaeb2]">
                📅
              </span>
            )}
            <input
              type="date"
              value={value}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              onChange={(e) => {
                setValue(e.target.value);
                onChange(rowIndex, e.target.value);
              }}
              className={`rounded-xl border bg-white/60 px-3 py-2 text-[15px] tracking-[-0.23px] outline-none backdrop-blur-sm transition-all ${
                isFilled
                  ? "border-[#34c759] bg-[#34c759]/8 text-[#34c759]"
                  : focused
                    ? "border-[#007aff] bg-[#007aff]/8 ring-1 ring-[#007aff]"
                    : "border-[rgba(118,118,128,0.16)] bg-[rgba(118,118,128,0.04)] text-[#8e8e93]"
              } ${!isFilled ? "pl-8" : ""}`}
              placeholder="yyyy-mm-dd"
            />
          </div>
        )}
        {isFilled && (
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#34c759] text-[13px] text-white">
            ✓
          </span>
        )}
      </div>
    </div>
  );
}
