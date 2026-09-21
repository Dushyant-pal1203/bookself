// client/src/context/ToastContext.tsx
import React, { createContext, useContext, useState, useCallback } from "react";
import {
  ToastContainer,
  ToastMessage,
} from "@/components/common/ToastContainer";
import { ToastType } from "@/components/common/Toast";

interface ToastContextType {
  showToast: (
    message: string | React.ReactNode,
    type?: ToastType,
    duration?: number,
  ) => void;
  showSuccess: (message: string | React.ReactNode, duration?: number) => void;
  showError: (message: string | React.ReactNode, duration?: number) => void;
  showWarning: (message: string | React.ReactNode, duration?: number) => void;
  showInfo: (message: string | React.ReactNode, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (
      message: string | React.ReactNode,
      type: ToastType = "info",
      duration: number = 3000,
    ) => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, message, type, duration }]);

      setTimeout(() => {
        removeToast(id);
      }, duration);
    },
    [removeToast],
  );

  const showSuccess = useCallback(
    (message: string | React.ReactNode, duration?: number) => {
      showToast(message, "success", duration);
    },
    [showToast],
  );

  const showError = useCallback(
    (message: string | React.ReactNode, duration?: number) => {
      showToast(message, "error", duration);
    },
    [showToast],
  );

  const showWarning = useCallback(
    (message: string | React.ReactNode, duration?: number) => {
      showToast(message, "warning", duration);
    },
    [showToast],
  );

  const showInfo = useCallback(
    (message: string | React.ReactNode, duration?: number) => {
      showToast(message, "info", duration);
    },
    [showToast],
  );

  return (
    <ToastContext.Provider
      value={{
        showToast,
        showSuccess,
        showError,
        showWarning,
        showInfo,
      }}
    >
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};
