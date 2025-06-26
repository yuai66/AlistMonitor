import * as cron from 'node-cron';
import { storage } from '../storage';
import { AListService } from './alist';
import { WeChatService } from './wechat';

export class MonitorService {
  private cronJob: cron.ScheduledTask | null = null;
  private isRunning = false;

  async startMonitoring(): Promise<void> {
    const config = await storage.getConfiguration();
    if (!config || !config.isActive) {
      throw new Error('监控配置未找到或未激活');
    }

    if (this.isRunning) {
      this.stopMonitoring();
    }

    // Create cron expression for the interval
    const cronExpression = `*/${config.interval} * * * *`;
    
    this.cronJob = cron.schedule(cronExpression, async () => {
      await this.checkStorages();
    });

    this.cronJob.start();
    this.isRunning = true;

    // Create system notification
    await storage.createNotification({
      title: '监控服务启动',
      message: `AList 存储监控服务已成功启动，监控间隔：${config.interval}分钟`,
      type: 'info',
      status: 'sent',
      createdAt: new Date()
    });
  }

  stopMonitoring(): void {
    if (this.cronJob) {
      this.cronJob.destroy();
      this.cronJob = null;
    }
    this.isRunning = false;
  }

  isMonitoringActive(): boolean {
    return this.isRunning;
  }

  async checkStorages(): Promise<void> {
    try {
      const config = await storage.getConfiguration();
      if (!config) {
        throw new Error('监控配置未找到');
      }

      const alistService = new AListService(config.alistUrl, config.alistToken);
      const wechatService = new WeChatService(config.webhookUrl);

      const storages = await alistService.getStorages();
      const now = new Date();

      for (const alistStorage of storages) {
        // Update or create storage record
        // Use mount_path as name since AList API doesn't provide a separate name field
        const storageName = alistStorage.mount_path || `存储-${alistStorage.id}`;
        
        await storage.upsertStorage({
          name: storageName,
          driver: alistStorage.driver,
          mountPath: alistStorage.mount_path,
          status: alistStorage.status,
          lastCheck: now
        });

        // Check if status needs notification
        if (alistStorage.status !== 'work' && alistStorage.status !== 'disabled') {
          const notification = await storage.createNotification({
            title: '存储状态异常警告',
            message: `检测到存储 "${storageName}" 状态为 "${alistStorage.status}"，请及时检查。`,
            type: alistStorage.status === 'error' ? 'error' : 'warning',
            status: 'pending',
            createdAt: now
          });

          // Send WeChat notification
          try {
            const message = `🚨 AList 存储状态异常\n\n存储名称：${storageName}\n存储类型：${alistStorage.driver}\n挂载路径：${alistStorage.mount_path}\n当前状态：${alistStorage.status}\n检查时间：${now.toLocaleString('zh-CN')}\n\n请及时检查并处理。`;
            
            await wechatService.sendTextMessage(message);
            await storage.updateNotificationStatus(notification.id, 'sent');
          } catch (error) {
            await storage.updateNotificationStatus(notification.id, 'failed');
            console.error('Failed to send WeChat notification:', error);
          }
        }
      }
    } catch (error) {
      console.error('Storage check failed:', error);
      
      // Create error notification
      await storage.createNotification({
        title: '监控检查失败',
        message: `存储状态检查失败：${error instanceof Error ? error.message : '未知错误'}`,
        type: 'error',
        status: 'sent',
        createdAt: new Date()
      });
    }
  }

  async performManualCheck(): Promise<void> {
    await this.checkStorages();
  }
}

export const monitorService = new MonitorService();
