#!/bin/bash

# AList Storage Monitor - Docker Deployment Test Script
# This script tests the Docker deployment to ensure everything works correctly

set -e  # Exit on any error

echo "======================================"
echo "AList 存储监控系统 - Docker 部署测试"
echo "======================================"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "错误: Docker 未安装，请先安装 Docker"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "错误: Docker Compose 未安装，请先安装 Docker Compose"
    exit 1
fi

echo "✓ Docker 和 Docker Compose 已安装"

# Build the Docker image
echo ""
echo "构建 Docker 镜像..."
docker build -t alist-monitor . || {
    echo "❌ Docker 镜像构建失败"
    exit 1
}
echo "✓ Docker 镜像构建成功"

# Start services with docker-compose
echo ""
echo "启动 Docker 服务..."
docker-compose up -d || {
    echo "❌ Docker 服务启动失败"
    exit 1
}
echo "✓ Docker 服务启动成功"

# Wait for services to be ready
echo ""
echo "等待服务启动完成..."
sleep 30

# Test database connection
echo ""
echo "测试数据库连接..."
docker-compose exec -T db pg_isready -U postgres -d alist_monitor || {
    echo "❌ 数据库连接失败"
    docker-compose logs db
    exit 1
}
echo "✓ 数据库连接正常"

# Test application health
echo ""
echo "测试应用程序健康状态..."
for i in {1..10}; do
    if curl -sf http://localhost:5000/api/monitor/status > /dev/null 2>&1; then
        echo "✓ 应用程序健康检查通过"
        break
    fi
    if [ $i -eq 10 ]; then
        echo "❌ 应用程序健康检查失败"
        docker-compose logs app
        exit 1
    fi
    echo "等待应用程序启动... ($i/10)"
    sleep 3
done

# Test API endpoints
echo ""
echo "测试 API 端点..."

# Test config endpoint
curl -sf http://localhost:5000/api/config > /dev/null || {
    echo "❌ 配置 API 测试失败"
    exit 1
}
echo "✓ 配置 API 正常"

# Test storages endpoint
curl -sf http://localhost:5000/api/storages > /dev/null || {
    echo "❌ 存储 API 测试失败"
    exit 1
}
echo "✓ 存储 API 正常"

# Test notifications endpoint
curl -sf http://localhost:5000/api/notifications > /dev/null || {
    echo "❌ 通知 API 测试失败"
    exit 1
}
echo "✓ 通知 API 正常"

echo ""
echo "======================================"
echo "🎉 Docker 部署测试全部通过！"
echo "======================================"
echo ""
echo "应用程序已成功运行在:"
echo "  Web 界面: http://localhost:5000"
echo "  数据库: localhost:5432"
echo ""
echo "管理命令:"
echo "  查看日志: docker-compose logs -f"
echo "  停止服务: docker-compose down"
echo "  重启服务: docker-compose restart"
echo ""
echo "生产部署:"
echo "  docker-compose -f docker-compose.prod.yml up -d"
echo ""