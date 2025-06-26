import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { ConfigurationPanel } from '@/components/configuration-panel';
import { MonitoringDashboard } from '@/components/monitoring-dashboard';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import { Server, RefreshCw } from 'lucide-react';

export default function Home() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: monitorStatus } = useQuery({
    queryKey: ['/api/monitor/status'],
    queryFn: api.getMonitorStatus,
    refetchInterval: 5000,
  });

  const manualCheckMutation = useMutation({
    mutationFn: api.manualCheck,
    onSuccess: () => {
      toast({ title: '成功', description: '手动检查已完成' });
      queryClient.invalidateQueries({ queryKey: ['/api/storages'] });
      queryClient.invalidateQueries({ queryKey: ['/api/monitor/status'] });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
    },
    onError: (error: any) => {
      toast({ 
        title: '错误', 
        description: error.message || '手动检查失败',
        variant: 'destructive' 
      });
    },
  });

  const handleManualCheck = () => {
    manualCheckMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <Server className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">AList 存储监控系统</h1>
            </div>
            <div className="flex items-center space-x-4">
              {monitorStatus?.isActive && (
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-600">监控运行中</span>
                </div>
              )}
              <Button
                onClick={handleManualCheck}
                disabled={manualCheckMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${manualCheckMutation.isPending ? 'animate-spin' : ''}`} />
                {manualCheckMutation.isPending ? '检查中...' : '手动检查'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Configuration Panel */}
          <div className="lg:col-span-1">
            <ConfigurationPanel />
          </div>

          {/* Monitoring Dashboard */}
          <div className="lg:col-span-2">
            <MonitoringDashboard />
          </div>
        </div>
      </div>
    </div>
  );
}
