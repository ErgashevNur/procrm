import { toast as sonnerToast } from "sonner";

export const toast = {
  success: (msg, opts) => sonnerToast.success(msg, opts),
  error: (msg, opts) => sonnerToast.error(msg, opts),
  info: (msg, opts) => sonnerToast.info(msg, opts),
  warning: (msg, opts) => sonnerToast.warning(msg, opts),
  loading: (msg, opts) => sonnerToast.loading(msg, opts),
  promise: (promise, opts) => sonnerToast.promise(promise, opts),
  dismiss: (id) => sonnerToast.dismiss(id),
};
