// src/assets/components/ui/sonner.jsx
import { Toaster as Sonner } from "sonner";

const Toaster = ({ ...props }) => {
  return (
    <Sonner
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-white group-[.toaster]:text-gray-900 group-[.toaster]:border-gray-200 group-[.toaster]:shadow-lg rounded-xl border",
          description: "group-[.toast]:text-gray-600",
          actionButton:
            "group-[.toast]:bg-purple-700 group-[.toast]:text-white group-[.toast]:font-medium rounded-lg hover:bg-purple-800 transition-colors duration-200",
          cancelButton:
            "group-[.toast]:bg-gray-100 group-[.toast]:text-gray-700 group-[.toast]:font-medium rounded-lg hover:bg-gray-200 transition-colors duration-200",
          error: "group-[.toast]:bg-red-50 group-[.toast]:text-red-900 group-[.toast]:border-red-200 group-[.toast]:font-medium",
          success: "group-[.toast]:bg-green-50 group-[.toast]:text-green-900 group-[.toast]:border-green-200 group-[.toast]:font-medium",
          warning: "group-[.toast]:bg-yellow-50 group-[.toast]:text-yellow-900 group-[.toast]:border-yellow-200 group-[.toast]:font-medium",
          info: "group-[.toast]:bg-blue-50 group-[.toast]:text-blue-900 group-[.toast]:border-blue-200 group-[.toast]:font-medium",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };