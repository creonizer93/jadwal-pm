"use client";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useId } from "react";
import { REGION_LABELS, REGION_TABS, type Region } from "@/lib/regions";

export function RegionTabs({
  value,
  onChange,
}: {
  value: Region;
  onChange: (v: Region) => void;
}) {
  const id = useId();
  const activeIndex = REGION_TABS.indexOf(value);
  const count = REGION_TABS.length;

  return (
    <div className="inline-flex w-full rounded-lg bg-input/50 p-0.5">
      <RadioGroup
        value={value}
        onValueChange={(v) => onChange(v as Region)}
        className="group relative inline-grid w-full grid-flow-col auto-cols-fr items-center gap-0 text-sm font-medium"
        style={{ gridTemplateColumns: `repeat(${count}, 1fr)` }}
      >
        {/* Sliding indicator (real element so we can animate to N tabs) */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 rounded-md bg-background shadow-sm shadow-black/5 outline-offset-2 transition-transform duration-300 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)]"
          style={{
            width: `${100 / count}%`,
            transform: `translateX(${activeIndex * 100}%)`,
          }}
        />
        {REGION_TABS.map((region, i) => (
          <label
            key={region}
            className={`relative z-10 inline-flex h-full min-w-0 cursor-pointer select-none items-center justify-center whitespace-nowrap px-3 transition-colors ${
              i === activeIndex ? "text-foreground" : "text-muted-foreground/70"
            }`}
          >
            {REGION_LABELS[region]}
            <RadioGroupItem
              id={`${id}-${region}`}
              value={region}
              className="sr-only"
            />
          </label>
        ))}
      </RadioGroup>
    </div>
  );
}
