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

export default function PICItem({
  name,
  total,
  filled,
  done,
  complete,
  submitted,
}: PICItemProps) {
  const initials = getInitials(name);
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  const avatarBg = submitted
    ? "bg-[#34c759]"
    : complete
      ? "bg-[#ff9500]"
      : "bg-[#007aff]";

  const badgeColor = submitted
    ? "bg-[#34c759]/12 text-[#34c759]"
    : complete
      ? "bg-[#ff9500]/12 text-[#ff9500]"
      : done > 0
        ? "bg-[#ff9500]/12 text-[#ff9500]"
        : "bg-[#ff3b30]/12 text-[#ff3b30]";

  const badgeText = submitted
    ? "DONE"
    : complete
      ? "READY"
      : done > 0
        ? `${done}/${total}`
        : "OPEN";

  return (
    <Link
      href={`/pic/${encodeURIComponent(name)}`}
      className="glass-card flex items-center gap-3 p-4"
    >
      {/* Avatar */}
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[13px] font-[590] text-white ${avatarBg}`}>
        {initials}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <div className="truncate text-[15px] font-[590] tracking-[-0.23px] text-[#1c1c1e]">
          {name}
        </div>
        {/* Mini progress bar */}
        <div className="mt-1.5 flex items-center gap-2">
          <div className="h-1 flex-1 overflow-hidden rounded-full bg-[rgba(118,118,128,0.12)]">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                submitted
                  ? "bg-[#34c759]"
                  : complete
                    ? "bg-[#ff9500]"
                    : "bg-[#007aff]"
              }`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="shrink-0 text-[11px] font-medium tracking-[-0.06px] text-[#8e8e93]">
            {done}/{total}
          </span>
        </div>
        {filled !== done && (
          <div className="mt-0.5 text-[11px] tracking-[-0.06px] text-[#aeaeb2]">
            {filled} terisi · {filled - done} belum submit
          </div>
        )}
      </div>

      {/* Badge */}
      <span
        className={`shrink-0 rounded-full px-2.5 py-1 text-[12px] font-[590] tracking-[-0.06px] ${badgeColor}`}
      >
        {badgeText}
      </span>
    </Link>
  );
}
