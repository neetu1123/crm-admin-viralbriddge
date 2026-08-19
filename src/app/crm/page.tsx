import AppLayout from '@/src/components/AppLayout';
import CrmTopNavbar from '@/src/components/CrmTopNavbar';
import CrmDashboardContent from './components/CrmDashboardContent';

export default function CrmPage() {
  return (
    <AppLayout topNavbar={<CrmTopNavbar />}>
      <CrmDashboardContent />
    </AppLayout>
  );
}
