"use client";

import { useRef, useEffect, ReactNode } from "react";

interface MagneticButtonProps {
  children: ReactNode;
  variant?: "light" | "dark" | "crimson";
  className?: string;
  onClick?: () => void;
  href?: string;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
}

export function MagneticButton({
  children,
  variant = "light",
  className = "",
  onClick,
  href,
  type = "button",
  disabled = false,
}: MagneticButtonProps) {
  const ref = useRef<any>(null);

  const handleMove = (event: React.PointerEvent) => {
    const node = ref.current;
    if (!node || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const rect = node.getBoundingClientRect();
    const x = (event.clientX - rect.left - rect.width / 2) * 0.08;
    const y = (event.clientY - rect.top - rect.height / 2) * 0.08;
    node.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  };

  const reset = () => {
    if (ref.current) ref.current.style.transform = "translate3d(0, 0, 0)";
  };

  const commonProps = {
    ref,
    className: `magnetic-button magnetic-button--${variant} ${className}`,
    onPointerMove: handleMove,
    onPointerLeave: reset,
  };

  if (href) {
    return (
      <a {...commonProps} href={href} onClick={onClick}>
        {children}
      </a>
    );
  }

  return (
    <button {...commonProps} type={type} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}

export default MagneticButton;
