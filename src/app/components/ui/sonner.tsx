"use client";

import { Toaster as Sonner, ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      style={
        {
          "--normal-bg": "#ffffff",
          "--normal-text": "#1f2937",
          "--normal-border": "#e9d5ff",
          "--success-bg": "#ecfdf5",
          "--success-text": "#065f46",
          "--error-bg": "#fef2f2",
          "--error-text": "#991b1b",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "bg-white border-purple-200 text-gray-800 shadow-lg",
          title: "text-gray-800",
          description: "text-gray-500",
          success: "bg-emerald-50 border-emerald-200 text-emerald-700",
          error: "bg-red-50 border-red-200 text-red-700",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
