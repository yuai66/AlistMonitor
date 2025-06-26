import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { Bell, AlertTriangle, XCircle, Info, Check, X, ChevronDown } from 'lucide-react';
import type { Notification } from '@shared/schema';

export function NotificationHistory() {
  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['/api/notifications'],
    queryFn: api.getNotifications,
    refetchInterval: 30000,
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'info':
        return <Info className="h-4 w-4 text-blue-600" />;
      default:
        return <Bell className="h-4 w-4 text-gray-600" />;
    }
  };

  const getNotificationBg = (type: string) => {
    switch (type) {
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            <Check className="h-3 w-3 mr-1" />
            已发送
          </Badge>
        );
      case 'failed':
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            <X className="h-3 w-3 mr-1" />
            发送失败
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="secondary">
            待发送
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-yellow-600" />
            通知历史
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-100 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-yellow-600" />
          通知历史
        </CardTitle>
      </CardHeader>
      <CardContent>
        {notifications.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            暂无通知记录
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification: Notification) => (
              <div
                key={notification.id}
                className={`flex items-start space-x-4 p-4 border rounded-lg ${getNotificationBg(notification.type)}`}
              >
                <div className="flex-shrink-0 mt-1">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900">
                        {notification.title}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {notification.message}
                      </p>
                    </div>
                    <span className="text-xs text-gray-500 ml-4 whitespace-nowrap">
                      {new Date(notification.createdAt).toLocaleString('zh-CN')}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center space-x-4">
                    {getStatusBadge(notification.status)}
                    {notification.status === 'sent' && (
                      <span className="text-xs text-gray-500">企业微信机器人</span>
                    )}
                    {notification.status === 'failed' && (
                      <span className="text-xs text-gray-500">网络错误</span>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {notifications.length >= 10 && (
              <div className="text-center mt-6">
                <Button variant="ghost" size="sm">
                  <ChevronDown className="h-4 w-4 mr-1" />
                  加载更多历史记录
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
