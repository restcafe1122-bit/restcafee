import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import multer from "multer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

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

app.post("/api/menu", (req, res) => {
  const items = fs.existsSync(DATA_PATH) ? JSON.parse(fs.readFileSync(DATA_PATH, "utf8")) : [];
  items.push(req.body);
  fs.writeFileSync(DATA_PATH, JSON.stringify(items, null, 2));
  res.json({ message: "Saved" });
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
  res.json({ url: `/uploads/${req.file.filename}` });
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