import { Phone } from "lucide-react";

export default function PhoneRow({ label, value }) {
  return (
    <div>
      <p className="text-[11px] text-gray-600">{label}</p>
      <div className="flex items-center gap-2">
        <Phone size={13} className="shrink-0 text-blue-400" />
        {value ? (
          <a
            href={`tel:${value}`}
            className="text-sm text-blue-400 hover:underline"
          >
            {value}
          </a>
        ) : (
          <span className="text-sm text-gray-600">—</span>
        )}
      </div>
    </div>
  );
}
