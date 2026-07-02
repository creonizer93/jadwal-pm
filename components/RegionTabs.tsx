"use client";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useId } from "react";
import { REGION_LABELS, type Region } from "@/lib/regions";

const TABS: Region[] = ["kalbar", "kalteng"];

export function RegionTabs({
  value,
  onChange,
}: {
  value: Region;
  onChange: (v: Region) => void;
}) {
  const id = useId();
  const dataState = value === "kalteng" ? "on" : "off";

  return (
    <div className="inline-flex w-full rounded-lg bg-input/50 p-0.5">
      <RadioGroup
        value={value}
        onValueChange={(v) => onChange(v as Region)}
        className="group relative inline-grid w-full grid-cols-[1fr_1fr] items-center gap-0 text-sm font-medium after:absolute after:inset-y-0 after:w-1/2 after:rounded-md after:bg-background after:shadow-sm after:shadow-black/5 after:outline-offset-2 after:transition-transform after:duration-300 after:[transition-timing-function:cubic-bezier(0.16,1,0.3,1)] has-[:focus-visible]:after:outline has-[:focus-visible]:after:outline-2 has-[:focus-visible]:after:outline-ring/70 data-[state=off]:after:translate-x-0 data-[state=on]:after:translate-x-full"
        data-state={dataState}
      >
        {TABS.map((region) => (
          <label
            key={region}
            className="relative z-10 inline-flex h-full min-w-8 cursor-pointer select-none items-center justify-center whitespace-nowrap px-4 transition-colors group-data-[state=on]:text-muted-foreground/70"
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
