import React, { useState, useRef } from "react";
import { MenuItem } from "../../entities";
import { Card, CardContent, CardHeader, CardTitle } from "../ui";
import { Button } from "../ui";
import { Input } from "../ui";
import { Label, Select, SelectItem, Switch } from "../ui";
import { Alert, AlertDescription, AlertTitle } from "../ui";
import { Plus, Edit, Trash2, Image, Save, X, Coffee, Upload, Eye } from "lucide-react";
import { uploadImageToLocal, uploadImageToServer, validateImageFile, createImagePreview, getImageFromStorage, cleanupOldImages, dataUrlToFile } from "../../utils";

const categories = [
  { id: "coffee", name: "قهوه" },
  { id: "shake", name: "شیک" },
  { id: "cold_bar", name: "بار سرد" },
  { id: "hot_bar", name: "بار گرم" },
  { id: "tea", name: "چای" },
  { id: "cake", name: "کیک" },
  { id: "food", name: "غذا" },
  { id: "breakfast", name: "صبحانه" }
];

export default function MenuManagement({ menuItems, setMenuItems, onDataChange }) {
  const [editingItem, setEditingItem] = useState(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    category: "coffee",
    price: 0,
    price_premium: 0,
    has_dual_pricing: false,
    image_url: "",
    is_available: true,
    order_index: 0
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  // Function to handle image file selection
  const handleImageSelect = async (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file using utility function
      const validation = validateImageFile(file);
      if (!validation.isValid) {
        setError(validation.errors.join(', '));
        return;
      }

      setSelectedImage(file);
      setError("");
      
      // Create preview using utility function
      try {
        const preview = await createImagePreview(file);
        setImagePreview(preview);
      } catch (error) {
        setError("خطا در ایجاد پیش‌نمایش تصویر");
      }
    }
  };



  // Function to clear image selection
  const clearImageSelection = () => {
    setSelectedImage(null);
    setImagePreview(null);
    // Clear image_url from form data
    setFormData(prev => ({ ...prev, image_url: "" }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name || "",
      category: item.category || "coffee",
      price: item.price || 0,
      price_premium: item.price_premium || 0,
      has_dual_pricing: item.has_dual_pricing || false,
      image_url: item.image_url || "",
      is_available: item.is_available ?? true,
      order_index: item.order_index || 0
    });
    setSelectedImage(null);
    // Show existing image as preview if available
    setImagePreview(item.image_url || null);
    setError("");
  };

  const handleAddNew = () => {
    console.log("=== handleAddNew() START ===");
    console.log("Current menuItems:", menuItems);
    
    setIsAddingNew(true);
    setEditingItem(null);
    
    // Calculate the next order_index
    let nextOrderIndex = 0;
    if (menuItems && menuItems.length > 0) {
      const maxOrderIndex = Math.max(...menuItems.map(item => item.order_index || 0));
      nextOrderIndex = maxOrderIndex + 1;
    }
    
    const newFormData = {
      name: "",
      category: "coffee",
      price: 0,
      price_premium: 0,
      has_dual_pricing: false,
      image_url: "",
      is_available: true,
      order_index: nextOrderIndex
    };
    
    setFormData(newFormData);
    setSelectedImage(null);
    setImagePreview(null);
    setError("");
    
    console.log("New form data set:", newFormData);
    console.log("Next order_index:", nextOrderIndex);
    console.log("=== handleAddNew() SUCCESS ===");
  };

  const handleSave = async () => {
    console.log("=== handleSave() START ===");
    console.log("Form data:", formData);
    console.log("Editing item:", editingItem);
    console.log("Is adding new:", isAddingNew);
    
    // Validation
    if (!formData.name.trim()) {
      setError("نام آیتم الزامی است");
      console.log("Validation failed: نام آیتم الزامی است");
      return;
    }

    if (formData.price <= 0) {
      setError("قیمت باید بیشتر از صفر باشد");
      console.log("Validation failed: قیمت باید بیشتر از صفر باشد");
      return;
    }

    if (formData.has_dual_pricing && formData.price_premium <= 0) {
      setError("قیمت پریمیوم باید بیشتر از صفر باشد");
      console.log("Validation failed: قیمت پریمیوم باید بیشتر از صفر باشد");
      return;
    }

    console.log("Validation passed");
    setSaving(true);
    setError("");

    try {
      let imageUrl = "";
      
      // Only save image if one is selected
      if (selectedImage) {
        // Try server upload first for cross-device visibility; fallback to local
        try {
          const serverResult = await uploadImageToServer(selectedImage);
          if (serverResult?.path) {
            imageUrl = serverResult.path; // e.g., /images/filename.jpg
          } else {
            throw new Error('No path from server');
          }
        } catch (e) {
          const localResult = await uploadImageToLocal(selectedImage);
          imageUrl = localResult.storageKey;
          cleanupOldImages();
        }
      }
      
      let savedItem;
      
      if (editingItem) {
        console.log("Updating existing item...");
        // Update existing item
        const updateData = { ...formData };
        // Migrate old Base64/localStorage images to server when editing without selecting new image
        if (!selectedImage && formData.image_url) {
          const maybeBase64 = getImageFromStorage(formData.image_url);
          if (maybeBase64 && maybeBase64.startsWith('data:image/')) {
            const file = dataUrlToFile(maybeBase64, `menu-${Date.now()}.png`);
            if (file) {
              try {
                const serverResult = await uploadImageToServer(file);
                if (serverResult?.path) {
                  updateData.image_url = serverResult.path;
                }
              } catch {}
            }
          }
        } else if (selectedImage) {
          updateData.image_url = imageUrl;
        }
        savedItem = await MenuItem.update(editingItem.id, updateData);
        console.log("Updated item:", savedItem);
        
        // Update local state
        setMenuItems(prev => {
          const updated = prev.map(item => 
            item.id === editingItem.id ? savedItem : item
          );
          console.log("Updated menuItems state:", updated);
          return updated;
        });
      } else {
        console.log("Creating new item...");
        // Create new item
        const newItemData = {
          name: formData.name.trim(),
          category: formData.category,
          price: parseInt(formData.price) || 0,
          price_premium: formData.has_dual_pricing ? (parseInt(formData.price_premium) || 0) : null,
          has_dual_pricing: formData.has_dual_pricing,
          image_url: imageUrl,
          is_available: formData.is_available,
          order_index: formData.order_index
        };
        
        console.log("Creating new item with data:", newItemData);
        savedItem = await MenuItem.create(newItemData);
        console.log("Created new item:", savedItem);
        
        // Add to local state immediately
        setMenuItems(prev => {
          const newItems = [...prev, savedItem];
          console.log("Updated menuItems state with new item:", newItems);
          return newItems;
        });
      }
      
      console.log("Item saved successfully, resetting form...");
      
      // Reset form
      handleCancel();
      
      // Show success message
      console.log("=== handleSave() SUCCESS ===");
      alert("آیتم با موفقیت ذخیره شد!");
      
    } catch (error) {
      console.error("=== handleSave() ERROR ===");
      console.error("Error details:", error);
      setError("خطا در ذخیره آیتم: " + error.message);
    }
    
    setSaving(false);
    console.log("=== handleSave() END ===");
  };

  const handleDelete = async (itemId) => {
    if (window.confirm("آیا مطمئن هستید که می‌خواهید این آیتم را حذف کنید؟")) {
      try {
        await MenuItem.delete(itemId);
        
        // Update local state
        setMenuItems(prev => prev.filter(item => item.id !== itemId));
        
        // Also refresh data from parent component
        await onDataChange();
        
        console.log("Item deleted successfully");
      } catch (error) {
        console.error("Error deleting item:", error);
        setError("خطا در حذف آیتم: " + error.message);
      }
    }
  };

  const handleCancel = () => {
    console.log("=== handleCancel() START ===");
    
    setEditingItem(null);
    setIsAddingNew(false);
    
    const resetFormData = {
      name: "",
      category: "coffee",
      price: 0,
      price_premium: 0,
      has_dual_pricing: false,
      image_url: "",
      is_available: true,
      order_index: 0
    };
    
    setFormData(resetFormData);
    setSelectedImage(null);
    setImagePreview(null);
    setError("");
    
    console.log("Form reset to:", resetFormData);
    console.log("=== handleCancel() SUCCESS ===");
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fa-IR').format(price);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">مدیریت منو</h2>
        <Button onClick={handleAddNew} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          افزودن آیتم جدید
        </Button>
      </div>

      {/* Form */}
      {(isAddingNew || editingItem) && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingItem ? "ویرایش آیتم" : "افزودن آیتم جدید"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertTitle>خطا</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">نام آیتم</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="نام آیتم را وارد کنید"
                />
              </div>

              <div>
                <Label htmlFor="category">دسته‌بندی</Label>
                <Select
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                >
                  {categories.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </Select>
              </div>

              <div>
                <Label htmlFor="price">قیمت (تومان)</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: parseInt(e.target.value) || 0 }))}
                  placeholder="قیمت را وارد کنید"
                />
              </div>

              <div>
                <Label htmlFor="image">تصویر آیتم (اختیاری)</Label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      انتخاب تصویر
                    </Button>
                    {(selectedImage || imagePreview) && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={clearImageSelection}
                        className="flex items-center gap-2"
                      >
                        <X className="w-4 h-4" />
                        {selectedImage ? "حذف" : "حذف تصویر موجود"}
                      </Button>
                    )}
                  </div>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                  
                  {/* Image Preview */}
                  {(imagePreview || formData.image_url) && (
                    <div className="relative">
                      <img
                        src={imagePreview || getImageFromStorage(formData.image_url)}
                        alt="Preview"
                        className="w-full h-32 object-cover rounded-lg border"
                        onError={(e) => {
                          e.target.src = "/sample-coffee.jpg";
                        }}
                      />
                      {selectedImage && (
                        <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-xs">
                          تصویر جدید
                        </div>
                      )}
                      {!selectedImage && imagePreview && (
                        <div className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 rounded text-xs">
                          تصویر موجود
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Note about image upload */}
                  {!selectedImage && !imagePreview && (
                    <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Image className="w-4 h-4" />
                        <span className="font-medium">راهنمای آپلود تصویر</span>
                      </div>
                      <p>📸 برای اضافه کردن تصویر، روی دکمه "انتخاب تصویر" کلیک کنید</p>
                      <p className="mt-1">✅ فرمت‌های مجاز: JPG, PNG, GIF, WebP</p>
                      <p className="mt-1">📏 حداکثر اندازه: 6 مگابایت</p>
                      <p className="mt-1 text-blue-600">💡 تصویر اختیاری است و در مرورگر ذخیره می‌شود</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="has_dual_pricing"
                checked={formData.has_dual_pricing}
                onChange={(checked) => setFormData(prev => ({ ...prev, has_dual_pricing: checked }))}
              />
              <Label htmlFor="has_dual_pricing">دو قیمت دارد</Label>
            </div>

            {formData.has_dual_pricing && (
              <div>
                <Label htmlFor="price_premium">قیمت پریمیوم (تومان)</Label>
                <Input
                  id="price_premium"
                  type="number"
                  value={formData.price_premium}
                  onChange={(e) => setFormData(prev => ({ ...prev, price_premium: parseInt(e.target.value) || 0 }))}
                  placeholder="قیمت پریمیوم را وارد کنید"
                />
              </div>
            )}

            <div className="flex items-center space-x-2">
              <Switch
                id="is_available"
                checked={formData.is_available}
                onChange={(checked) => setFormData(prev => ({ ...prev, is_available: checked }))}
              />
              <Label htmlFor="is_available">در دسترس است</Label>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={saving} className="flex items-center gap-2">
                <Save className="w-4 h-4" />
                {saving ? "در حال ذخیره..." : "ذخیره"}
              </Button>
              <Button variant="outline" onClick={handleCancel}>
                <X className="w-4 h-4 ml-2" />
                انصراف
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Menu Items List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {menuItems.map((item) => (
          <Card key={item.id} className="relative">
            <div className="h-48 overflow-hidden rounded-t-lg">
              <img
                src={getImageFromStorage(item.image_url)}
                alt={item.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = "/sample-coffee.jpg";
                }}
              />
            </div>
            <CardContent className="p-4">
              <h3 className="font-semibold text-lg mb-2">{item.name}</h3>
              <p className="text-sm text-gray-600 mb-2">
                {categories.find(cat => cat.id === item.category)?.name}
              </p>
              <div className="flex justify-between items-center mb-3">
                <span className="font-bold text-lg text-green-600">
                  {formatPrice(item.price)} تومان
                </span>
                {item.has_dual_pricing && item.price_premium && (
                  <span className="text-sm text-gray-500">
                    پریمیوم: {formatPrice(item.price_premium)}
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(item)}
                  className="flex-1"
                >
                  <Edit className="w-4 h-4 ml-2" />
                  ویرایش
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(item.id)}
                  className="flex-1"
                >
                  <Trash2 className="w-4 h-4 ml-2" />
                  حذف
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {menuItems.length === 0 && (
        <div className="text-center py-12">
          <Coffee className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">هیچ آیتمی موجود نیست</h3>
          <p className="text-gray-500">برای شروع، آیتم جدیدی اضافه کنید</p>
        </div>
      )}
    </div>
  );
} 