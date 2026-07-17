import toast from "react-hot-toast";
import type { NotificationRepository, NotificationOptions } from "./types";

export class ReactHotToastRepository implements NotificationRepository {
  success(message: string, options?: NotificationOptions) {
    toast.success(message, {
      duration: options?.duration ?? 3000,
      id: options?.id,
    });
  }

  error(message: string, options?: NotificationOptions) {
    toast.error(message, {
      duration: options?.duration ?? 4000,
      id: options?.id,
    });
  }

  loading(message: string, options?: NotificationOptions): string {
    return toast.loading(message, {
      id: options?.id,
    });
  }

  dismiss(toastId?: string) {
    toast.dismiss(toastId);
  }

  promise<T>(
    promise: Promise<T>,
    messages: { loading: string; success: string; error: string },
    options?: NotificationOptions,
  ): Promise<T> {
    return toast.promise(promise, messages, {
      duration: options?.duration ?? 4000,
      id: options?.id,
    });
  }
}
