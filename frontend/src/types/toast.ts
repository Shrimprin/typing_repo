export type ToastType = 'success' | 'error' | 'warning' | 'info';
export type Toast = {
  message: string;
  type: ToastType;
};
