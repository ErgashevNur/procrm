export default function FieldError({ message }) {
  if (!message) return null;
  return <p className="mt-2 text-[11px] text-rose-400/90">{message}</p>;
}
