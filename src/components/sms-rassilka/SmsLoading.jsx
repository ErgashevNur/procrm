import { Skeleton } from "@/components/ui/skeleton";

export default function SmsLoading() {
  return (
    <div className="space-y-4 bg-[#0b1220] p-6">
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-24 rounded-2xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <Skeleton className="h-[640px] rounded-2xl" />
        <Skeleton className="h-[640px] rounded-2xl" />
      </div>
    </div>
  );
}
