import { ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react";

export default function SortIcon({ field, sortBy, dir }) {
  if (sortBy !== field) {
    return <ChevronsUpDown size={12} className="text-gray-600" />;
  }
  return dir === "asc" ? (
    <ChevronUp size={12} className="text-blue-400" />
  ) : (
    <ChevronDown size={12} className="text-blue-400" />
  );
}
