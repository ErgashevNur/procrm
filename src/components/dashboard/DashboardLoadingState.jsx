import Header from "@/components/Header";
import Shimmer from "@/components/dashboard/Shimmer";

export default function DashboardLoadingState() {
  return (
    <div className="crm-page">
      <div className="mx-auto max-w-5xl space-y-4">
        <Header />
        <Shimmer className="h-28" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {Array(4)
            .fill(0)
            .map((_, i) => (
              <Shimmer key={i} className="h-32" />
            ))}
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Shimmer className="h-64" />
          <Shimmer className="h-64" />
        </div>
      </div>
    </div>
  );
}
