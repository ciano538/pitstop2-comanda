import { CustomerTableView } from '@/components/CustomerTableView';

export const dynamic = 'force-dynamic';

export default function CustomerPage({
  params,
  searchParams,
}: {
  params: { table: string };
  searchParams: { k?: string };
}) {
  const tableNumber = Number(params.table) || 0;
  const qrToken = searchParams.k || '';
  return <CustomerTableView tableNumber={tableNumber} qrToken={qrToken} />;
}
