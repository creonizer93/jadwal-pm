"use client";

import Link from "next/link";
import ProgressBar from "@/components/ProgressBar";

interface PICItemProps {
  name: string;
  total: number;
  filled: number;
  complete: boolean;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function PICItem({ name, total, filled, complete }: PICItemProps) {
  const initials = getInitials(name);

  return (
    <Link
      href={`/pic/${encodeURIComponent(name)}`}
      className="flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm transition-shadow active:scale-[0.98] hover:shadow-md"
    >
      {/* Avatar */}
      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${
          complete ? "bg-[#0ea56b]" : "bg-[#1d72f5]"
        }`}
      >
        {initials}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-semibold text-[#111827]">
          {name}
        </div>
        <div className="mt-1">
          <ProgressBar filled={filled} total={total} />
        </div>
      </div>

      {/* Badge */}
      <span
        className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
          complete
            ? "bg-green-100 text-[#0ea56b]"
            : "bg-amber-100 text-[#f59e0b]"
        }`}
      >
        {complete ? "COMPLETE" : "OPEN"}
      </span>
    </Link>
  );
}
