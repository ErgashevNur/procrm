export default function InfoRow({ label, value }) {
  return (
    <div>
      <p className="mb-0.5 text-[11px] text-gray-600 uppercase">{label}</p>
      <p className="text-sm font-medium text-white">{value || "—"}</p>
    </div>
  );
}
