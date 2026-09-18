import { ExpenseDetailPage } from '@/features/expenses/pages/ExpenseDetail.page';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  return <ExpenseDetailPage id={resolvedParams.id} />;
}
