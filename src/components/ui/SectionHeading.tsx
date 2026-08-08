import React from "react";
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  alignment?: "left" | "center" | "right";
  className?: string;
}

export function SectionHeading({
  title,
  subtitle,
  alignment = "center",
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "mb-16",
        {
          "text-left": alignment === "left",
          "text-center": alignment === "center",
          "text-right": alignment === "right",
        },
        className
      )}
    >
      {subtitle && (
        <span className="inline-block text-[#FFB800] font-bold tracking-[0.3em] uppercase text-xs mb-5">
          — {subtitle} —
        </span>
      )}
      <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white mb-6 uppercase">
        {title}
      </h2>
      <div
        className={cn("h-[3px] w-16 bg-[#FFB800]", {
          "mx-auto": alignment === "center",
          "ml-auto": alignment === "right",
        })}
      />
    </div>
  );
}
