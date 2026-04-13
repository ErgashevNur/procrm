import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function BrandIcon({ item, size = 24 }) {
  if (item.faIcon) {
    return (
      <FontAwesomeIcon
        icon={item.faIcon}
        style={{
          fontSize: size,
          color: item.iconColor || "#fff",
          display: "block",
        }}
      />
    );
  }

  return (
    <img
      src={item.logo}
      alt={`${item.name} logo`}
      style={{
        width: size,
        height: size,
        objectFit: "contain",
        display: "block",
        borderRadius: Math.max(4, Math.floor(size / 4)),
      }}
    />
  );
}
