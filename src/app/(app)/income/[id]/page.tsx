import { IncomeDetailPage } from '@/features/income/pages/income/IncomeDetail.page';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  return <IncomeDetailPage id={resolvedParams.id} />;
}
