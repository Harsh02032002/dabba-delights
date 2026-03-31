import { useState } from 'react';
import { AdminLayout } from '@/layouts/AdminLayout';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdminGSTSettings from './AdminGSTSettings';
import AdminGSTReports from './AdminGSTReports';

export default function AdminGST() {
  const [activeTab, setActiveTab] = useState('reports');

  return (
    <AdminLayout title="GST Management" subtitle="Configure GST rates and view tax reports">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="bg-secondary p-1">
          <TabsTrigger value="reports" className="data-[state=active]:bg-card">GST Reports</TabsTrigger>
          <TabsTrigger value="settings" className="data-[state=active]:bg-card">GST Settings</TabsTrigger>
        </TabsList>
      </Tabs>

      {activeTab === 'reports' ? <AdminGSTReports /> : <AdminGSTSettings />}
    </AdminLayout>
  );
}
