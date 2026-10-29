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
  return null;
}
