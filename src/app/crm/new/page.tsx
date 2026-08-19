import AppLayout from '@/src/components/AppLayout';
import CrmTopNavbar from '@/src/components/CrmTopNavbar';
import LeadFormPageContent from '../components/LeadFormPageContent';

export default function NewLeadPage() {
  return (
    <AppLayout topNavbar={<CrmTopNavbar />}>
      <LeadFormPageContent mode="create" />
    </AppLayout>
  );
}
