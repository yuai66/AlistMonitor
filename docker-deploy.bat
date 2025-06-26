@echo off
chcp 65001 >nul
echo AList 存储监控系统 - Docker 部署脚本
echo =====================================

if "%1"=="" goto usage

if "%1"=="build" goto build
if "%1"=="run" goto run
if "%1"=="up" goto up
if "%1"=="down" goto down
if "%1"=="logs" goto logs
if "%1"=="restart" goto restart
if "%1"=="clean" goto clean
if "%1"=="prod" goto prod
goto usage

:build
echo 正在构建 Docker 镜像...
docker build -t alist-monitor .
goto end

:run
echo 正在启动单个容器...
docker run -p 5000:5000 --name alist-monitor-app alist-monitor
goto end

:up
echo 正在启动开发环境服务...
docker-compose up -d
goto end

:prod
echo 正在启动生产环境服务...
docker-compose -f docker-compose.prod.yml up -d
goto end

:down
echo 正在停止所有服务...
docker-compose down
docker-compose -f docker-compose.prod.yml down 2>nul
goto end

:logs
echo 正在显示日志...
docker-compose logs -f
goto end

:restart
echo 正在重启服务...
docker-compose down
docker-compose up -d
goto end

:clean
echo 正在清理容器和镜像...
docker-compose down -v
docker-compose -f docker-compose.prod.yml down -v 2>nul
docker rmi alist-monitor 2>nul
echo 清理完成
goto end

:usage
echo 使用方法: %0 [命令]
echo.
echo 可用命令:
echo   build    - 构建 Docker 镜像
echo   run      - 运行单个容器
echo   up       - 启动开发环境 (应用 + 数据库)
echo   prod     - 启动生产环境
echo   down     - 停止所有服务
echo   logs     - 显示容器日志
echo   restart  - 重启服务
echo   clean    - 清理容器和镜像
echo.
echo 示例:
echo   %0 up       启动开发环境
echo   %0 prod     启动生产环境
echo   %0 logs     查看日志
goto end

:end
pause