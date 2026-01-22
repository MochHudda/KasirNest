# KasirNest - Smart POS System (MySQL Version)

A modern, MySQL-based Point of Sale (POS) system built with React, Node.js/Express, and MySQL. Designed to be modular, scalable, and customizable for different business needs.

## 🚀 Features

### Core Features
- **Product Management** - Complete CRUD operations for products with categories, SKUs, and stock tracking
- **Transaction Processing** - Fast and reliable sales transactions with multiple payment methods
- **Inventory Management** - Real-time stock tracking with low stock alerts
- **Sales Analytics** - Dashboard with sales charts and business insights
- **Multi-User Support** - Role-based access with JWT authentication
- **MySQL Database** - Robust relational database with comprehensive schema

### Technical Features
- **Modular Architecture** - Reusable components and services
- **RESTful API** - Express.js backend with MySQL integration
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Type Safety** - Full TypeScript implementation
- **Modern UI** - Clean interface built with Tailwind CSS

## 🛠️ Tech Stack

### Backend
- **Server**: Node.js + Express.js + TypeScript
- **Database**: MySQL 8.4 with comprehensive schema
- **Authentication**: JWT (JSON Web Tokens)
- **ORM**: Raw MySQL2 with prepared statements
- **Security**: bcrypt for password hashing

### Frontend
- **Framework**: Vite + React 18 + TypeScript
- **Styling**: Tailwind CSS + Lucide Icons
- **State Management**: React Hooks + Context API
- **Form Management**: React Hook Form + Zod validation
- **Charts**: Recharts
- **HTTP Client**: Fetch API with custom wrapper

## 📁 Project Structure

```
KasirNest-App/
├── server/                   # Backend Node.js application
│   ├── routes/              # API endpoints
│   │   ├── auth.ts         # Authentication routes
│   │   ├── products.ts     # Product management
│   │   ├── transactions.ts # Transaction processing
│   │   ├── users.ts        # User management
│   │   └── stores.ts       # Store analytics
│   ├── index.ts            # Express server setup
│   └── tsconfig.json       # TypeScript config for server
├── src/                     # Frontend React application
│   ├── components/         # Reusable UI components
│   ├── services/           # API service layer
│   ├── config/             # Configuration files
│   ├── types/              # TypeScript type definitions
│   ├── pages/              # Page components
│   └── utils/              # Utility functions
├── KasirNest.sql           # Complete MySQL database schema
└── package.json
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MySQL 8.4 (running on localhost:3307)
- npm or yarn
- Git

### 1. Database Setup
1. Start MySQL server on port 3307
2. Execute the database schema:
   ```bash
   mysql -h localhost -P 3307 -u root -p < KasirNest.sql
   ```

### 2. Environment Configuration
```bash
cp .env.example .env
```

Edit `.env` with your database configuration:
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3307
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=kasirnest

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=3000
NODE_ENV=development

# Frontend URL
VITE_API_URL=http://localhost:3000/api
```

### 3. Installation and Setup
```bash
# Install dependencies
npm install

# Start development servers (backend + frontend)
npm run dev
```

The application will start:
- **Backend API**: http://localhost:3000
- **Frontend**: http://localhost:5173

### 4. Default Login
```
Email: admin@kasirnest.com
Password: admin123
```

## 🗃️ Database Schema

The MySQL database includes comprehensive tables for:

### Core Tables
- `users` - User authentication and profiles
- `stores` - Multi-tenant store management
- `store_users` - User-store relationships with roles

### Business Logic
- `products` - Product catalog with inventory tracking
- `product_categories` - Hierarchical product categorization
- `transactions` - Sales transactions with full audit trail
- `transaction_items` - Individual transaction line items
- `customers` - Customer database with purchase history

### Advanced Features
- `suppliers` - Supplier management
- `purchase_orders` - Inventory procurement
- `promotions` - Discount and promotion campaigns
- `stock_movements` - Complete inventory audit trail
- `audit_logs` - System-wide change tracking

### SaaS Features
- `subscription_plans` - Multi-tier subscription management
- `store_subscriptions` - Store subscription tracking
- `employee_shifts` - Time tracking for staff
- `api_keys` - External API integration support

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile
- `POST /api/auth/logout` - User logout

### Products
- `GET /api/products` - List all products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create new product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Transactions
- `GET /api/transactions` - List transactions
- `GET /api/transactions/:id` - Get transaction details
- `POST /api/transactions` - Create new transaction

### Users & Stores
- `GET /api/users` - List store users
- `GET /api/stores/analytics` - Store dashboard data

## 📊 Key Features

### Real-time Inventory
- Automatic stock updates on sales
- Low stock alerts and reporting
- Stock movement tracking with full audit trail

### Multi-User Access
- Role-based permissions (Owner, Admin, Manager, Staff)
- JWT-based authentication
- Store-level access control

### Advanced Analytics
- Sales performance dashboards
- Product performance tracking
- Customer analytics and insights
- Financial reporting

### Enterprise Ready
- Multi-store support
- Subscription-based SaaS architecture
- API integration capabilities
- Comprehensive audit logging

## 🔧 Development

### Running Individual Services
```bash
# Backend only
npm run server:dev

# Frontend only (after backend is running)
npm run dev:client

# Build for production
npm run build
```

### Database Migrations
The complete schema is in `KasirNest.sql`. For updates:
1. Modify the schema file
2. Create migration scripts for existing data
3. Apply changes to development/production databases

### API Documentation
- All endpoints return JSON responses
- Authentication required for protected routes
- Consistent error handling and response formats

## 📈 Production Deployment

### Database
- Set up MySQL 8.4 in production environment
- Configure proper database users and permissions
- Set up regular backups and monitoring

### Backend
- Build TypeScript: `npm run server:build`
- Start production server: `npm run server:start`
- Configure reverse proxy (nginx/Apache)
- Set up SSL certificates

### Frontend
- Build React app: `npm run build`
- Deploy static files to web server
- Configure API endpoint URLs

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🔗 Related

- [MySQL Documentation](https://dev.mysql.com/doc/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [React Documentation](https://reactjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

**Note**: This is the MySQL version of KasirNest. The original Firebase version is available in the `firebase` branch.