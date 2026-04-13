import { forwardRef } from "react";

const IconBtn = forwardRef(function IconBtn(
  {
    icon: Icon,
    label,
    onClick,
    className = "",
    disabled = false,
    variant = "default",
    iconOnly = false,
    spin = false,
    ...props
  },
  ref,
) {
  const colors = {
    default:
      "border-[#2a4868] text-gray-300 hover:bg-[#1b3e57] hover:text-white",
    success:
      "border-green-700/50 text-green-400 hover:bg-green-900/30 hover:text-green-300",
    warning:
      "border-yellow-700/50 text-yellow-400 hover:bg-yellow-900/30 hover:text-yellow-300",
  };

  return (
    <button
      ref={ref}
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center gap-1.5 rounded-md border px-2.5 text-sm transition-colors duration-150 disabled:opacity-40 ${colors[variant]} ${className}`}
      style={{ height: "36px" }}
      {...props}
    >
      <Icon size={14} className={`shrink-0 ${spin ? "animate-spin" : ""}`} />
      {!iconOnly && <span className="whitespace-nowrap">{label}</span>}
    </button>
  );
});

export default IconBtn;
