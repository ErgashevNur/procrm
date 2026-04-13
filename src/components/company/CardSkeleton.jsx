import { Skeleton } from "@/components/ui/skeleton";

export default function CardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/[0.04] bg-[#0f2438]">
      <Skeleton className="h-36 w-full rounded-none" />
      <div className="space-y-2 p-4">
        <Skeleton className="h-4 w-2/3 rounded-lg" />
        <Skeleton className="h-3 w-1/2 rounded-lg" />
        <Skeleton className="mt-3 h-6 w-32 rounded-lg" />
      </div>
    </div>
  );
}
