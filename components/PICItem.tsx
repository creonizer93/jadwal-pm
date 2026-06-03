"use client";

import Link from "next/link";

interface PICItemProps {
  name: string;
  total: number;
  filled: number;
  done: number;
  complete: boolean;
  submitted: boolean;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function PICItem({ name, total, filled, done, complete, submitted }: PICItemProps) {
  const initials = getInitials(name);
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <Link
      href={`/pic/${encodeURIComponent(name)}`}
      className="flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm transition-shadow active:scale-[0.98] hover:shadow-md"
    >
      {/* Avatar with status dot */}
      <div className="relative shrink-0">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-full text-sm font-bold text-white ${
            submitted ? "bg-[#0ea56b]" : complete ? "bg-[#f59e0b]" : "bg-[#1d72f5]"
          }`}
        >
          {initials}
        </div>
        <span
          className={`absolute -right-0.5 -top-0.5 h-3.5 w-3.5 rounded-full border-2 border-white ${
            submitted ? "bg-[#0ea56b]" : complete ? "bg-[#f59e0b]" : done > 0 ? "bg-[#f59e0b]" : "bg-[#ef4444]"
          }`}
        />
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-semibold text-[#111827]">
          {name}
        </div>
        {/* Mini progress bar */}
        <div className="mt-1.5 flex items-center gap-2">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-200">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                submitted ? "bg-[#0ea56b]" : complete ? "bg-[#f59e0b]" : "bg-[#1d72f5]"
              }`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="shrink-0 text-[10px] font-medium text-[#6b7280]">
            {done}/{total}
          </span>
        </div>
        {/* Subtle: jadwal filled vs done */}
        {filled !== done && (
          <div className="mt-0.5 text-[10px] text-[#9ca3af]">
            {filled} terisi • {filled - done} belum submit
          </div>
        )}
      </div>

      {/* Badge */}
      <span
        className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
          submitted
            ? "bg-green-100 text-[#0ea56b]"
            : complete
              ? "bg-amber-100 text-[#f59e0b]"
              : done > 0
                ? "bg-amber-100 text-[#f59e0b]"
                : "bg-red-50 text-[#ef4444]"
        }`}
      >
        {submitted ? "DONE" : complete ? "READY" : done > 0 ? `${done}/${total}` : "OPEN"}
      </span>
    </Link>
  );
}
