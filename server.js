import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { Database } from './database/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'cafe-rest-secret-key-2024';

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
});
app.use('/api/', limiter);

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? true // allow same-origin and proxies
    : ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Initialize database
Database.initializeDefaultData();

// Serve static files from public directory
// Add cache headers for images to avoid stale content during updates
app.use('/images', (req, res, next) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});
app.use(express.static('public'));

// Serve built frontend from dist (production)
const distDir = path.join(__dirname, 'dist');
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, 'public/images');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = path.extname(file.originalname);
    const fileName = `menu-item-${timestamp}${fileExtension}`;
    cb(null, fileName);
  }
});

// File filter to only allow images
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('فقط فایل‌های تصویری مجاز هستند'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 6 * 1024 * 1024 // 6MB limit
  }
});

// Upload endpoint
app.post('/api/upload-image', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'هیچ فایلی آپلود نشده است' });
    }

    const imagePath = `/images/${req.file.filename}`;
    
    res.json({
      success: true,
      path: imagePath,
      fileName: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'خطا در آپلود فایل' });
  }
});

// Get uploaded images list
app.get('/api/images', (req, res) => {
  try {
    const imagesDir = path.join(__dirname, 'public/images');
    
    if (!fs.existsSync(imagesDir)) {
      return res.json({ images: [] });
    }
    
    const files = fs.readdirSync(imagesDir);
    const images = files
      .filter(file => {
        const ext = path.extname(file).toLowerCase();
        return ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext);
      })
      .map(file => ({
        name: file,
        path: `/images/${file}`,
        size: fs.statSync(path.join(imagesDir, file)).size
      }));
    
    res.json({ images });
  } catch (error) {
    console.error('Error getting images:', error);
    res.status(500).json({ error: 'خطا در دریافت لیست تصاویر' });
  }
});

// Delete image endpoint
app.delete('/api/images/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    const imagePath = path.join(__dirname, 'public/images', filename);
    
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
      res.json({ success: true, message: 'تصویر با موفقیت حذف شد' });
    } else {
      res.status(404).json({ error: 'تصویر یافت نشد' });
    }
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({ error: 'خطا در حذف تصویر' });
  }
});

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Auth endpoints
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    const user = await Database.findUserByUsername(username);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/verify', authenticateToken, (req, res) => {
  res.json({ success: true, user: req.user });
});

// Menu Items endpoints
app.get('/api/menu-items', async (req, res) => {
  try {
    const items = await Database.getMenuItems();
    res.json({ success: true, data: items });
  } catch (error) {
    console.error('Error fetching menu items:', error);
    res.status(500).json({ error: 'Failed to fetch menu items' });
  }
});

app.post('/api/menu-items', authenticateToken, async (req, res) => {
  try {
    const newItem = await Database.addMenuItem(req.body);
    res.json({ success: true, data: newItem });
  } catch (error) {
    console.error('Error creating menu item:', error);
    res.status(500).json({ error: 'Failed to create menu item' });
  }
});

app.put('/api/menu-items/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updatedItem = await Database.updateMenuItem(id, req.body);
    res.json({ success: true, data: updatedItem });
  } catch (error) {
    console.error('Error updating menu item:', error);
    if (error.message === 'Menu item not found') {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Failed to update menu item' });
    }
  }
});

app.delete('/api/menu-items/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await Database.deleteMenuItem(id);
    res.json({ success: true, message: 'Menu item deleted successfully' });
  } catch (error) {
    console.error('Error deleting menu item:', error);
    if (error.message === 'Menu item not found') {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Failed to delete menu item' });
    }
  }
});

// Cafe Settings endpoints
app.get('/api/cafe-settings', async (req, res) => {
  try {
    const settings = await Database.getCafeSettings();
    res.json({ success: true, data: settings });
  } catch (error) {
    console.error('Error fetching cafe settings:', error);
    res.status(500).json({ error: 'Failed to fetch cafe settings' });
  }
});

app.put('/api/cafe-settings', authenticateToken, async (req, res) => {
  try {
    const incomingSettings = req.body || {};

    // Sync admin username with users database if changed
    if (incomingSettings.admin_username) {
      const users = await Database.getUsers();
      const currentUserIndex = users.findIndex(u => u.username === req.user.username);
      if (currentUserIndex !== -1) {
        const desiredUsername = String(incomingSettings.admin_username).trim();
        if (desiredUsername && desiredUsername !== users[currentUserIndex].username) {
          const conflict = users.find(u => u.username === desiredUsername);
          if (conflict) {
            return res.status(400).json({ error: 'Username already in use' });
          }
          users[currentUserIndex] = {
            ...users[currentUserIndex],
            username: desiredUsername,
            updated_at: new Date().toISOString()
          };
          await Database.saveUsers(users);
        }
      }
    }

    // Persist cafe settings (note: server is source of truth for user creds)
    await Database.saveCafeSettings(incomingSettings);
    const updatedSettings = await Database.getCafeSettings();
    res.json({ success: true, data: updatedSettings });
  } catch (error) {
    console.error('Error updating cafe settings:', error);
    res.status(500).json({ error: 'Failed to update cafe settings' });
  }
});

// Update authenticated user's password
app.put('/api/auth/password', authenticateToken, async (req, res) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const users = await Database.getUsers();
    const userIndex = users.findIndex(u => u.username === req.user.username);
    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    users[userIndex] = {
      ...users[userIndex],
      password: hashedPassword,
      updated_at: new Date().toISOString()
    };
    await Database.saveUsers(users);

    res.json({ success: true });
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({ error: 'Failed to update password' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// SPA fallback: serve index.html for non-API routes
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  const indexPath = path.join(distDir, 'index.html');
  if (fs.existsSync(indexPath)) {
    return res.sendFile(indexPath);
  }
  return next();
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Upload endpoint: http://localhost:${PORT}/api/upload-image`);
  console.log(`Images served from: http://localhost:${PORT}/images/`);
}); 