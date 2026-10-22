"use client";

import { useEffect } from "react";

export function ScrollMotion() {
  useEffect(() => {
    let raf = 0;
    let ticking = false;

    const update = () => {
      const max = Math.max(
        document.documentElement.scrollHeight - window.innerHeight,
        1
      );
      const progress = Math.min(window.scrollY / max, 1);
      document.documentElement.style.setProperty(
        "--scroll-progress",
        `${progress}`
      );

      const hero = document.querySelector<HTMLElement>(".hero-section");
      if (hero) {
        const heroProgress = Math.min(
          window.scrollY / Math.max(hero.offsetHeight, 1),
          1
        );
        hero.style.setProperty("--hero-scroll", `${heroProgress}`);
      }
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        raf = requestAnimationFrame(update);
      }
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="scroll-progress" aria-hidden="true">
      <span />
    </div>
  );
}

export default ScrollMotion;
