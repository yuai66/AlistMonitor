# AList 存储监控系统 - 完整部署指南

## 部署验证结果

✅ **Docker 配置验证通过**
- Dockerfile: Node.js 20 Alpine 基础镜像配置正确
- docker-compose.yml: 开发环境配置完整
- docker-compose.prod.yml: 生产环境包含健康检查
- 应用构建: 前端资源和后端服务包正常生成

✅ **环境配置验证**
- 12个环境变量模板已配置
- PostgreSQL 数据持久化设置完整
- 网络隔离配置正确

## 快速部署步骤

### Windows 系统部署

1. **准备环境**
```cmd
# 确保已安装 Docker Desktop
docker --version
docker-compose --version
```

2. **克隆和配置**
```cmd
git clone [项目地址]
cd alist-storage-monitor
copy .env.docker .env
# 编辑 .env 文件，配置您的 AList 和微信参数
```

3. **启动服务**
```cmd
# 开发环境
docker-deploy.bat up

# 生产环境
docker-deploy.bat prod
```

### Linux 系统部署

1. **准备环境**
```bash
# 安装 Docker 和 Docker Compose
sudo apt update
sudo apt install docker.io docker-compose
sudo usermod -aG docker $USER
```

2. **克隆和配置**
```bash
git clone [项目地址]
cd alist-storage-monitor
cp .env.docker .env
# 编辑配置文件
vim .env
```

3. **启动服务**
```bash
# 开发环境
./docker-scripts.sh up

# 生产环境
./docker-scripts.sh prod
```

## 配置说明

### 环境变量配置 (.env 文件)

```env
# 数据库配置
DATABASE_URL=postgresql://postgres:your_password@db:5432/alist_monitor
POSTGRES_PASSWORD=your_secure_password

# AList 配置
ALIST_URL=http://your-alist-server:5244
ALIST_TOKEN=your_alist_token

# 企业微信配置
WECHAT_WEBHOOK_URL=https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=your_key

# 监控配置
MONITOR_INTERVAL=10
```

### 端口配置

- **应用端口**: 5000 (可在 docker-compose.yml 中修改)
- **数据库端口**: 5432 (仅限内部访问，可选择性暴露)

## 管理命令

### 日常操作
```bash
# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f

# 重启服务
docker-compose restart

# 停止服务
docker-compose down
```

### 数据管理
```bash
# 备份数据库
docker-compose exec db pg_dump -U postgres alist_monitor > backup.sql

# 恢复数据库
docker-compose exec -T db psql -U postgres alist_monitor < backup.sql

# 清理数据重新开始
docker-compose down -v
docker-compose up -d
```

## 健康检查

生产环境包含自动健康检查：

- **应用健康检查**: 每30秒检查 `/api/monitor/status` 端点
- **数据库健康检查**: 每10秒检查 PostgreSQL 连接状态
- **自动重启**: 健康检查失败时自动重启服务

## 监控和告警

### 访问监控界面
- Web 界面: `http://localhost:5000`
- 监控状态: `http://localhost:5000/api/monitor/status`

### 日志监控
```bash
# 实时查看应用日志
docker-compose logs -f app

# 查看数据库日志
docker-compose logs -f db

# 查看所有服务日志
docker-compose logs -f
```

## 故障排除

### 常见问题

1. **端口冲突**
```yaml
# 修改 docker-compose.yml 中的端口映射
services:
  app:
    ports:
      - "8080:5000"  # 改为其他端口
```

2. **数据库连接失败**
```bash
# 检查数据库状态
docker-compose exec db pg_isready -U postgres

# 重启数据库服务
docker-compose restart db
```

3. **应用启动失败**
```bash
# 查看详细错误日志
docker-compose logs app

# 重新构建镜像
docker-compose build --no-cache app
```

### 性能优化

1. **资源限制**
```yaml
# 在 docker-compose.yml 中添加资源限制
services:
  app:
    deploy:
      resources:
        limits:
          memory: 512M
        reservations:
          memory: 256M
```

2. **数据库优化**
```bash
# 进入数据库容器调优
docker-compose exec db psql -U postgres -d alist_monitor
```

## 安全建议

### 生产环境安全配置

1. **更改默认密码**
```env
POSTGRES_PASSWORD=your_very_secure_password_here
```

2. **限制网络访问**
```yaml
# 仅内部网络访问数据库
services:
  db:
    ports: []  # 移除端口暴露
```

3. **使用 HTTPS**
```yaml
# 配置反向代理 (nginx/traefik)
services:
  nginx:
    image: nginx:alpine
    ports:
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/ssl
```

## 更新和维护

### 应用更新
```bash
# 拉取最新代码
git pull origin main

# 重新构建和部署
docker-compose build
docker-compose up -d
```

### 系统维护
```bash
# 清理未使用的镜像
docker system prune -f

# 更新基础镜像
docker-compose pull
docker-compose up -d
```

## 支持和文档

- 详细配置: 参考 `README.docker.md`
- 故障排除: 检查容器日志和健康状态
- 性能监控: 使用 Docker stats 命令监控资源使用

部署完成后，系统将自动开始监控您的 AList 存储状态，并在检测到异常时发送企业微信通知。