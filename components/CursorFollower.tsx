"use client";

import { useEffect, useRef } from "react";

export function CursorAtmosphere() {
  const ref = useRef<HTMLDivElement>(null);
  const target = useRef({ x: 0.5, y: 0.25 });
  const current = useRef({ x: 0.5, y: 0.25 });

  useEffect(() => {
    const node = ref.current;
    if (
      !node ||
      window.matchMedia("(pointer: coarse), (prefers-reduced-motion: reduce)").matches
    )
      return;

    let raf = 0;
    const onMove = (event: PointerEvent) => {
      target.current.x = event.clientX / window.innerWidth;
      target.current.y = event.clientY / window.innerHeight;
    };

    const animate = () => {
      current.current.x += (target.current.x - current.current.x) * 0.035;
      current.current.y += (target.current.y - current.current.y) * 0.035;
      node.style.setProperty("--pointer-x", `${current.current.x * 100}%`);
      node.style.setProperty("--pointer-y", `${current.current.y * 100}%`);
      raf = requestAnimationFrame(animate);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    raf = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return <div ref={ref} className="cursor-atmosphere" aria-hidden="true" />;
}

export function CursorFollower() {
  const ref = useRef<HTMLDivElement>(null);
  const target = useRef({ x: -80, y: -80 });
  const current = useRef({ x: -80, y: -80 });
  const label = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (
      !node ||
      window.matchMedia("(pointer: coarse), (prefers-reduced-motion: reduce)").matches
    )
      return;

    let raf = 0;
    let visible = false;

    const onMove = (event: PointerEvent) => {
      target.current.x = event.clientX;
      target.current.y = event.clientY;

      if (!visible) {
        current.current.x = event.clientX;
        current.current.y = event.clientY;
        visible = true;
        node.classList.add("is-visible");
      }

      const interactive = (event.target as HTMLElement)?.closest?.(
        "a, button, input, textarea, select, [role='button']"
      );
      node.classList.toggle("is-hovering", Boolean(interactive));
      if (label.current) {
        label.current.textContent = interactive ? "OPEN" : "EXPLORE";
      }
    };

    const onLeave = () => {
      visible = false;
      node.classList.remove("is-visible");
    };

    const animate = () => {
      current.current.x += (target.current.x - current.current.x) * 0.12;
      current.current.y += (target.current.y - current.current.y) * 0.12;
      node.style.transform = `translate3d(${current.current.x}px, ${current.current.y}px, 0)`;
      raf = requestAnimationFrame(animate);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeave);
    raf = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={ref} className="cursor-follower" aria-hidden="true">
      <span className="cursor-follower__ring" />
      <span className="cursor-follower__dot" />
      <span ref={label} className="cursor-follower__label">
        EXPLORE
      </span>
    </div>
  );
}
