import AppLayout from '@/src/components/AppLayout';
import CrmTopNavbar from '@/src/components/CrmTopNavbar';
import LeadFormPageContent from '../../components/LeadFormPageContent';

interface EditLeadPageProps {
  params: Promise<{ leadId: string }>;
}

export default async function EditLeadPage({ params }: EditLeadPageProps) {
  const { leadId } = await params;
  return (
    <AppLayout topNavbar={<CrmTopNavbar />}>
      <LeadFormPageContent mode="edit" leadId={leadId} />
    </AppLayout>
  );
}
