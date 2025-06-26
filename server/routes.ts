import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertConfigurationSchema } from "@shared/schema";
import { AListService } from "./services/alist";
import { WeChatService } from "./services/wechat";
import { monitorService } from "./services/monitor";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Get configuration
  app.get("/api/config", async (req, res) => {
    try {
      const config = await storage.getConfiguration();
      res.json(config || null);
    } catch (error) {
      res.status(500).json({ error: "获取配置失败" });
    }
  });

  // Save configuration
  app.post("/api/config", async (req, res) => {
    try {
      const validatedData = insertConfigurationSchema.parse(req.body);
      const config = await storage.saveConfiguration(validatedData);
      res.json(config);
    } catch (error) {
      res.status(400).json({ error: "配置数据无效" });
    }
  });

  // Test AList connection
  app.post("/api/test-alist", async (req, res) => {
    try {
      const { alistUrl, alistToken } = req.body;
      if (!alistUrl || !alistToken) {
        return res.status(400).json({ error: "缺少必要参数" });
      }

      const alistService = new AListService(alistUrl, alistToken);
      const isConnected = await alistService.testConnection();
      
      if (isConnected) {
        res.json({ success: true, message: "AList 连接测试成功" });
      } else {
        res.status(400).json({ error: "AList 连接测试失败" });
      }
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : "连接测试失败" });
    }
  });

  // Test WeChat webhook
  app.post("/api/test-wechat", async (req, res) => {
    try {
      const { webhookUrl } = req.body;
      if (!webhookUrl) {
        return res.status(400).json({ error: "缺少 WebHook 地址" });
      }

      const wechatService = new WeChatService(webhookUrl);
      const isConnected = await wechatService.testConnection();
      
      if (isConnected) {
        res.json({ success: true, message: "企业微信连接测试成功" });
      } else {
        res.status(400).json({ error: "企业微信连接测试失败" });
      }
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : "连接测试失败" });
    }
  });

  // Start monitoring
  app.post("/api/monitor/start", async (req, res) => {
    try {
      await monitorService.startMonitoring();
      res.json({ success: true, message: "监控服务已启动" });
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : "启动监控失败" });
    }
  });

  // Stop monitoring
  app.post("/api/monitor/stop", async (req, res) => {
    try {
      monitorService.stopMonitoring();
      res.json({ success: true, message: "监控服务已停止" });
    } catch (error) {
      res.status(500).json({ error: "停止监控失败" });
    }
  });

  // Get monitoring status
  app.get("/api/monitor/status", async (req, res) => {
    try {
      const isActive = monitorService.isMonitoringActive();
      const config = await storage.getConfiguration();
      const storages = await storage.getStorages();
      
      const totalStorages = storages.length;
      const workingStorages = storages.filter(s => s.status === 'work').length;
      
      const lastCheck = storages.length > 0 
        ? Math.max(...storages.map(s => s.lastCheck.getTime())) 
        : null;
      
      const nextCheck = isActive && config ? 
        new Date(Date.now() + config.interval * 60 * 1000) : null;

      res.json({
        isActive,
        totalStorages,
        workingStorages,
        lastCheck: lastCheck ? new Date(lastCheck).toLocaleString('zh-CN') : null,
        nextCheck: nextCheck ? nextCheck.toLocaleString('zh-CN') : null
      });
    } catch (error) {
      res.status(500).json({ error: "获取监控状态失败" });
    }
  });

  // Manual check
  app.post("/api/monitor/check", async (req, res) => {
    try {
      await monitorService.performManualCheck();
      res.json({ success: true, message: "手动检查已完成" });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "手动检查失败" });
    }
  });

  // Get storages
  app.get("/api/storages", async (req, res) => {
    try {
      const storages = await storage.getStorages();
      res.json(storages);
    } catch (error) {
      res.status(500).json({ error: "获取存储列表失败" });
    }
  });

  // Get notifications
  app.get("/api/notifications", async (req, res) => {
    try {
      const notifications = await storage.getNotifications();
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ error: "获取通知历史失败" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
