import { Skeleton } from "../ui/skeleton";

export default function PipelineLoading() {
  return (
    <div className="flex h-full flex-col bg-[#0d1e35]">
      <div className="flex shrink-0 items-center gap-4 border-b border-[#284860] bg-[#0f2231] p-6">
        <Skeleton className="h-10 w-64 rounded-lg" />
      </div>
      <div className="flex flex-1 gap-4 overflow-x-auto p-6">
        {Array(5)
          .fill(0)
          .map((_, i) => (
            <div key={i} className="w-80 shrink-0">
              <Skeleton className="mb-3 h-10 rounded-lg" />
              <Skeleton className="h-64 rounded-lg" />
            </div>
          ))}
      </div>
    </div>
  );
}
