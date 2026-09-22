import { ContributeGoalPage } from '@/features/goals/pages/goals/ContributeGoal.page';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  return <ContributeGoalPage id={resolvedParams.id} />;
}
