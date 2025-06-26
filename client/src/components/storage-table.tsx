import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Database, RefreshCw, Cloud, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import type { Storage } from '@shared/schema';

export function StorageTable() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: storages = [], isLoading } = useQuery({
    queryKey: ['/api/storages'],
    queryFn: api.getStorages,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const manualCheckMutation = useMutation({
    mutationFn: api.manualCheck,
    onSuccess: () => {
      toast({ title: '成功', description: '手动检查已完成' });
      queryClient.invalidateQueries({ queryKey: ['/api/storages'] });
      queryClient.invalidateQueries({ queryKey: ['/api/monitor/status'] });
    },
    onError: (error: any) => {
      toast({ 
        title: '错误', 
        description: error.message || '手动检查失败',
        variant: 'destructive' 
      });
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'work':
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            <CheckCircle className="h-3 w-3 mr-1" />
            work
          </Badge>
        );
      case 'disabled':
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            <XCircle className="h-3 w-3 mr-1" />
            disabled
          </Badge>
        );
      case 'error':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            <AlertTriangle className="h-3 w-3 mr-1" />
            error
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary">
            <AlertTriangle className="h-3 w-3 mr-1" />
            {status}
          </Badge>
        );
    }
  };

  const getDriverIcon = (driver: string) => {
    // You can customize icons based on driver type
    return <Cloud className="h-4 w-4 text-blue-500" />;
  };

  const handleManualCheck = () => {
    manualCheckMutation.mutate();
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-blue-600" />
            存储状态监控
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-100 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-blue-600" />
            存储状态监控
          </CardTitle>
          <Button
            onClick={handleManualCheck}
            disabled={manualCheckMutation.isPending}
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${manualCheckMutation.isPending ? 'animate-spin' : ''}`} />
            {manualCheckMutation.isPending ? '检查中...' : '手动检查'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {storages.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            暂无存储数据，请先配置 AList 并启动监控
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    存储名称
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    类型
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    状态
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    最后更新
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {storages.map((storage: Storage) => (
                  <tr key={storage.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getDriverIcon(storage.driver)}
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {storage.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {storage.mountPath}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {storage.driver}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(storage.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(storage.lastCheck).toLocaleString('zh-CN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
