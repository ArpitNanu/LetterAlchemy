import React from "react";
import { cn } from "@/lib/utils";

interface FeatureCardProps {
  title: string;
  description: string;
  children?: React.ReactNode;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  className?: string;
}

export const FeatureCard = ({
  title,
  description,
  children,
  icon,
  badge,
  className,
}: FeatureCardProps) => {
  return (
    <div
      className={cn(
        "bg-[#FAF9F7] border border-border-subtle rounded-3xl p-6 flex flex-col relative overflow-hidden group transition-all hover:shadow-md",
        className
      )}
    >
      <div className="flex justify-between items-start mb-3">
        {icon && (
          <div className="w-12 h-12 bg-brand-primary/10 rounded-full flex items-center justify-center mb-6">
            {icon}
          </div>
        )}
        {badge && <div className="ml-auto">{badge}</div>}
      </div>
      
      <div className="max-w-md relative z-10">
        <h2 className="text-2xl font-bold mb-3">{title}</h2>
        <p className="text-text-muted leading-relaxed mb-8">{description}</p>
      </div>

      <div className="mt-auto relative z-10 w-full">
        {children}
      </div>
    </div>
  );
};
