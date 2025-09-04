import React, { useState, useRef } from "react";
import { CafeSettings } from "../../entities";
import { authAPI } from "../../services/api";
import { Card, CardContent, CardHeader, CardTitle } from "../ui";
import { Button } from "../ui";
import { Input } from "../ui";
import { Label, Textarea } from "../ui";
import { Alert, AlertDescription } from "../ui";
import { Save, Instagram, MapPin, Phone, Image as ImageIcon, Upload, X, Eye, EyeOff, Lock } from "lucide-react";
import { uploadImageToLocal, uploadImageToServer, validateImageFile, createImagePreview, getImageFromStorage, cleanupOldImages, dataUrlToFile } from "../../utils";

export default function CafeSettingsManager({ cafeSettings, setCafeSettings, onDataChange }) {
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [selectedLogo, setSelectedLogo] = useState(null);
  const [selectedHeroImage, setSelectedHeroImage] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [heroImagePreview, setHeroImagePreview] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const logoFileInputRef = useRef(null);
  const heroImageFileInputRef = useRef(null);

  // Initialize form data when cafeSettings changes
  React.useEffect(() => {
    if (cafeSettings) {
      console.log("CafeSettingsManager: Setting form data from cafeSettings:", cafeSettings);
      setFormData(cafeSettings);
      // Set existing images as previews
      setLogoPreview(cafeSettings.logo_url || null);
      setHeroImagePreview(cafeSettings.hero_image_url || null);
    } else {
      // Set default form data if no settings exist
      console.log("CafeSettingsManager: Setting default form data");
      setFormData({
        cafe_name: "کافه رست",
        location: "اردبیل",
        description: "بهترین قهوه و شیک در اردبیل",
        phone: "",
        instagram_url: "",
        logo_url: "",
        hero_image_url: "",
        admin_username: "admin",
        admin_password: "rest2024"
      });
      setLogoPreview(null);
      setHeroImagePreview(null);
    }
  }, [cafeSettings]);

  const handleInputChange = (field, value) => {
    console.log(`CafeSettingsManager: Updating field ${field} to:`, value);
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Function to handle logo file selection
  const handleLogoSelect = async (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file using utility function
      const validation = validateImageFile(file);
      if (!validation.isValid) {
        setError(validation.errors.join(', '));
        return;
      }

      setSelectedLogo(file);
      setError("");
      
      // Create preview using utility function
      try {
        const preview = await createImagePreview(file);
        setLogoPreview(preview);
      } catch (error) {
        setError("خطا در ایجاد پیش‌نمایش لوگو");
      }
    }
  };

  // Function to handle hero image file selection
  const handleHeroImageSelect = async (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file using utility function
      const validation = validateImageFile(file);
      if (!validation.isValid) {
        setError(validation.errors.join(', '));
        return;
      }

      setSelectedHeroImage(file);
      setError("");
      
      // Create preview using utility function
      try {
        const preview = await createImagePreview(file);
        setHeroImagePreview(preview);
      } catch (error) {
        setError("خطا در ایجاد پیش‌نمایش تصویر اصلی");
      }
    }
  };

  // Function to clear logo selection
  const clearLogoSelection = () => {
    setSelectedLogo(null);
    setLogoPreview(null);
    setFormData(prev => ({ ...prev, logo_url: "" }));
    if (logoFileInputRef.current) {
      logoFileInputRef.current.value = '';
    }
  };

  // Function to clear hero image selection
  const clearHeroImageSelection = () => {
    setSelectedHeroImage(null);
    setHeroImagePreview(null);
    setFormData(prev => ({ ...prev, hero_image_url: "" }));
    if (heroImageFileInputRef.current) {
      heroImageFileInputRef.current.value = '';
    }
  };

  // Function to handle password change
  const handlePasswordChange = async () => {
    setPasswordError("");
    
    if (!newPassword.trim()) {
      setPasswordError("رمز عبور جدید الزامی است");
      return;
    }
    
    if (newPassword.length < 6) {
      setPasswordError("رمز عبور باید حداقل 6 کاراکتر باشد");
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordError("رمز عبور و تکرار آن یکسان نیستند");
      return;
    }
    
    try {
      // Update password via API (auth)
      await authAPI.updatePassword(newPassword);
      
      // Reflect locally in UI state (optional field show only)
      const updatedFormData = { ...formData, admin_password: '' };
      setFormData(updatedFormData);
      
      setNewPassword("");
      setConfirmPassword("");
      setSuccess("رمز عبور با موفقیت تغییر یافت و ذخیره شد");
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error("Error saving password:", error);
      setPasswordError("خطا در ذخیره رمز عبور: " + error.message);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      console.log("CafeSettingsManager: Saving settings with data:", formData);
      
      let updatedFormData = { ...formData };
      
      // Handle logo upload
      if (selectedLogo) {
        try {
          const serverResult = await uploadImageToServer(selectedLogo);
          if (serverResult?.path) {
            updatedFormData.logo_url = serverResult.path;
          } else {
            throw new Error('No path from server');
          }
        } catch (e) {
          const result = await uploadImageToLocal(selectedLogo, 'cafe');
          updatedFormData.logo_url = result.storageKey;
          cleanupOldImages();
        }
      }
      
      // Handle hero image upload
      if (selectedHeroImage) {
        try {
          const serverResult = await uploadImageToServer(selectedHeroImage);
          if (serverResult?.path) {
            updatedFormData.hero_image_url = serverResult.path;
          } else {
            throw new Error('No path from server');
          }
        } catch (e) {
          const result = await uploadImageToLocal(selectedHeroImage, 'cafe');
          updatedFormData.hero_image_url = result.storageKey;
          cleanupOldImages();
        }
      }

      // Migrate existing Base64 images (if any) to server when no new file selected
      if (!selectedLogo && updatedFormData.logo_url) {
        const maybeBase64 = getImageFromStorage(updatedFormData.logo_url);
        if (maybeBase64 && maybeBase64.startsWith('data:image/')) {
          const file = dataUrlToFile(maybeBase64, `logo-${Date.now()}.png`);
          if (file) {
            try {
              const serverResult = await uploadImageToServer(file);
              if (serverResult?.path) {
                updatedFormData.logo_url = serverResult.path;
              }
            } catch {}
          }
        }
      }

      if (!selectedHeroImage && updatedFormData.hero_image_url) {
        const maybeBase64 = getImageFromStorage(updatedFormData.hero_image_url);
        if (maybeBase64 && maybeBase64.startsWith('data:image/')) {
          const file = dataUrlToFile(maybeBase64, `hero-${Date.now()}.png`);
          if (file) {
            try {
              const serverResult = await uploadImageToServer(file);
              if (serverResult?.path) {
                updatedFormData.hero_image_url = serverResult.path;
              }
            } catch {}
          }
        }
      }
      
      let updatedSettings;
      
      if (cafeSettings && cafeSettings.id) {
        console.log("CafeSettingsManager: Updating existing settings with ID:", cafeSettings.id);
        updatedSettings = await CafeSettings.update(cafeSettings.id, updatedFormData);
      } else {
        console.log("CafeSettingsManager: Creating new settings");
        updatedSettings = await CafeSettings.create(updatedFormData);
      }
      
      console.log("CafeSettingsManager: Settings saved successfully:", updatedSettings);
      
      // Update local state
      if (setCafeSettings) {
        setCafeSettings(updatedSettings);
      }
      
      // Clear selected files after successful save
      setSelectedLogo(null);
      setSelectedHeroImage(null);
      
      setSuccess("تنظیمات با موفقیت ذخیره شد");
      
      // Call onDataChange if provided
      if (onDataChange && typeof onDataChange === 'function') {
        console.log("CafeSettingsManager: Calling onDataChange...");
        await onDataChange();
      }
      
      setTimeout(() => setSuccess(""), 3000);
    } catch (saveError) {
      console.error("CafeSettingsManager: Save error:", saveError);
      setError("خطا در ذخیره تنظیمات: " + (saveError.message || "خطای نامشخص"));
    }
    setSaving(false);
  };

  return (
    <div className="space-y-8">
      {success && (
        <Alert className="bg-green-100 border-green-300 text-green-800">
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}
      {error && (
        <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>
      )}

      {/* Basic Information Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl text-gray-800">
            <ImageIcon className="w-5 h-5 text-purple-600" />
            اطلاعات پایه کافه
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">اطلاعات پایه</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cafe_name">نام کافه</Label>
                  <Input
                    id="cafe_name"
                    value={formData.cafe_name || ""}
                    onChange={(e) => handleInputChange("cafe_name", e.target.value)}
                    placeholder="نام کافه را وارد کنید"
                    className="text-right"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="location">موقعیت</Label>
                  <Input
                    id="location"
                    value={formData.location || ""}
                    onChange={(e) => handleInputChange("location", e.target.value)}
                    placeholder="موقعیت کافه را وارد کنید"
                    className="text-right"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">توضیحات</Label>
                <Textarea
                  id="description"
                  value={formData.description || ""}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="توضیحات کافه را وارد کنید"
                  className="text-right min-h-[100px]"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">شماره تماس</Label>
                <Input
                  id="phone"
                  value={formData.phone || ""}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="شماره تماس را وارد کنید"
                  className="text-right"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="instagram_url">لینک اینستاگرام</Label>
                <Input
                  id="instagram_url"
                  value={formData.instagram_url || ""}
                  onChange={(e) => handleInputChange("instagram_url", e.target.value)}
                  placeholder="لینک اینستاگرام را وارد کنید"
                  className="text-right"
                />
              </div>
            </div>

            {/* Images and Media */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">تصاویر و رسانه</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Logo */}
                <div className="space-y-3">
                  <Label htmlFor="logo">لوگوی کافه</Label>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => logoFileInputRef.current?.click()}
                        className="flex items-center gap-2"
                      >
                        <Upload className="w-4 h-4" />
                        انتخاب لوگو
                      </Button>
                      {(selectedLogo || logoPreview) && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={clearLogoSelection}
                          className="flex items-center gap-2"
                        >
                          <X className="w-4 h-4" />
                          {selectedLogo ? "حذف" : "حذف لوگوی موجود"}
                        </Button>
                      )}
                    </div>
                    
                    <input
                      ref={logoFileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleLogoSelect}
                      className="hidden"
                    />
                    
                    {/* Logo Preview */}
                    {logoPreview && (
                      <div className="relative">
                        <img
                          src={logoPreview}
                          alt="لوگوی کافه"
                          className="w-20 h-20 object-contain border rounded-lg bg-gray-50"
                        />
                        {selectedLogo && (
                          <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-xs">
                            لوگوی جدید
                          </div>
                        )}
                        {!selectedLogo && (
                          <div className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 rounded text-xs">
                            لوگوی موجود
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Note about logo upload */}
                    {!selectedLogo && !logoPreview && (
                      <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg border border-gray-200">
                        <div className="flex items-center gap-2 mb-2">
                          <ImageIcon className="w-4 h-4" />
                          <span className="font-medium">راهنمای آپلود لوگو</span>
                        </div>
                        <p>📸 برای اضافه کردن لوگو، روی دکمه "انتخاب لوگو" کلیک کنید</p>
                        <p className="mt-1">✅ فرمت‌های مجاز: JPG, PNG, GIF, WebP</p>
                        <p className="mt-1">📏 حداکثر اندازه: 6 مگابایت</p>
                        <p className="mt-1 text-blue-600">💡 لوگو در مرورگر ذخیره می‌شود</p>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Hero Image */}
                <div className="space-y-3">
                  <Label htmlFor="hero_image">تصویر اصلی</Label>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => heroImageFileInputRef.current?.click()}
                        className="flex items-center gap-2"
                      >
                        <Upload className="w-4 h-4" />
                        انتخاب تصویر اصلی
                      </Button>
                      {(selectedHeroImage || heroImagePreview) && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={clearHeroImageSelection}
                          className="flex items-center gap-2"
                        >
                          <X className="w-4 h-4" />
                          {selectedHeroImage ? "حذف" : "حذف تصویر موجود"}
                        </Button>
                      )}
                    </div>
                    
                    <input
                      ref={heroImageFileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleHeroImageSelect}
                      className="hidden"
                    />
                    
                    {/* Hero Image Preview */}
                    {heroImagePreview && (
                      <div className="relative">
                        <img
                          src={heroImagePreview}
                          alt="تصویر اصلی کافه"
                          className="w-32 h-20 object-cover border rounded-lg bg-gray-50"
                        />
                        {selectedHeroImage && (
                          <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-xs">
                            تصویر جدید
                          </div>
                        )}
                        {!selectedHeroImage && (
                          <div className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 rounded text-xs">
                            تصویر موجود
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Note about hero image upload */}
                    {!selectedHeroImage && !heroImagePreview && (
                      <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg border border-gray-200">
                        <div className="flex items-center gap-2 mb-2">
                          <ImageIcon className="w-4 h-4" />
                          <span className="font-medium">راهنمای آپلود تصویر اصلی</span>
                        </div>
                        <p>📸 برای اضافه کردن تصویر اصلی، روی دکمه "انتخاب تصویر اصلی" کلیک کنید</p>
                        <p className="mt-1">✅ فرمت‌های مجاز: JPG, PNG, GIF, WebP</p>
                        <p className="mt-1">📏 حداکثر اندازه: 6 مگابایت</p>
                        <p className="mt-1 text-blue-600">💡 تصویر در مرورگر ذخیره می‌شود</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Admin Credentials */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">اطلاعات ورود</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="admin_username">نام کاربری مدیر</Label>
                  <Input
                    id="admin_username"
                    value={formData.admin_username || ""}
                    onChange={(e) => handleInputChange("admin_username", e.target.value)}
                    placeholder="نام کاربری مدیر"
                    className="text-right"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="admin_password" className="flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    رمز عبور فعلی
                  </Label>
                  <div className="relative">
                    <Input
                      id="admin_password"
                      type={showPassword ? "text" : "password"}
                      value={formData.admin_password ? "••••••••" : ""}
                      disabled
                      className="text-right pr-10 bg-gray-50"
                      placeholder="رمز عبور فعلی"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Password Change Section */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="text-md font-semibold text-blue-900 mb-3 flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  تغییر رمز عبور
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="new_password">رمز عبور جدید</Label>
                    <Input
                      id="new_password"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="رمز عبور جدید را وارد کنید"
                      className="text-right"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirm_password">تکرار رمز عبور</Label>
                    <Input
                      id="confirm_password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="رمز عبور را تکرار کنید"
                      className="text-right"
                    />
                  </div>
                </div>
                
                {passwordError && (
                  <div className="mt-3 text-sm text-red-600 bg-red-50 p-2 rounded border border-red-200">
                    {passwordError}
                  </div>
                )}
                
                <div className="mt-3">
                  <Button
                    type="button"
                    onClick={handlePasswordChange}
                    variant="outline"
                    className="bg-blue-100 hover:bg-blue-200 text-blue-700 border-blue-300"
                  >
                    تغییر رمز عبور
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button 
          onClick={handleSave} 
          disabled={saving}
          className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg"
        >
          <Save className="w-5 h-5 ml-2" />
          {saving ? "در حال ذخیره..." : "ذخیره تنظیمات"}
        </Button>
      </div>
    </div>
  );
} 