export interface NotificationOptions {
  duration?: number;
  id?: string;
}

export interface NotificationRepository {
  success(message: string, options?: NotificationOptions): void;
  error(message: string, options?: NotificationOptions): void;
  loading(message: string, options?: NotificationOptions): string;
  dismiss(toastId?: string): void;
  promise<T>(
    promise: Promise<T>,
    messages: { loading: string; success: string; error: string },
    options?: NotificationOptions,
  ): Promise<T>;
}
