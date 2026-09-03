"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

export default function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      setVisible(window.scrollY > 300);
    };

    toggleVisibility();

    window.addEventListener("scroll", toggleVisibility);

    return () => {
      window.removeEventListener("scroll", toggleVisibility);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Voltar ao topo"
      className={`
        fixed
        bottom-6
        right-6
        z-50

        flex
        h-12
        w-12
        items-center
        justify-center

        cursor-pointer
        rounded-full
        border
        border-blue-400/30
        bg-blue-600
        text-white

        shadow-[0_0_25px_rgba(37,99,235,0.35)]

        transition-all
        duration-500
        ease-in-out

        hover:-translate-y-1
        hover:border-blue-400
        hover:bg-transparent
        hover:text-blue-400

        ${
          visible
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none translate-y-4 opacity-0"
        }
      `}
    >
      <ArrowUp className="h-5 w-5" />
    </button>
  );
}
