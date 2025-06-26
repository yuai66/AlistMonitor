import { StorageTable } from './storage-table';
import { NotificationHistory } from './notification-history';

export function MonitoringDashboard() {
  return (
    <div className="space-y-6">
      <StorageTable />
      <NotificationHistory />
    </div>
  );
}
