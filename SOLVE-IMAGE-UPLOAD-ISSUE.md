# راهنمای حل مشکل آپلود تصویر

## 🔧 مشکل
اگر هنوز خطای `POST http://localhost:3001/api/upload-image net::ERR_CONNECTION_REFUSED` می‌بینید، این راه‌حل‌ها را امتحان کنید:

## 🚀 راه‌حل‌های سریع

### 1. پاک کردن کش مرورگر
```
1. F12 را فشار دهید (Developer Tools)
2. روی Network tab کلیک کنید
3. روی "Disable cache" کلیک کنید
4. صفحه را refresh کنید (Ctrl+F5)
```

### 2. Hard Refresh
```
Windows: Ctrl + Shift + R
Mac: Cmd + Shift + R
```

### 3. پاک کردن localStorage
```javascript
// در Developer Tools > Console تایپ کنید:
localStorage.clear();
```

### 4. باز کردن در تب جدید
```
1. تب جدید باز کنید
2. آدرس را دوباره وارد کنید
3. یا از حالت Incognito/Private استفاده کنید
```

## 🔄 راه‌حل کامل

### مرحله 1: توقف سرور
```bash
# اگر سرور در حال اجرا است، آن را متوقف کنید
pkill -f "node server.js"
```

### مرحله 2: پاک کردن کش
```bash
# پاک کردن dist folder
rm -rf dist/

# پاک کردن node_modules (اختیاری)
rm -rf node_modules/
npm install
```

### مرحله 3: Build مجدد
```bash
npm run build
```

### مرحله 4: اجرای مجدد
```bash
npm run dev
```

## ✅ تست عملکرد

### تست 1: بررسی localStorage
```javascript
// در Developer Tools > Console:
console.log('localStorage keys:', Object.keys(localStorage));
```

### تست 2: تست آپلود
1. فایل `test-image-upload.html` را باز کنید
2. یک تصویر انتخاب کنید
3. بررسی کنید که در localStorage ذخیره می‌شود

### تست 3: بررسی کد
```javascript
// در Developer Tools > Sources:
// فایل imageUpload.js را بررسی کنید
// مطمئن شوید که کد جدید load شده است
```

## 🐛 عیب‌یابی

### اگر هنوز مشکل دارید:

1. **بررسی Network tab**:
   - آیا درخواست‌ها به localhost:3001 می‌روند؟
   - اگر بله، کش مرورگر مشکل دارد

2. **بررسی Console**:
   - خطاهای JavaScript را بررسی کنید
   - مطمئن شوید که کد جدید اجرا می‌شود

3. **بررسی Sources**:
   - فایل‌های JavaScript را بررسی کنید
   - مطمئن شوید که کد قدیمی نیست

## 🎯 راه‌حل نهایی

اگر هیچ‌کدام کار نکرد:

1. **مرورگر را کاملاً ببندید**
2. **مرورگر را دوباره باز کنید**
3. **از حالت Incognito استفاده کنید**
4. **یا مرورگر دیگری امتحان کنید**

## 📞 پشتیبانی

اگر مشکل حل نشد:
1. خطاهای دقیق را کپی کنید
2. مرورگر و نسخه آن را مشخص کنید
3. با تیم توسعه تماس بگیرید

---

**نکته**: این مشکل معمولاً به دلیل کش مرورگر است و با پاک کردن کش حل می‌شود. 