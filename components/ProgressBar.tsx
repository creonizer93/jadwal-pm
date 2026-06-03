"use client";

interface ProgressBarProps {
  filled: number;
  total: number;
}

export default function ProgressBar({ filled, total }: ProgressBarProps) {
  const pct = total > 0 ? Math.round((filled / total) * 100) : 0;
  const isComplete = filled >= total;

  return (
    <div className="w-full">
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-[13px] font-medium tracking-[-0.08px] text-[#8e8e93]">
          {filled} dari {total}
        </span>
        <span className="text-[13px] font-[590] tracking-[-0.08px] text-[#1c1c1e]">
          {pct}%
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-[rgba(118,118,128,0.12)]">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${
            isComplete ? "bg-[#34c759]" : "bg-[#007aff]"
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
