# AList 存储监控系统 - Docker 部署指南

## 概述

该项目现已配置为使用 Docker 进行部署，包含应用程序和 PostgreSQL 数据库的完整容器化解决方案。

## 系统要求

- Docker Engine 20.10+
- Docker Compose 2.0+
- 至少 2GB 可用内存
- 至少 1GB 可用磁盘空间

## 快速开始

### 1. 克隆项目
```bash
git clone <repository-url>
cd alist-storage-monitor
```

### 2. 配置环境变量
```bash
# 复制环境配置文件
cp .env.docker .env

# 编辑配置文件，更新您的 AList 和微信配置
vim .env
```

### 3. 启动服务
```bash
# 使用 docker-compose 启动所有服务
./docker-scripts.sh up

# 或者直接使用 docker-compose
docker-compose up -d
```

### 4. 访问应用
应用将在以下地址可用：
- Web 界面: http://localhost:5000
- 数据库: localhost:5432 (如需直接访问)

## Docker 管理命令

使用提供的脚本管理 Docker 服务：

```bash
# 构建镜像
./docker-scripts.sh build

# 启动所有服务
./docker-scripts.sh up

# 停止所有服务
./docker-scripts.sh down

# 查看日志
./docker-scripts.sh logs

# 重启服务
./docker-scripts.sh restart

# 清理容器和镜像
./docker-scripts.sh clean
```

## 配置说明

### 数据库配置
- 数据库名: `alist_monitor`
- 用户名: `postgres`
- 密码: `password`
- 端口: `5432`

### 应用配置
在 `.env` 文件中配置以下参数：

```env
# AList 服务器配置
ALIST_URL=http://your-alist-server:5244
ALIST_TOKEN=your_alist_token

# 企业微信 Webhook
WECHAT_WEBHOOK_URL=https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=your_key

# 监控间隔（分钟）
MONITOR_INTERVAL=10
```

## 数据持久化

PostgreSQL 数据通过 Docker 卷进行持久化：
- 卷名: `postgres_data`
- 数据将在容器重启后保持不变

## 网络配置

Docker Compose 创建一个内部网络，服务间通过服务名通信：
- 应用服务: `app`
- 数据库服务: `db`

## 健康检查

应用包含以下端点用于健康检查：
- `/api/monitor/status` - 监控状态
- `/api/config` - 配置状态

## 故障排除

### 查看日志
```bash
# 查看所有服务日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs -f app
docker-compose logs -f db
```

### 重置数据库
```bash
# 停止服务并删除数据卷
docker-compose down -v

# 重新启动
docker-compose up -d
```

### 端口冲突
如果端口 5000 或 5432 已被占用，修改 `docker-compose.yml` 中的端口映射：

```yaml
services:
  app:
    ports:
      - "8080:5000"  # 将应用映射到端口 8080
  db:
    ports:
      - "5433:5432"  # 将数据库映射到端口 5433
```

## 生产部署建议

1. **安全配置**
   - 更改默认数据库密码
   - 使用环境变量管理敏感信息
   - 配置防火墙规则

2. **监控和日志**
   - 配置日志轮转
   - 监控容器资源使用
   - 设置告警机制

3. **备份策略**
   - 定期备份 PostgreSQL 数据
   - 备份配置文件

4. **更新和维护**
   - 定期更新 Docker 镜像
   - 监控安全漏洞
   - 测试恢复流程

## 开发模式

如需在开发模式下运行（不使用 Docker）：

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

开发模式需要本地 PostgreSQL 数据库，配置 `DATABASE_URL` 环境变量。