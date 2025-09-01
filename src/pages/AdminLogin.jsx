import React, { useState } from "react";
import { CafeSettings } from "../entities";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui";
import { Input } from "../components/ui";
import { Button } from "../components/ui";
import { Label } from "../components/ui";
import { Alert, AlertDescription } from "../components/ui";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "../utils";
import { Coffee, Lock, User, ArrowRight } from "lucide-react";

export default function AdminLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      console.log("=== AdminLogin.handleLogin() START ===");
      
      const settings = await CafeSettings.list();
      console.log("Loaded settings:", settings);
      
      let cafeSettings = settings[0];

      if (!cafeSettings) {
        console.log("No settings found, creating default settings...");
        // Create default settings if none exist
        cafeSettings = await CafeSettings.create({
          admin_username: "admin",
          admin_password: "rest2024"
        });
        console.log("Created default settings:", cafeSettings);
      }

      const adminUsername = cafeSettings?.admin_username || "admin";
      const adminPassword = cafeSettings?.admin_password || "rest2024";

      console.log("Checking credentials...");
      console.log("Input username:", username);
      console.log("Input password:", password);
      console.log("Expected username:", adminUsername);
      console.log("Expected password:", adminPassword);

      if (username === adminUsername && password === adminPassword) {
        console.log("Login successful");
        // Store admin session
        localStorage.setItem("adminLoggedIn", "true");
        navigate(createPageUrl("AdminDashboard"));
      } else {
        console.log("Login failed: invalid credentials");
        setError("نام کاربری یا رمز عبور اشتباه است");
      }
      
      console.log("=== AdminLogin.handleLogin() END ===");
    } catch (error) {
      console.error("=== AdminLogin.handleLogin() ERROR ===");
      console.error("Error details:", error);
      setError("خطا در ورود به سیستم: " + error.message);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-green-900 via-emerald-800 to-teal-900"></div>
      <div className="absolute inset-0 bg-black/20"></div>
      
      <Card className="w-full max-w-md relative z-10 border-none shadow-2xl glass-effect">
        <CardHeader className="text-center pb-2">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
            <Coffee className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-800 mb-2">
            پنل مدیریت
          </CardTitle>
          <p className="text-gray-600 text-sm">کافه رست</p>
        </CardHeader>

        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive" className="bg-red-50 border-red-200">
              <AlertDescription className="text-red-800">
                {error}
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="flex items-center gap-2 text-gray-700">
                <User className="w-4 h-4" />
                نام کاربری
              </Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                placeholder="نام کاربری خود را وارد کنید"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2 text-gray-700">
                <Lock className="w-4 h-4" />
                رمز عبور
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                placeholder="رمز عبور خود را وارد کنید"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 transition-all duration-300 shadow-lg"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  در حال ورود...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span>ورود</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              )}
            </Button>
          </form>

          <div className="text-center">
            <Button
              variant="link"
              onClick={() => navigate(createPageUrl("Menu"))}
              className="text-gray-600 hover:text-gray-800 text-sm"
            >
              بازگشت به منو
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
