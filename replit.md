# AList Storage Monitoring System

## Overview

This is a full-stack web application for monitoring AList storage status with WeChat webhook notifications. The system provides real-time monitoring of storage mount points and sends notifications when storage states change or issues are detected.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: Radix UI primitives with shadcn/ui components
- **State Management**: TanStack Query (React Query) for server state
- **Form Handling**: React Hook Form with Zod validation
- **Routing**: Wouter for lightweight client-side routing

### Backend Architecture
- **Runtime**: Node.js 20 with TypeScript
- **Framework**: Express.js for REST API
- **Database**: PostgreSQL with Drizzle ORM
- **Session Management**: Express sessions with PostgreSQL store
- **Task Scheduling**: node-cron for automated monitoring
- **HTTP Client**: Axios for external API calls

## Key Components

### Database Schema
- **users**: User authentication and management
- **configurations**: System configuration including AList URL/token, webhook URL, monitoring intervals
- **storages**: Storage mount point information and status tracking
- **notifications**: Notification history and delivery status

### API Services
- **AList Service**: Integration with AList API for storage status retrieval
- **WeChat Service**: WeChat webhook integration for notifications
- **Monitor Service**: Automated monitoring with configurable intervals

### UI Components
- **Configuration Panel**: System settings management with form validation
- **Storage Table**: Real-time storage status display
- **Notification History**: Notification log with delivery status
- **Monitoring Dashboard**: Centralized view of system status

## Data Flow

1. **Configuration**: Users configure AList connection details and webhook URL
2. **Connection Testing**: System validates AList and WeChat webhook connectivity
3. **Monitoring Activation**: Automated monitoring starts based on configured intervals
4. **Status Checking**: System periodically fetches storage status from AList API
5. **Change Detection**: Compares current status with previous state
6. **Notification Dispatch**: Sends WeChat notifications for status changes
7. **Status Updates**: Updates database with current storage states and notification history

## External Dependencies

### Production Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL driver
- **drizzle-orm**: Type-safe database operations
- **express**: Web framework
- **node-cron**: Task scheduling
- **axios**: HTTP client
- **connect-pg-simple**: PostgreSQL session store

### Development Dependencies
- **tsx**: TypeScript execution
- **esbuild**: Fast JavaScript bundler
- **@replit/vite-plugin-***: Replit-specific development tools

## Deployment Strategy

### Docker Deployment
- **Production**: Docker Compose with PostgreSQL container
- **Development**: `npm run dev` - starts both frontend and backend with hot reload
- **Build**: Multi-stage Docker build with optimized production bundle
- **Services**: App container + PostgreSQL database container

### Docker Configuration
- **Base Image**: Node.js 20 Alpine Linux
- **Ports**: App (5000), Database (5432)
- **Volumes**: PostgreSQL data persistence
- **Networks**: Internal Docker network for service communication
- **Environment**: Production-optimized with environment variables

### Replit Configuration (Legacy)
- **Modules**: nodejs-20, web, postgresql-16
- **Ports**: Internal port 5000, external port 80
- **Note**: Project now supports both Replit and Docker deployment

### Database Management
- **Migrations**: Drizzle Kit for schema management
- **Push Command**: `npm run db:push` - applies schema changes
- **Connection**: Environment variable `DATABASE_URL` required

## Changelog

Changelog:
- June 26, 2025. Initial setup with in-memory storage
- June 26, 2025. Added PostgreSQL database support and fixed AList API integration
  - Fixed AList authentication header format (removed incorrect Bearer prefix)
  - Resolved database constraint errors by mapping mount_path to storage name
  - Successfully connected to user's AList server with 6 storage items detected
  - Migrated from MemStorage to DatabaseStorage for data persistence
- June 26, 2025. Converted project to Docker deployment
  - Created Dockerfile with Node.js 20 Alpine base image
  - Added docker-compose.yml with PostgreSQL service
  - Created Docker management scripts and environment configuration
  - Added comprehensive Docker deployment documentation
  - Supports both development and production Docker environments

## User Preferences

Preferred communication style: Simple, everyday language.