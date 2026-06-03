"use client";

interface StepPillsProps {
  activeStep: 1 | 2;
}

export default function StepPills({ activeStep }: StepPillsProps) {
  return (
    <div className="flex items-center justify-center gap-3 py-4">
      <div
        className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
          activeStep >= 1
            ? activeStep === 1
              ? "bg-[#1d72f5] text-white"
              : "bg-[#0ea56b] text-white"
            : "bg-gray-200 text-gray-500"
        }`}
      >
        <span
          className={`flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold ${
            activeStep >= 1
              ? activeStep === 1
                ? "bg-white/20 text-white"
                : "bg-white/20 text-white"
              : "bg-gray-300 text-gray-500"
          }`}
        >
          {activeStep > 1 ? "✓" : "1"}
        </span>
        Dashboard
      </div>
      <div className="h-px w-6 bg-gray-300" />
      <div
        className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
          activeStep >= 2
            ? activeStep === 2
              ? "bg-[#1d72f5] text-white"
              : "bg-[#0ea56b] text-white"
            : "bg-gray-200 text-gray-500"
        }`}
      >
        <span
          className={`flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold ${
            activeStep >= 2
              ? activeStep === 2
                ? "bg-white/20 text-white"
                : "bg-white/20 text-white"
              : "bg-gray-300 text-gray-500"
          }`}
        >
          {activeStep > 2 ? "✓" : "2"}
        </span>
        Pengisian Jadwal
      </div>
    </div>
  );
}
