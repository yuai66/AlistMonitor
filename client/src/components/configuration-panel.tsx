import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import { Settings, Save, Play, TestTube, Clock } from 'lucide-react';

const configSchema = z.object({
  alistUrl: z.string().url('请输入有效的 URL'),
  alistToken: z.string().min(1, '请输入 AList 令牌'),
  webhookUrl: z.string().url('请输入有效的 WebHook URL'),
  interval: z.number().min(1).max(60),
  isActive: z.boolean().default(false),
});

type ConfigForm = z.infer<typeof configSchema>;

export function ConfigurationPanel() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [testingAList, setTestingAList] = useState(false);
  const [testingWeChat, setTestingWeChat] = useState(false);

  const { data: config, isLoading } = useQuery({
    queryKey: ['/api/config'],
    queryFn: api.getConfig,
  });

  const { data: monitorStatus } = useQuery({
    queryKey: ['/api/monitor/status'],
    queryFn: api.getMonitorStatus,
    refetchInterval: 5000,
  });

  const form = useForm<ConfigForm>({
    resolver: zodResolver(configSchema),
    defaultValues: {
      alistUrl: config?.alistUrl || '',
      alistToken: config?.alistToken || '',
      webhookUrl: config?.webhookUrl || '',
      interval: config?.interval || 10,
      isActive: config?.isActive || false,
    },
  });

  // Update form when config loads
  if (config && !form.formState.isDirty) {
    form.reset({
      alistUrl: config.alistUrl,
      alistToken: config.alistToken,
      webhookUrl: config.webhookUrl,
      interval: config.interval,
      isActive: config.isActive,
    });
  }

  const saveConfigMutation = useMutation({
    mutationFn: api.saveConfig,
    onSuccess: () => {
      toast({ title: '成功', description: '配置保存成功' });
      queryClient.invalidateQueries({ queryKey: ['/api/config'] });
    },
    onError: (error: any) => {
      toast({ 
        title: '错误', 
        description: error.message || '保存配置失败',
        variant: 'destructive' 
      });
    },
  });

  const startMonitoringMutation = useMutation({
    mutationFn: api.startMonitoring,
    onSuccess: () => {
      toast({ title: '成功', description: '监控服务已启动' });
      queryClient.invalidateQueries({ queryKey: ['/api/monitor/status'] });
    },
    onError: (error: any) => {
      toast({ 
        title: '错误', 
        description: error.message || '启动监控失败',
        variant: 'destructive' 
      });
    },
  });

  const handleSaveConfig = async (data: ConfigForm) => {
    await saveConfigMutation.mutateAsync(data);
  };

  const handleStartMonitoring = async () => {
    await startMonitoringMutation.mutateAsync();
  };

  const handleTestAList = async () => {
    const alistUrl = form.getValues('alistUrl');
    const alistToken = form.getValues('alistToken');
    
    if (!alistUrl || !alistToken) {
      toast({ 
        title: '错误', 
        description: '请先填写 AList 配置',
        variant: 'destructive' 
      });
      return;
    }

    setTestingAList(true);
    try {
      await api.testAList(alistUrl, alistToken);
      toast({ title: '成功', description: 'AList 连接测试成功' });
    } catch (error: any) {
      toast({ 
        title: '错误', 
        description: error.message || 'AList 连接测试失败',
        variant: 'destructive' 
      });
    } finally {
      setTestingAList(false);
    }
  };

  const handleTestWeChat = async () => {
    const webhookUrl = form.getValues('webhookUrl');
    
    if (!webhookUrl) {
      toast({ 
        title: '错误', 
        description: '请先填写企业微信 WebHook 地址',
        variant: 'destructive' 
      });
      return;
    }

    setTestingWeChat(true);
    try {
      await api.testWeChat(webhookUrl);
      toast({ title: '成功', description: '企业微信连接测试成功' });
    } catch (error: any) {
      toast({ 
        title: '错误', 
        description: error.message || '企业微信连接测试失败',
        variant: 'destructive' 
      });
    } finally {
      setTestingWeChat(false);
    }
  };

  if (isLoading) {
    return <div className="animate-pulse">加载中...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-blue-600" />
            配置设置
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(handleSaveConfig)} className="space-y-6">
            {/* AList Configuration */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-700">AList 服务器配置</h3>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="alistUrl">服务器地址</Label>
                  <div className="flex gap-2">
                    <Input
                      id="alistUrl"
                      {...form.register('alistUrl')}
                      placeholder="http://bilii.fun:5244"
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleTestAList}
                      disabled={testingAList}
                    >
                      <TestTube className="h-4 w-4 mr-1" />
                      {testingAList ? '测试中...' : '测试'}
                    </Button>
                  </div>
                  {form.formState.errors.alistUrl && (
                    <p className="text-sm text-red-600">{form.formState.errors.alistUrl.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="alistToken">访问令牌</Label>
                  <Textarea
                    id="alistToken"
                    {...form.register('alistToken')}
                    placeholder="alist-f96759d4-ee32-4f0a..."
                    rows={3}
                    className="text-xs"
                  />
                  {form.formState.errors.alistToken && (
                    <p className="text-sm text-red-600">{form.formState.errors.alistToken.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* WeChat Configuration */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-700">企业微信机器人配置</h3>
              <div>
                <Label htmlFor="webhookUrl">WebHook 地址</Label>
                <div className="flex gap-2">
                  <Textarea
                    id="webhookUrl"
                    {...form.register('webhookUrl')}
                    placeholder="https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=..."
                    rows={2}
                    className="text-xs flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleTestWeChat}
                    disabled={testingWeChat}
                    className="self-start"
                  >
                    <TestTube className="h-4 w-4 mr-1" />
                    {testingWeChat ? '测试中...' : '测试'}
                  </Button>
                </div>
                {form.formState.errors.webhookUrl && (
                  <p className="text-sm text-red-600">{form.formState.errors.webhookUrl.message}</p>
                )}
              </div>
            </div>

            {/* Monitoring Settings */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-700">监控设置</h3>
              <div>
                <Label htmlFor="interval">检查间隔（分钟）</Label>
                <Select
                  value={form.watch('interval').toString()}
                  onValueChange={(value) => form.setValue('interval', parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 分钟</SelectItem>
                    <SelectItem value="10">10 分钟</SelectItem>
                    <SelectItem value="15">15 分钟</SelectItem>
                    <SelectItem value="30">30 分钟</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex space-x-3">
              <Button 
                type="submit" 
                className="flex-1"
                disabled={saveConfigMutation.isPending}
              >
                <Save className="h-4 w-4 mr-2" />
                {saveConfigMutation.isPending ? '保存中...' : '保存配置'}
              </Button>
              <Button 
                type="button"
                onClick={handleStartMonitoring}
                className="flex-1 bg-green-600 hover:bg-green-700"
                disabled={startMonitoringMutation.isPending || !config}
              >
                <Play className="h-4 w-4 mr-2" />
                {startMonitoringMutation.isPending ? '启动中...' : '开始监控'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-green-600" />
            监控概览
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {monitorStatus?.totalStorages || 0}
                </div>
                <div className="text-sm text-gray-500">总存储数</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {monitorStatus?.workingStorages || 0}
                </div>
                <div className="text-sm text-gray-500">正常存储</div>
              </div>
            </div>
            <div className="pt-4 border-t border-gray-200">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">上次检查</span>
                <span className="text-gray-900">
                  {monitorStatus?.lastCheck || '暂无'}
                </span>
              </div>
              <div className="flex justify-between text-sm mt-2">
                <span className="text-gray-500">下次检查</span>
                <span className="text-gray-900">
                  {monitorStatus?.nextCheck || '暂无'}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
