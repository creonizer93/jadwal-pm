"use client";

interface StepPillsProps {
  activeStep: 1 | 2;
}

export default function StepPills({ activeStep }: StepPillsProps) {
  return (
    <div className="segment-control mx-auto w-fit">
      <div className={`segment-item ${activeStep >= 1 ? "active" : ""}`}>
        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#007aff] text-[10px] font-bold text-white">
          {activeStep > 1 ? "✓" : "1"}
        </span>
        Dashboard
      </div>
      <div className={`segment-item ${activeStep >= 2 ? "active" : ""}`}>
        <span className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold ${activeStep >= 2 ? "bg-[#007aff] text-white" : "bg-[#8e8e93] text-white"}`}>
          {activeStep > 2 ? "✓" : "2"}
        </span>
        Pengisian
      </div>
    </div>
  );
}
