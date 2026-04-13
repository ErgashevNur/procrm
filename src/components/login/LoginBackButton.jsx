export default function LoginBackButton({ onClick, className = "" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={className}
    >
      <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
        <span aria-hidden="true">←</span>
        <span>Orqaga</span>
      </span>
    </button>
  );
}
