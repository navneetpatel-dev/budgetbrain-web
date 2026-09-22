import { GoalDetailPage } from '@/features/goals/pages/goals/GoalDetail.page';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  return <GoalDetailPage id={resolvedParams.id} />;
}
