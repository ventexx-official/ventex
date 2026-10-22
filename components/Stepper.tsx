"use client";

import React from "react";

interface StepItem {
  id: number;
  label: string;
}

interface StepperProps {
  currentStep: number;
  steps: StepItem[];
  className?: string;
}

export function Stepper({ currentStep, steps, className = "" }: StepperProps) {
  return (
    <div className={`w-full max-w-xs mx-auto py-3 ${className}`} aria-label="Onboarding progress">
      <div className="relative flex items-center justify-between">
        {/* Background connector line */}
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[1px] bg-[var(--line)]" />

        {/* Progress highlight line */}
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 h-[1px] bg-[var(--red)] transition-all duration-300"
          style={{
            width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
          }}
        />

        {/* Dots */}
        {steps.map((step) => {
          const isCompleted = step.id < currentStep;
          const isActive = step.id === currentStep;

          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center">
              <div
                className={`w-3.5 h-3.5 rounded-full border transition-all duration-300 flex items-center justify-center ${
                  isActive
                    ? "bg-[var(--red)] border-[var(--red)] shadow-[0_0_10px_rgba(214,69,59,0.8)] scale-110"
                    : isCompleted
                    ? "bg-[var(--red)] border-[var(--red)]"
                    : "bg-[var(--ink)] border-[var(--line)]"
                }`}
                aria-current={isActive ? "step" : undefined}
              >
                {isCompleted && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--paper)]" />
                )}
              </div>
              <span
                className={`absolute top-5 text-[9px] font-mono uppercase tracking-wider whitespace-nowrap transition-colors ${
                  isActive
                    ? "text-[var(--paper)] font-bold"
                    : "text-[var(--smoke)]"
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
