export default function RegisterFieldError({ message }) {
  if (!message) return null;
  return <p style={{ color: "#f87171", fontSize: 12, marginTop: 6 }}>{message}</p>;
}
