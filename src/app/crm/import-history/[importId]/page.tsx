import AppLayout from '@/src/components/AppLayout';
import ImportDetailContent from './components/ImportDetailContent';

export default async function ImportDetailPage({
  params,
}: {
  params: Promise<{ importId: string }>;
}) {
  const { importId } = await params;
  return (
    <AppLayout>
      <ImportDetailContent importId={importId} />
    </AppLayout>
  );
}
