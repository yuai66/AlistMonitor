import axios from 'axios';

export interface WeChatMessage {
  msgtype: 'text' | 'markdown';
  text?: {
    content: string;
  };
  markdown?: {
    content: string;
  };
}

export class WeChatService {
  private webhookUrl: string;

  constructor(webhookUrl: string) {
    this.webhookUrl = webhookUrl;
  }

  async sendTextMessage(content: string): Promise<boolean> {
    const message: WeChatMessage = {
      msgtype: 'text',
      text: {
        content
      }
    };

    return this.sendMessage(message);
  }

  async sendMarkdownMessage(content: string): Promise<boolean> {
    const message: WeChatMessage = {
      msgtype: 'markdown',
      markdown: {
        content
      }
    };

    return this.sendMessage(message);
  }

  private async sendMessage(message: WeChatMessage): Promise<boolean> {
    try {
      const response = await axios.post(this.webhookUrl, message, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });

      if (response.data.errcode === 0) {
        return true;
      } else {
        throw new Error(`WeChat API Error: ${response.data.errmsg}`);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
          throw new Error('无法连接到企业微信服务器');
        }
        if (error.response?.status === 400) {
          throw new Error('企业微信 WebHook 地址无效');
        }
      }
      throw new Error(`发送企业微信消息失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.sendTextMessage('AList 监控系统连接测试');
      return true;
    } catch {
      return false;
    }
  }
}
