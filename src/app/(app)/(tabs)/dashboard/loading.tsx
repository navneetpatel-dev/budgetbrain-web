import { DashboardContentSkeleton } from '@/shared/components/ui/skeleton';

export default function DashboardLoading() {
  return (
    <div className="max-w-4xl mx-auto w-full p-lg">
      <DashboardContentSkeleton />
    </div>
  );
}
