import React, { useState } from "react";
import { CafeSettings } from "../../entities";
import { Card, CardContent, CardHeader, CardTitle } from "../ui";
import { Button } from "../ui";
import { Input } from "../ui";
import { Label, Textarea } from "../ui";
import { Alert, AlertDescription } from "../ui";
import { Save, Instagram, MapPin, Phone, Image as ImageIcon } from "lucide-react";

export default function CafeSettingsManager({ cafeSettings, setCafeSettings, onDataChange }) {
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // Initialize form data when cafeSettings changes
  React.useEffect(() => {
    if (cafeSettings) {
      console.log("CafeSettingsManager: Setting form data from cafeSettings:", cafeSettings);
      setFormData(cafeSettings);
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
    }
  }, [cafeSettings]);

  const handleInputChange = (field, value) => {
    console.log(`CafeSettingsManager: Updating field ${field} to:`, value);
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      console.log("CafeSettingsManager: Saving settings with data:", formData);
      let updatedSettings;
      
      if (cafeSettings && cafeSettings.id) {
        console.log("CafeSettingsManager: Updating existing settings with ID:", cafeSettings.id);
        updatedSettings = await CafeSettings.update(cafeSettings.id, formData);
      } else {
        console.log("CafeSettingsManager: Creating new settings");
        updatedSettings = await CafeSettings.create(formData);
      }
      
      console.log("CafeSettingsManager: Settings saved successfully:", updatedSettings);
      
      // Update local state
      if (setCafeSettings) {
        setCafeSettings(updatedSettings);
      }
      
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
                  <Label htmlFor="logo_url">لوگوی کافه</Label>
                  <Input
                    id="logo_url"
                    value={formData.logo_url || ""}
                    onChange={(e) => handleInputChange("logo_url", e.target.value)}
                    placeholder="لینک لوگوی کافه را وارد کنید"
                    className="text-right"
                  />
                  {formData.logo_url && (
                    <div className="mt-2">
                      <img 
                        src={formData.logo_url} 
                        alt="لوگوی کافه" 
                        className="w-20 h-20 object-contain border rounded-lg bg-gray-50"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'block';
                        }}
                      />
                      <div className="hidden text-sm text-gray-500 mt-1">تصویر بارگذاری نشد</div>
                    </div>
                  )}
                </div>
                
                {/* Hero Image */}
                <div className="space-y-3">
                  <Label htmlFor="hero_image_url">تصویر اصلی</Label>
                  <Input
                    id="hero_image_url"
                    value={formData.hero_image_url || ""}
                    onChange={(e) => handleInputChange("hero_image_url", e.target.value)}
                    placeholder="لینک تصویر اصلی کافه را وارد کنید"
                    className="text-right"
                  />
                  {formData.hero_image_url && (
                    <div className="mt-2">
                      <img 
                        src={formData.hero_image_url} 
                        alt="تصویر اصلی کافه" 
                        className="w-32 h-20 object-cover border rounded-lg bg-gray-50"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'block';
                        }}
                      />
                      <div className="hidden text-sm text-gray-500 mt-1">تصویر بارگذاری نشد</div>
                    </div>
                  )}
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
                  <Label htmlFor="admin_password">رمز عبور مدیر</Label>
                  <Input
                    id="admin_password"
                    type="password"
                    value={formData.admin_password || ""}
                    onChange={(e) => handleInputChange("admin_password", e.target.value)}
                    placeholder="رمز عبور مدیر"
                    className="text-right"
                  />
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