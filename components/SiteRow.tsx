"use client";

import { useState } from "react";

interface SiteRowProps {
  rowIndex: number;
  type: "MR" | "VW";
  site_id: string;
  tower_name: string;
  jadwal: string;
  onChange: (rowIndex: number, value: string) => void;
}

export default function SiteRow({
  rowIndex,
  type,
  site_id,
  tower_name,
  jadwal,
  onChange,
}: SiteRowProps) {
  const [value, setValue] = useState(jadwal);
  const isFilled = value.trim() !== "";

  const borderColor = isFilled
    ? "border-l-[#0ea56b]"
    : type === "MR"
      ? "border-l-[#1d72f5]"
      : "border-l-[#8b5cf6]";

  return (
    <div
      className={`flex items-center gap-3 rounded-xl border-l-4 bg-white p-4 shadow-sm ${borderColor}`}
    >
      {/* Tower info */}
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-semibold text-[#111827]">
          {tower_name}
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
        </div>
      </div>

      {/* Date input */}
      <div className="flex items-center gap-2">
        <input
          type="date"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            onChange(rowIndex, e.target.value);
          }}
          className="rounded-lg border border-gray-200 bg-gray-50 px-2 py-1.5 text-sm text-[#111827] outline-none focus:border-[#1d72f5] focus:ring-1 focus:ring-[#1d72f5]"
        />
        {isFilled && (
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#0ea56b] text-white text-xs">
            ✓
          </span>
        )}
      </div>
    </div>
  );
}
