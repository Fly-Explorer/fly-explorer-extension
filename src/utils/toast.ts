import { toast, ToastOptions } from 'react-toastify';

// Cấu hình mặc định cho toast
const defaultOptions: ToastOptions = {
  position: 'top-right',
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
};

// Các hàm tiện ích để hiển thị toast
export const showToast = {
  success: (message: string, options?: ToastOptions) => {
    toast.success(message, { ...defaultOptions, ...options });
  },
  error: (message: string, options?: ToastOptions) => {
    toast.error(message, { ...defaultOptions, ...options });
  },
  info: (message: string, options?: ToastOptions) => {
    toast.info(message, { ...defaultOptions, ...options });
  },
  warning: (message: string, options?: ToastOptions) => {
    toast.warning(message, { ...defaultOptions, ...options });
  },
  // Toast tùy chỉnh
  custom: (message: string, options?: ToastOptions) => {
    toast(message, { ...defaultOptions, ...options });
  },
};

export default showToast; 