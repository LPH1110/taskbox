import { AnimatePresence, motion } from "framer-motion";
import { type Toast } from "../context/ToastContext";
import { X } from "lucide-react";

interface Props {
  toasts: Toast[];
  removeToast: (id: string) => void;
}

const toastVariants = {
  initial: { opacity: 0, y: 25, scale: 0.9 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } },
};

export const ToastContainer = ({ toasts, removeToast }: Props) => {
  return (
    <div className="fixed bottom-4 right-4 z-9999 flex flex-col gap-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            layout // This prop makes other toasts slide up smoothly when one is removed
            variants={toastVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className={`
              flex min-w-75 items-center justify-between rounded-lg p-4 shadow-lg border-l-4
              ${
                toast.type === "success"
                  ? "bg-white border-green-500 text-gray-800"
                  : ""
              }
              ${
                toast.type === "error"
                  ? "bg-red-50 border-red-500 text-red-900"
                  : ""
              }
              ${
                toast.type === "info"
                  ? "bg-blue-50 border-blue-500 text-blue-900"
                  : ""
              }
            `}
          >
            <span className="text-sm font-medium">{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="ml-4 rounded-full p-1 hover:bg-black/5"
            >
              <X size={16} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
