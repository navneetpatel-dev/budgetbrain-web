import { BudgetDetailPage } from '@/features/budgets/pages/BudgetDetail.page';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  return <BudgetDetailPage id={resolvedParams.id} />;
}
