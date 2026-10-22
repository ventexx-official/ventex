"use client";

import {
  type CSSProperties,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";

type InViewOptions = IntersectionObserverInit & { once?: boolean };

export function useInView<T extends HTMLElement>(options: InViewOptions = {}) {
  const ref = useRef<T>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          if (options.once !== false) observer.disconnect();
        } else if (options.once === false) {
          setVisible(false);
        }
      },
      { threshold: 0.16, ...options }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [options.once, options.rootMargin, options.threshold]);

  return { ref, visible };
}

export function MaskText({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const { ref, visible } = useInView<HTMLSpanElement>();
  return (
    <span ref={ref} className={`mask-text ${className}`}>
      <span
        className={`mask-text__inner ${visible ? "is-visible" : ""}`}
        style={{ "--delay": `${delay}ms` } as CSSProperties}
      >
        {children}
      </span>
    </span>
  );
}

export function ParagraphReveal({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const { ref, visible } = useInView<HTMLParagraphElement>();
  return (
    <p ref={ref} className={`paragraph-reveal ${visible ? "is-visible" : ""} ${className}`}>
      {children}
    </p>
  );
}

export function InteractiveLetters({ text }: { text: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (
      !node ||
      window.matchMedia("(pointer: coarse), (prefers-reduced-motion: reduce)").matches
    )
      return;

    const letters = Array.from(
      node.querySelectorAll<HTMLElement>(".interactive-letter")
    );
    const pointer = { x: 0, y: 0 };
    let raf = 0;
    let queued = false;

    const paint = () => {
      queued = false;
      letters.forEach((letter) => {
        const bounds = letter.getBoundingClientRect();
        const distance = Math.hypot(
          pointer.x - (bounds.left + bounds.width / 2),
          pointer.y - (bounds.top + bounds.height / 2)
        );
        const intensity = Math.max(0, Math.min(1, 1 - distance / 145));
        letter.style.setProperty("--letter-progress", intensity.toFixed(3));
      });
    };

    const onMove = (event: PointerEvent) => {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      if (!queued) {
        queued = true;
        raf = requestAnimationFrame(paint);
      }
    };

    const reset = () =>
      letters.forEach((letter) =>
        letter.style.setProperty("--letter-progress", "0")
      );

    node.addEventListener("pointermove", onMove, { passive: true });
    node.addEventListener("pointerleave", reset, { passive: true });

    return () => {
      node.removeEventListener("pointermove", onMove);
      node.removeEventListener("pointerleave", reset);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <span ref={ref} className="interactive-letters" aria-label={text}>
      {Array.from(text).map((character, index) => (
        <span
          className="interactive-letter"
          aria-hidden="true"
          key={`${character}-${index}`}
        >
          {character === " " ? "\u00a0" : character}
        </span>
      ))}
    </span>
  );
}


export function CountUp({ value, suffix = "" }: { value: number; suffix?: string }) {
  const { ref, visible } = useInView<HTMLSpanElement>();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!visible) return;
    const start = performance.now();
    const duration = 1500;
    let raf = 0;
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(value * eased));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, visible]);

  return (
    <span ref={ref} className="count-up">
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}
