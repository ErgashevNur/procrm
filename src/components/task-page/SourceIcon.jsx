export default function SourceIcon({ source, getImageUrl }) {
  if (!source) return null;
  const url = getImageUrl(source.icon);
  if (url) {
    return (
      <img
        src={url}
        alt={source.name}
        title={source.name}
        className="h-4 w-4 rounded-full object-cover"
        onError={(e) => {
          e.currentTarget.style.display = "none";
        }}
      />
    );
  }
  return (
    <span className="rounded bg-white/5 px-1.5 py-0.5 text-[9px] text-gray-500">
      {source.name}
    </span>
  );
}
