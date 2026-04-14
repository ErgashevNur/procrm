import { Skeleton } from "@/components/ui/skeleton";

export default function TasksLoading() {
  return (
    <div className="flex h-full flex-col bg-[#071828]">
      <div className="border-b border-white/5 px-6 py-4">
        <Skeleton className="h-6 w-32 rounded-lg" />
      </div>
      <div className="flex flex-col gap-2 p-6">
        {Array(6)
          .fill(0)
          .map((_, i) => (
            <Skeleton key={i} className="h-12 rounded-xl" />
          ))}
      </div>
    </div>
  );
}
