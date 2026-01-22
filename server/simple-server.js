const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: 'http://localhost:5175',
  credentials: true
}));

app.use(express.json());

// Basic health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'KasirNest API Server is running',
    timestamp: new Date().toISOString()
  });
});

// Basic auth endpoints for testing
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  // Demo user for testing
  if (email === 'admin@kasirnest.com' && password === 'admin123') {
    res.json({
      token: 'demo-token-' + Date.now(),
      user: {
        id: '1',
        email: 'admin@kasirnest.com',
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        storeId: 'store-1'
      }
    });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

app.get('/api/auth/me', (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    res.json({
      id: '1',
      email: 'admin@kasirnest.com',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      storeId: 'store-1'
    });
  } else {
    res.status(401).json({ message: 'Unauthorized' });
  }
});

// Basic products endpoint
app.get('/api/products', (req, res) => {
  res.json([
    {
      id: '1',
      name: 'Sample Product',
      price: 10000,
      stock: 50,
      category: 'food',
      description: 'Sample product for testing'
    }
  ]);
});

// Basic transactions endpoint
app.get('/api/transactions', (req, res) => {
  res.json([
    {
      id: '1',
      transactionNumber: 'TXN-001',
      total: 10000,
      status: 'completed',
      createdAt: new Date().toISOString()
    }
  ]);
});

// Catch all undefined routes
app.use('*', (req, res) => {
  res.status(404).json({ message: 'API endpoint not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 KasirNest API Server running on http://localhost:${PORT}`);
  console.log(`📊 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`🔐 Login endpoint: http://localhost:${PORT}/api/auth/login`);
});