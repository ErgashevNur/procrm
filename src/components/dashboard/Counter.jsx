import { useEffect, useRef, useState } from "react";

export default function Counter({ value, duration = 1200 }) {
  const [display, setDisplay] = useState(0);
  const raf = useRef();

  useEffect(() => {
    const start = performance.now();
    const animate = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(ease * value));
      if (progress < 1) raf.current = requestAnimationFrame(animate);
    };
    raf.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf.current);
  }, [value]);

  return <>{display.toLocaleString()}</>;
}
