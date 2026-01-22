#!/bin/bash

# KasirNest Database Setup Script
# This script sets up the MySQL database for KasirNest application

echo "🗄️  Setting up KasirNest MySQL Database..."
echo "========================================"

# Check if MySQL is running
if ! command -v mysql &> /dev/null; then
    echo "❌ MySQL is not installed or not in PATH"
    exit 1
fi

# Database configuration from .env
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-3307}
DB_USER=${DB_USER:-root}
DB_NAME=${DB_NAME:-kasirnest}

echo "📋 Database Configuration:"
echo "   Host: $DB_HOST"
echo "   Port: $DB_PORT" 
echo "   User: $DB_USER"
echo "   Database: $DB_NAME"
echo ""

# Check MySQL connection
echo "🔍 Testing MySQL connection..."
if ! mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p -e "SELECT VERSION();" &> /dev/null; then
    echo "❌ Cannot connect to MySQL. Please check:"
    echo "   - MySQL server is running on $DB_HOST:$DB_PORT"
    echo "   - User '$DB_USER' has proper permissions"
    echo "   - Password is correct"
    exit 1
fi

echo "✅ MySQL connection successful!"
echo ""

# Execute database schema
echo "📊 Creating database and tables..."
if mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p < KasirNest.sql; then
    echo "✅ Database schema created successfully!"
else
    echo "❌ Failed to create database schema"
    exit 1
fi

echo ""
echo "🎉 Database setup completed successfully!"
echo ""
echo "📝 Next steps:"
echo "   1. Install dependencies: npm install"
echo "   2. Start the application: npm run dev"
echo "   3. Access the application at http://localhost:5173"
echo ""
echo "🔐 Default login credentials:"
echo "   Email: admin@kasirnest.com"
echo "   Password: admin123"
echo ""
echo "✨ Happy coding with KasirNest!"