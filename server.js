import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS for frontend
app.use(cors());
app.use(express.json());

// Serve static files from public directory
app.use(express.static('public'));

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
    fileSize: 5 * 1024 * 1024 // 5MB limit
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

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Upload endpoint: http://localhost:${PORT}/api/upload-image`);
  console.log(`Images served from: http://localhost:${PORT}/images/`);
}); 