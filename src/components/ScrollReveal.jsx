import { useEffect, useRef, useState } from "react";

function shouldRevealImmediately() {
  if (typeof window === "undefined") return false;

  return (
    window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
    !("IntersectionObserver" in window)
  );
}

export default function ScrollReveal({
  children,
  className = "",
  delay = 0,
  threshold = 0.14,
}) {
  const elementRef = useRef(null);
  const [isVisible, setIsVisible] = useState(shouldRevealImmediately);

  useEffect(() => {
    if (isVisible) return undefined;

    const element = elementRef.current;

    if (!element) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      {
        rootMargin: "0px 0px -10% 0px",
        threshold,
      },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [isVisible, threshold]);

  return (
    <div
      ref={elementRef}
      className={`scroll-reveal ${isVisible ? "is-visible" : ""} ${className}`}
      style={{ transitionDelay: isVisible ? `${delay}ms` : "0ms" }}
    >
      {children}
    </div>
  );
}
