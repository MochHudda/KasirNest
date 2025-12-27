# KasirNest - Smart POS System

A modern, cloud-based Point of Sale (POS) system built with React, Firebase, and Tailwind CSS. Designed to be modular, scalable, and customizable for different business needs.

## 🚀 Features

### Core Features
- **Product Management** - Complete CRUD operations for products with categories, SKUs, and stock tracking
- **Transaction Processing** - Fast and reliable sales transactions with multiple payment methods
- **Inventory Management** - Real-time stock tracking with low stock alerts
- **Sales Analytics** - Dashboard with sales charts and business insights
- **Multi-User Support** - Role-based access with Firebase Authentication
- **PWA Ready** - Installable web app that works offline

### Technical Features
- **Modular Architecture** - Reusable components and services
- **Real-time Updates** - Firebase Firestore integration
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Type Safety** - Full TypeScript implementation
- **Modern UI** - Clean interface built with Tailwind CSS

## 🛠️ Tech Stack

- **Frontend**: Vite + React 18 + TypeScript
- **Styling**: Tailwind CSS + Lucide Icons
- **Backend**: Firebase (Auth + Firestore + Hosting)
- **State Management**: React Hooks + Context API
- **Form Management**: React Hook Form + Zod validation
- **Charts**: Recharts
- **PWA**: Vite PWA Plugin + Workbox

## 📁 Project Structure

```
KasirNest-App/
├── src/
│   ├── components/           # Reusable UI components
│   │   ├── ui/              # Base UI components (Button, Card, Input)
│   │   ├── ProductForm/     # Product CRUD component
│   │   ├── TransactionForm/ # Transaction processing component
│   │   ├── StockList/       # Inventory management component
│   │   └── ...
│   ├── services/            # Business logic services
│   │   ├── authService.ts   # Authentication service
│   │   ├── productService.ts# Product operations
│   │   └── transactionService.ts # Transaction operations
│   ├── config/              # Configuration files
│   │   ├── firebase.ts      # Firebase configuration
│   │   └── storeSettings.ts # Store-specific settings
│   ├── types/               # TypeScript type definitions
│   ├── utils/               # Utility functions
│   ├── hooks/               # Custom React hooks
│   └── pages/               # Page components
├── public/                  # Static assets
├── firebase.json            # Firebase configuration
├── firestore.rules          # Firestore security rules
└── package.json
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Firebase account
- Git

### 1. Clone and Install
```bash
git clone <your-repo-url>
cd KasirNest-App
npm install
```

### 2. Firebase Setup
1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com)
2. Enable Authentication (Email/Password)
3. Enable Firestore Database
4. Enable Hosting (optional)
5. Get your Firebase config from Project Settings

### 3. Environment Configuration
```bash
cp .env.example .env
```

Edit `.env` with your Firebase configuration:
```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456
```

### 4. Firebase CLI Setup
```bash
npm install -g firebase-tools
firebase login
firebase init
```

### 5. Development
```bash
# Start development server
npm run dev

# Start Firebase emulators (optional)
npm run firebase:emulators
```

### 6. Build and Deploy
```bash
# Build for production
npm run build

# Deploy to Firebase
npm run firebase:deploy
```

## 🏪 Store Configuration

KasirNest supports multi-tenant architecture where each store has its own configuration:

```typescript
interface StoreSettings {
  theme: {
    primaryColor: string;
    secondaryColor: string;
    fontFamily: string;
  };
  features: {
    inventory: boolean;
    reports: boolean;
    multiUser: boolean;
    customFields: boolean;
  };
  currency: string;
  taxRate: number;
  customFields: CustomField[];
}
```

## 📱 PWA Features

- **Offline Support** - Basic functionality works without internet
- **App Installation** - Can be installed on mobile devices
- **Push Notifications** - For low stock alerts (future feature)
- **Background Sync** - Sync data when connection restored

## 🔒 Security

- **Firestore Rules** - Row-level security based on store ownership
- **Authentication** - Firebase Auth with email/password
- **Input Validation** - Zod schema validation on frontend
- **Type Safety** - Full TypeScript coverage

## 🎨 Customization

### Adding Custom Fields
```typescript
// Add to store settings
const customFields: CustomField[] = [
  {
    id: 'warranty',
    name: 'Warranty Period',
    type: 'text',
    required: false
  }
];
```

### Theme Customization
```typescript
// Update store theme
storeConfig.setStore({
  ...store,
  settings: {
    ...settings,
    theme: {
      primaryColor: '#your-color',
      secondaryColor: '#your-secondary',
      fontFamily: 'Your Font'
    }
  }
});
```

## 🧪 Development Tools

- **Firebase Emulators** - Local development environment
- **TypeScript** - Type checking and IntelliSense
- **ESLint** - Code linting and formatting
- **Vite** - Fast development server and building

## 📊 Database Schema

### Products Collection
```
/stores/{storeId}/products/{productId}
- name: string
- category: string
- price: number
- stock: number
- createdAt: timestamp
```

### Transactions Collection
```
/stores/{storeId}/transactions/{transactionId}
- items: TransactionItem[]
- total: number
- paymentMethod: string
- createdAt: timestamp
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Contact the development team

## 🗺️ Roadmap

- [ ] Advanced reporting and analytics
- [ ] Barcode scanning
- [ ] Receipt printing
- [ ] Multi-location support
- [ ] API for third-party integrations
- [ ] Mobile app (React Native)
- [ ] Advanced user roles and permissions
- [ ] Inventory forecasting
- [ ] Customer loyalty program
- [ ] Integration with accounting software

---

Built with ❤️ for modern businesses