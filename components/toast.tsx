"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

type ToastType = "luck" | "success" | "info";

type Toast = {
  id: string;
  message: string;
  type: ToastType;
};

type ToastContextType = {
  showToast: (message: string, type: ToastType) => void;
};

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: ToastType) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed inset-x-0 bottom-6 z-[100] flex flex-col items-center pointer-events-none">
        {toasts.map((toast, index) => (
          <div
            key={toast.id}
            className="pointer-events-auto mb-2"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            {toast.type === "luck" ? (
              <LuckSnackbar message={toast.message} />
            ) : (
              <div
                className={`rounded-xl border px-4 py-3 shadow-lg ${
                  toast.type === "success"
                    ? "border-green-300 bg-green-50 text-green-900 dark:border-green-700 dark:bg-green-950 dark:text-green-100"
                    : "border-blue-300 bg-blue-50 text-blue-900 dark:border-blue-700 dark:bg-blue-950 dark:text-blue-100"
                }`}
              >
                <p className="text-sm font-medium">{toast.message}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function LuckSnackbar({ message }: { message: string }) {
  return (
    <div className="relative flex items-center gap-3 rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50 px-5 py-3 shadow-lg shadow-amber-200/30 dark:border-amber-700 dark:from-amber-950 dark:to-yellow-950 dark:shadow-amber-900/20 animate-snackbar-in">
      <span className="text-lg font-bold uppercase tracking-wider">L</span>
      <div>
        <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">{message}</p>
        <p className="text-xs text-amber-600 dark:text-amber-400">Good luck!</p>
      </div>
    </div>
  );
}

function Sparkles() {
  const sparkles = Array.from({ length: 4 }, (_, i) => ({
    id: i,
    delay: i * 0.15,
  }));

  return (
    <>
      {sparkles.map((s) => (
        <div
          key={s.id}
          className="absolute h-2 w-2 animate-sparkle rounded-full bg-amber-400"
          style={{
            left: `${Math.random() * 20}px`,
            top: `${Math.random() * 20}px`,
            animationDelay: `${s.delay}s`,
          }}
        />
      ))}
    </>
  );
}