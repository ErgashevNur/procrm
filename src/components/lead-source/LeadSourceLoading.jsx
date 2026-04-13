import { Loader2 } from "lucide-react";

export default function LeadSourceLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0f2231]">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
        <p className="text-sm text-gray-500">Yuklanmoqda...</p>
      </div>
    </div>
  );
}
