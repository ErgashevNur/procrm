import { useEffect, useRef, useState } from "react";
import { GripHorizontal } from "lucide-react";

const MIN_THUMB_WIDTH = 40;
const TRACK_WIDTH = 108;

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export default function HorizontalScrollDock({ targetRef, className = "" }) {
  const trackRef = useRef(null);
  const dragRef = useRef({ active: false, pointerOffset: 0 });
  const [metrics, setMetrics] = useState({
    visible: false,
    thumbWidth: MIN_THUMB_WIDTH,
    thumbLeft: 0,
  });

  useEffect(() => {
    const target = targetRef?.current;
    if (!target) return;

    const updateMetrics = () => {
      const { clientWidth, scrollWidth, scrollLeft } = target;
      const maxScroll = Math.max(scrollWidth - clientWidth, 0);

      if (maxScroll <= 0) {
        setMetrics({ visible: false, thumbWidth: MIN_THUMB_WIDTH, thumbLeft: 0 });
        return;
      }

      const thumbWidth = clamp(
        (clientWidth / scrollWidth) * TRACK_WIDTH,
        MIN_THUMB_WIDTH,
        TRACK_WIDTH - 8,
      );
      const maxThumbLeft = TRACK_WIDTH - thumbWidth;
      const thumbLeft =
        maxScroll === 0 ? 0 : (scrollLeft / maxScroll) * maxThumbLeft;

      setMetrics({ visible: true, thumbWidth, thumbLeft });
    };

    updateMetrics();

    const resizeObserver = new ResizeObserver(updateMetrics);
    resizeObserver.observe(target);
    target.addEventListener("scroll", updateMetrics, { passive: true });
    window.addEventListener("resize", updateMetrics);

    return () => {
      resizeObserver.disconnect();
      target.removeEventListener("scroll", updateMetrics);
      window.removeEventListener("resize", updateMetrics);
    };
  }, [targetRef]);

  useEffect(() => {
    const handlePointerMove = (event) => {
      if (!dragRef.current.active) return;
      const target = targetRef?.current;
      const track = trackRef.current;
      if (!target || !track) return;

      const rect = track.getBoundingClientRect();
      const maxThumbLeft = TRACK_WIDTH - metrics.thumbWidth;
      const nextThumbLeft = clamp(
        event.clientX - rect.left - dragRef.current.pointerOffset,
        0,
        maxThumbLeft,
      );
      const ratio = maxThumbLeft === 0 ? 0 : nextThumbLeft / maxThumbLeft;
      target.scrollLeft = ratio * (target.scrollWidth - target.clientWidth);
    };

    const stopDragging = () => {
      dragRef.current.active = false;
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", stopDragging);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", stopDragging);
    };
  }, [metrics.thumbWidth, targetRef]);

  if (!metrics.visible) return null;

  const jumpToPosition = (clientX) => {
    const target = targetRef?.current;
    const track = trackRef.current;
    if (!target || !track) return;

    const rect = track.getBoundingClientRect();
    const maxThumbLeft = TRACK_WIDTH - metrics.thumbWidth;
    const nextThumbLeft = clamp(
      clientX - rect.left - metrics.thumbWidth / 2,
      0,
      maxThumbLeft,
    );
    const ratio = maxThumbLeft === 0 ? 0 : nextThumbLeft / maxThumbLeft;
    target.scrollLeft = ratio * (target.scrollWidth - target.clientWidth);
  };

  return (
    <div className={`pointer-events-none fixed right-5 bottom-5 z-40 ${className}`}>
      <div className="rounded-md border border-white/12 bg-[#10263a]/92 p-1 shadow-[0_18px_40px_rgba(0,0,0,0.34)] backdrop-blur-xl">
        <div
          ref={trackRef}
          className="pointer-events-auto relative h-9 w-[108px] cursor-pointer overflow-hidden rounded-[6px] border border-[#48617a]/55 bg-[linear-gradient(180deg,rgba(33,54,74,0.95),rgba(23,39,56,0.95))]"
          onPointerDown={(event) => {
            if (event.target === event.currentTarget) {
              jumpToPosition(event.clientX);
            }
          }}
        >
          <div className="absolute inset-1 flex gap-1">
            {Array.from({ length: 7 }).map((_, index) => (
              <div
                key={index}
                className="flex-1 rounded-[3px] bg-white/[0.06]"
              />
            ))}
          </div>
          <div
            className="absolute top-1 bottom-1 rounded-[5px] border border-[#7f97b0]/80 bg-[linear-gradient(180deg,rgba(132,152,173,0.92),rgba(101,121,141,0.88))] shadow-[0_8px_18px_rgba(0,0,0,0.28)]"
            style={{ width: metrics.thumbWidth, left: metrics.thumbLeft }}
            onPointerDown={(event) => {
              event.stopPropagation();
              dragRef.current.active = true;
              dragRef.current.pointerOffset =
                event.clientX -
                event.currentTarget.getBoundingClientRect().left;
            }}
          >
            <div className="flex h-full items-center justify-center text-[#21374b]">
              <GripHorizontal size={15} strokeWidth={2.2} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
