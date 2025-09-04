import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import multer from "multer";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'cafe-rest-secret-key-2024';

// Auth middleware
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

// 🚫 جلوگیری از کش روی همه APIها
app.use("/api", (req, res, next) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  next();
});

// مسیر فایل دیتا
const DATA_PATH = path.join(__dirname, "database", "data", "menu.json");
if (!fs.existsSync(DATA_PATH)) {
  fs.mkdirSync(path.dirname(DATA_PATH), { recursive: true });
  fs.writeFileSync(DATA_PATH, "[]");
}

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// API منو
app.get("/api/menu", (req, res) => {
  const data = JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));
  res.json(data);
});

app.post("/api/menu", authenticateToken, (req, res) => {
  const items = fs.existsSync(DATA_PATH) ? JSON.parse(fs.readFileSync(DATA_PATH, "utf8")) : [];
  const newItem = {
    id: Date.now().toString(36) + Math.random().toString(36).substr(2),
    ...req.body,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  items.push(newItem);
  fs.writeFileSync(DATA_PATH, JSON.stringify(items, null, 2));
  res.json(newItem);
});

app.put("/api/menu/:id", authenticateToken, (req, res) => {
  const items = fs.existsSync(DATA_PATH) ? JSON.parse(fs.readFileSync(DATA_PATH, "utf8")) : [];
  const index = items.findIndex(item => item.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Menu item not found' });
  }
  items[index] = {
    ...items[index],
    ...req.body,
    updated_at: new Date().toISOString()
  };
  fs.writeFileSync(DATA_PATH, JSON.stringify(items, null, 2));
  res.json(items[index]);
});

app.delete("/api/menu/:id", authenticateToken, (req, res) => {
  const items = fs.existsSync(DATA_PATH) ? JSON.parse(fs.readFileSync(DATA_PATH, "utf8")) : [];
  const filteredItems = items.filter(item => item.id !== req.params.id);
  if (filteredItems.length === items.length) {
    return res.status(404).json({ error: 'Menu item not found' });
  }
  fs.writeFileSync(DATA_PATH, JSON.stringify(filteredItems, null, 2));
  res.json({ success: true, message: 'Menu item deleted successfully' });
});

// آپلود فایل (سازگار با فرانت)
const imagesDir = path.join(__dirname, "public", "images");
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, imagesDir),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

app.post("/api/upload", upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file" });
  res.json({ 
    success: true,
    path: `/uploads/${req.file.filename}`,
    url: `/uploads/${req.file.filename}`,
    fileName: req.file.filename,
    size: req.file.size
  });
});

// Auth endpoints
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    // Simple hardcoded admin for now
    if (username === 'admin' && password === 'rest2024') {
      const token = jwt.sign(
        { id: 'admin', username: 'admin', role: 'admin' },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        success: true,
        token,
        user: {
          id: 'admin',
          username: 'admin',
          role: 'admin'
        }
      });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/verify', authenticateToken, (req, res) => {
  res.json({ success: true, user: req.user });
});

// سرو کردن تصاویر آپلود شده (no-store cache)
app.use(
  "/uploads",
  (req, res, next) => {
    res.setHeader("Cache-Control", "no-store");
    next();
  },
  express.static(path.join(__dirname, "public", "images"))
);

// سرو کردن فرانت (React build)
const distDir = path.join(__dirname, "dist");
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
  app.get("*", (req, res) => {
    res.sendFile(path.join(distDir, "index.html"));
  });
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("✅ Server running on port", PORT);
});