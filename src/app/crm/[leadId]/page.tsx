import AppLayout from '@/src/components/AppLayout';
import CrmTopNavbar from '@/src/components/CrmTopNavbar';
import LeadDetailContent from './components/LeadDetailContent';

interface LeadDetailPageProps {
  params: Promise<{ leadId: string }>;
}

export default async function LeadDetailPage({ params }: LeadDetailPageProps) {
  const { leadId } = await params;
  return (
    <AppLayout topNavbar={<CrmTopNavbar />}>
      <LeadDetailContent leadId={leadId} />
    </AppLayout>
  );
}
