export default function IconImage({
  icon,
  name,
  size = "h-8 w-8",
  getIconUrl,
}) {
  const url = getIconUrl(icon);
  if (url) {
    return (
      <img
        src={url}
        alt={name || "icon"}
        className={`${size} rounded-md object-cover ring-1 ring-indigo-700/30`}
        onError={(e) => {
          const parent = e.target.parentNode;
          e.target.remove();
          const div = document.createElement("div");
          div.className = `flex ${size} items-center justify-center rounded-md bg-indigo-800/40 text-sm font-medium text-indigo-300 ring-1 ring-indigo-700/20`;
          div.textContent = (name || "?").charAt(0).toUpperCase();
          parent.prepend(div);
        }}
      />
    );
  }
  return (
    <div
      className={`flex ${size} items-center justify-center rounded-md bg-indigo-800/40 text-sm font-medium text-indigo-300 ring-1 ring-indigo-700/20`}
    >
      {(name || "?").charAt(0).toUpperCase()}
    </div>
  );
}
