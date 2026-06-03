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

  const borderColor = isDone
    ? "border-l-[#0ea56b]"
    : isFilled
      ? "border-l-[#f59e0b]"
      : type === "MR"
        ? "border-l-[#1d72f5]"
        : "border-l-[#8b5cf6]";

  const bgColor = isDone ? "bg-green-50/50" : "";

  return (
    <div
      id={isTarget ? "first-unfilled" : undefined}
      ref={(el) => {
        if (isTarget && el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }}
      className={`flex items-center gap-3 rounded-xl border-l-4 bg-white p-4 shadow-sm transition-all ${bgColor} ${borderColor} ${!isFilled && !isDone && focused ? "ring-2 ring-[#1d72f5] ring-offset-1" : ""}`}
    >
      {/* Tower info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <div className="truncate text-sm font-semibold text-[#111827]">
            {tower_name}
          </div>
          {isDone && (
            <span className="shrink-0 rounded bg-[#0ea56b] px-1.5 py-0.5 text-[10px] font-bold text-white">
              ✓ DONE
            </span>
          )}
        </div>
        <div className="mt-0.5 flex items-center gap-2">
          <span className="text-xs text-[#6b7280]">{site_id}</span>
          <span
            className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
              type === "MR"
                ? "bg-blue-100 text-[#1d72f5]"
                : "bg-purple-100 text-[#8b5cf6]"
            }`}
          >
            {type}
          </span>
          {moSite && (
            <span className="truncate rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-[#6b7280] max-w-[120px]">
              {moSite}
            </span>
          )}
        </div>
      </div>

      {/* Date input */}
      <div className="flex items-center gap-2">
        {isDone ? (
          <span className="rounded-lg bg-green-50 px-2 py-1.5 text-sm font-medium text-[#0ea56b]">
            {value || "-"}
          </span>
        ) : (
          <div className="relative">
            {!isFilled && (
              <span className="pointer-events-none absolute inset-y-0 left-2 flex items-center text-xs text-[#b0b7c3]">
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
              className={`rounded-lg border bg-gray-50 px-2 py-1.5 text-sm outline-none transition-all ${
                isFilled
                  ? "border-[#0ea56b] bg-green-50 text-[#0ea56b]"
                  : focused
                    ? "border-[#1d72f5] bg-blue-50 ring-1 ring-[#1d72f5]"
                    : "animate-pulse border-amber-200 bg-amber-50 text-[#6b7280]"
              } ${!isFilled ? "pl-7" : ""}`}
              placeholder="yyyy-mm-dd"
            />
          </div>
        )}
        {isFilled && (
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#0ea56b] text-xs text-white">
            ✓
          </span>
        )}
      </div>
    </div>
  );
}
