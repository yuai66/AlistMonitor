-- Database initialization script for AList Storage Monitor
-- This script ensures the database is properly configured for the application

-- Create extension for UUID generation if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Ensure proper encoding and collation
ALTER DATABASE alist_monitor SET timezone TO 'Asia/Shanghai';

-- Create indexes for better performance (will be created by Drizzle, but included for reference)
-- Note: Drizzle will handle schema creation, this is just for optimization

-- Optimize PostgreSQL settings for the application
ALTER SYSTEM SET shared_preload_libraries = 'pg_stat_statements';
ALTER SYSTEM SET track_activity_query_size = 2048;
ALTER SYSTEM SET log_min_duration_statement = 1000;

-- Note: The actual table schema will be created by Drizzle ORM
-- This file mainly ensures proper database configuration