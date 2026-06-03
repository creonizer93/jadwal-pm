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
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="text-[#6b7280]">
          {filled} dari {total} site diisi
        </span>
        <span className="font-semibold text-[#111827]">{pct}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            isComplete ? "bg-[#0ea56b]" : "bg-[#1d72f5]"
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
