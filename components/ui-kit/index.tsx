import React from "react";
import Link from "next/link";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { SITE_NAME } from "@/lib/brand";

export function BrandLogo({ light = true }: { light?: boolean }) {
  const brandName = SITE_NAME.toUpperCase();
  return (
    <Link
      href="/"
      className={`brand-lockup ${light ? "" : "brand-lockup--dark"}`}
      aria-label={`${brandName} home`}
    >
      <span>{brandName}</span>
    </Link>
  );
}

export interface PageFrameProps {
  current?: string;
  eyebrow: string;
  title: React.ReactNode;
  intro: string;
  children: React.ReactNode;
  accent?: "red" | "paper" | "dark";
}

export function PageFrame({
  eyebrow,
  title,
  intro,
  children,
  accent = "dark",
}: PageFrameProps) {
  const brandName = SITE_NAME.toUpperCase();
  const accentClass =
    accent === "red"
      ? "inner-page--red"
      : accent === "paper"
      ? "inner-page--paper"
      : "";

  return (
    <div className={`inner-page ${accentClass}`}>
      <main>
        <section className="inner-hero page-padding">
          <div className="inner-hero__meta">
            <span className="status-dot" /> {eyebrow}{" "}
            <span>/ {brandName} / 2026</span>
          </div>
          <h1>{title}</h1>
          <p>{intro}</p>
          <div className="inner-hero__line" aria-hidden="true">
            <span>SCROLL TO EXPLORE</span>
            <span />
          </div>
        </section>
        {children}
      </main>
      <footer className="inner-footer page-padding">
        <BrandLogo light={accent !== "paper"} />
        <span>Build what’s next, with the right people.</span>
        <Link href="/" className="inline-flex items-center gap-2">
          Back to home <ArrowUpRight size={15} />
        </Link>
      </footer>
    </div>
  );
}

export function SectionHead({
  index,
  title,
  caption,
  className = "",
}: {
  index?: string;
  title?: string;
  caption?: string;
  className?: string;
}) {
  return (
    <div className={`inner-section__head ${className}`}>
      {index && <span>{index} {title ? `/ ${title}` : ""}</span>}
      {caption && <p>{caption}</p>}
    </div>
  );
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  href?: string;
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  href,
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center font-bold tracking-wider uppercase transition-all rounded-full min-h-[44px] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";
  const sizeStyles = {
    sm: "px-4 py-2 text-xs",
    md: "px-6 py-2.5 text-xs",
    lg: "px-8 py-3.5 text-sm",
  }[size];

  const variantStyles = {
    primary: "bg-[var(--red)] text-[var(--paper)] hover:bg-[#ed594d]",
    secondary: "bg-[var(--paper)] text-[var(--ink)] hover:bg-[#fffaf0]",
    outline: "border border-line text-[var(--paper)] hover:border-[var(--red)] hover:text-[var(--red)]",
    danger: "bg-red-600 text-white hover:bg-red-700",
    ghost: "text-[var(--paper-dim)] hover:text-[var(--paper)] bg-transparent",
  }[variant];

  const combined = `${base} ${sizeStyles} ${variantStyles} ${className}`;

  if (href) {
    return (
      <Link href={href} className={combined}>
        {children}
      </Link>
    );
  }

  return (
    <button className={combined} {...props}>
      {children}
    </button>
  );
}

export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`bg-[var(--card)] text-[var(--foreground)] border border-line rounded-3xl p-6 transition-all ${className}`}
    >
      {children}
    </div>
  );
}

export function Badge({
  children,
  variant = "default",
  className = "",
}: {
  children: React.ReactNode;
  variant?: "default" | "red" | "paper" | "emerald";
  className?: string;
}) {
  const styles = {
    default: "bg-line/20 text-[var(--paper-dim)] border border-line",
    red: "bg-[var(--red)]/15 text-[var(--red)] border border-[var(--red)]/30",
    paper: "bg-[var(--paper)] text-[var(--ink)]",
    emerald: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
  }[variant];

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider ${styles} ${className}`}
    >
      {children}
    </span>
  );
}

export function StatusDot({
  dark = false,
  className = "",
}: {
  dark?: boolean;
  className?: string;
}) {
  return (
    <span
      className={`status-dot ${dark ? "status-dot--dark" : ""} ${className}`}
      aria-hidden="true"
    />
  );
}

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", error, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`w-full bg-[var(--card)] border rounded-2xl px-4 py-3 text-base text-[var(--paper)] placeholder:text-[var(--smoke)] focus:outline-none focus:ring-1 transition-colors min-h-[44px] ${
          error
            ? "border-red-500 focus:ring-red-500"
            : "border-line focus:border-[var(--red)] focus:ring-[var(--red)]"
        } ${className}`}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = "", error, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={`w-full bg-[var(--card)] border rounded-2xl p-4 text-base text-[var(--paper)] placeholder:text-[var(--smoke)] focus:outline-none focus:ring-1 transition-colors ${
          error
            ? "border-red-500 focus:ring-red-500"
            : "border-line focus:border-[var(--red)] focus:ring-[var(--red)]"
        } ${className}`}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = "", error, children, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={`w-full bg-[var(--card)] border rounded-2xl px-4 py-3 text-base text-[var(--paper)] focus:outline-none focus:ring-1 transition-colors min-h-[44px] ${
          error
            ? "border-red-500 focus:ring-red-500"
            : "border-line focus:border-[var(--red)] focus:ring-[var(--red)]"
        } ${className}`}
        {...props}
      >
        {children}
      </select>
    );
  }
);
Select.displayName = "Select";

export function Checkbox({
  checked,
  onChange,
  label,
  id,
  className = "",
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  id?: string;
  className?: string;
}) {
  return (
    <label
      htmlFor={id}
      className={`inline-flex items-center gap-3 cursor-pointer min-h-[44px] select-none text-sm text-[var(--paper)] ${className}`}
    >
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-5 h-5 rounded border border-line bg-[var(--card)] accent-[var(--red)] cursor-pointer"
      />
      {label && <span>{label}</span>}
    </label>
  );
}

export function Toggle({
  enabled,
  onChange,
  label,
  className = "",
}: {
  enabled: boolean;
  onChange: (val: boolean) => void;
  label?: string;
  className?: string;
}) {
  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        onClick={() => onChange(!enabled)}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[var(--red)] focus:ring-offset-2 ${
          enabled ? "bg-[var(--red)]" : "bg-[var(--muted)]"
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            enabled ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
      {label && <span className="text-sm font-medium">{label}</span>}
    </div>
  );
}

export function FormField({
  label,
  hint,
  error,
  children,
  required,
}: {
  label: string;
  hint?: string;
  error?: string | null;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-baseline">
        <label className="block text-xs font-bold uppercase tracking-widest text-[var(--paper-dim)]">
          {label} {required && <span className="text-[var(--red)]">*</span>}
        </label>
        {hint && <span className="text-[11px] text-[var(--smoke)]">{hint}</span>}
      </div>
      {children}
      {error && (
        <p className="text-xs text-[var(--red)] font-medium pt-0.5">{error}</p>
      )}
    </div>
  );
}

export function Alert({
  variant = "info",
  title,
  children,
}: {
  variant?: "info" | "success" | "error";
  title?: string;
  children: React.ReactNode;
}) {
  const styles = {
    info: "border-line bg-[var(--card)] text-[var(--paper)]",
    success: "border-emerald-600/40 bg-emerald-950/20 text-emerald-400",
    error: "border-red-600/40 bg-red-950/20 text-red-400",
  }[variant];

  return (
    <div className={`p-4 rounded-2xl border text-sm space-y-1 ${styles}`}>
      {title && <h4 className="font-bold tracking-wide">{title}</h4>}
      <div>{children}</div>
    </div>
  );
}

export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-lg bg-[var(--card)] border border-line rounded-3xl p-6 sm:p-8 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-line mb-6">
          <h3 className="text-xl font-bold font-display uppercase tracking-tight text-[var(--paper)]">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="p-2 text-[var(--smoke)] hover:text-[var(--paper)] rounded-full min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="text-center p-12 border border-line border-dashed rounded-3xl bg-[var(--card)] space-y-4">
      <h3 className="font-display text-xl font-bold uppercase tracking-tight text-[var(--paper)]">
        {title}
      </h3>
      <p className="text-sm text-[var(--smoke)] max-w-md mx-auto">{description}</p>
      {action && <div className="pt-2">{action}</div>}
    </div>
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse bg-[var(--muted)]/50 rounded-2xl ${className}`}
    />
  );
}

export function StarRating({
  rating = 0,
  max = 5,
  interactive = false,
  onChange,
}: {
  rating?: number;
  max?: number;
  interactive?: boolean;
  onChange?: (val: number) => void;
}) {
  return (
    <div className="inline-flex items-center gap-1">
      {Array.from({ length: max }).map((_, i) => {
        const filled = i < Math.round(rating);
        if (interactive) {
          return (
            <button
              key={i}
              type="button"
              onClick={() => onChange?.(i + 1)}
              className="min-h-[44px] min-w-[32px] text-lg cursor-pointer transition-transform hover:scale-125 text-amber-400"
              aria-label={`Rate ${i + 1} of ${max} stars`}
            >
              {filled ? "★" : "☆"}
            </button>
          );
        }
        return (
          <span
            key={i}
            className={`text-sm ${
              filled ? "text-amber-400" : "text-[var(--smoke)]"
            }`}
          >
            ★
          </span>
        );
      })}
    </div>
  );
}

export function ScoreBar({
  score = 0,
  label,
}: {
  score: number;
  label?: string;
}) {
  const percentage = Math.min(Math.max(score, 0), 100);
  return (
    <div className="space-y-1 w-full">
      {label && (
        <div className="flex justify-between text-xs font-mono uppercase text-[var(--smoke)]">
          <span>{label}</span>
          <span>{percentage}%</span>
        </div>
      )}
      <div className="w-full h-2 rounded-full bg-[var(--muted)] overflow-hidden">
        <div
          className="h-full bg-[var(--red)] transition-all duration-500 rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
