
import React from "react";
import "./Layout.css";

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gray-900 text-white" dir="rtl">
      <div className="grain-overlay min-h-screen">
        {children}
      </div>
    </div>
  );
}

