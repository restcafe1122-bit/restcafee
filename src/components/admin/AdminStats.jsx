import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui";
import { Coffee, DollarSign, TrendingUp, Package } from "lucide-react";

export default function AdminStats({ menuItems }) {
  const totalItems = menuItems.length;
  const availableItems = menuItems.filter(item => item.is_available).length;
  const averagePrice = menuItems.reduce((sum, item) => sum + (item.price || 0), 0) / totalItems || 0;
  const totalValue = menuItems.reduce((sum, item) => sum + (item.price || 0), 0);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fa-IR').format(Math.round(price));
  };

  const stats = [
    {
      title: "تعداد کل آیتم‌ها",
      value: totalItems,
      icon: Package,
      color: "text-blue-600",
      bg: "bg-blue-100"
    },
    {
      title: "آیتم‌های فعال",
      value: availableItems,
      icon: Coffee,
      color: "text-green-600", 
      bg: "bg-green-100"
    },
    {
      title: "میانگین قیمت",
      value: `${formatPrice(averagePrice)} تومان`,
      icon: TrendingUp,
      color: "text-purple-600",
      bg: "bg-purple-100"
    },
    {
      title: "ارزش کل منو",
      value: `${formatPrice(totalValue)} تومان`,
      icon: DollarSign,
      color: "text-orange-600",
      bg: "bg-orange-100"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <Card key={index} className="border-none shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {stat.title}
            </CardTitle>
            <div className={`p-2 rounded-lg ${stat.bg}`}>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {stat.value}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
