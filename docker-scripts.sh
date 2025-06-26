#!/bin/bash

# Docker management scripts for AList Storage Monitor

case "$1" in
  "build")
    echo "Building Docker image..."
    docker build -t alist-monitor .
    ;;
  "run")
    echo "Running Docker container..."
    docker run -p 5000:5000 --name alist-monitor-app alist-monitor
    ;;
  "up")
    echo "Starting services with docker-compose..."
    docker-compose up -d
    ;;
  "down")
    echo "Stopping services..."
    docker-compose down
    ;;
  "logs")
    echo "Showing logs..."
    docker-compose logs -f
    ;;
  "restart")
    echo "Restarting services..."
    docker-compose down
    docker-compose up -d
    ;;
  "clean")
    echo "Cleaning up containers and images..."
    docker-compose down -v
    docker rmi alist-monitor 2>/dev/null || true
    ;;
  *)
    echo "Usage: $0 {build|run|up|down|logs|restart|clean}"
    echo ""
    echo "Commands:"
    echo "  build    - Build the Docker image"
    echo "  run      - Run single container"
    echo "  up       - Start all services (app + database)"
    echo "  down     - Stop all services"
    echo "  logs     - Show container logs"
    echo "  restart  - Restart all services"
    echo "  clean    - Remove containers and images"
    exit 1
    ;;
esac