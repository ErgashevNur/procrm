export default function Avatar({ name, size = 7 }) {
  const initials = name
    ? name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "?";
  const clrs = [
    "#3b82f6",
    "#8b5cf6",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#ec4899",
  ];
  const idx = name ? name.charCodeAt(0) % clrs.length : 0;
  return (
    <div
      className={`flex h-${size} w-${size} shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white`}
      style={{ background: clrs[idx] }}
    >
      {initials}
    </div>
  );
}
