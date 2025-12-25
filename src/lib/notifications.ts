// Browser push notification service
export class NotificationService {
  private static permission: NotificationPermission = "default";

  static async requestPermission(): Promise<NotificationPermission> {
    if (!("Notification" in window)) {
      console.warn("This browser does not support notifications");
      return "denied";
    }

    if (Notification.permission === "granted") {
      this.permission = "granted";
      return "granted";
    }

    if (Notification.permission !== "denied") {
      const permission = await Notification.requestPermission();
      this.permission = permission;
      return permission;
    }

    return "denied";
  }

  static async showNotification(
    title: string,
    options?: NotificationOptions
  ): Promise<void> {
    if (!("Notification" in window)) {
      console.warn("This browser does not support notifications");
      return;
    }

    if (Notification.permission !== "granted") {
      const permission = await this.requestPermission();
      if (permission !== "granted") {
        console.warn("Notification permission denied");
        return;
      }
    }

    try {
      const notification = new Notification(title, {
        icon: "/favicon.ico",
        badge: "/favicon.ico",
        ...options,
      });

      // Auto-close after 10 seconds
      setTimeout(() => {
        notification.close();
      }, 10000);

      return Promise.resolve();
    } catch (error) {
      console.error("Error showing notification:", error);
    }
  }

  static checkReminders() {
    // This will be called periodically to check for due reminders
    // For now, we'll use a simple interval-based approach
    // In production, you might want to use a more sophisticated scheduling system
  }
}

// Service Worker registration for persistent notifications (optional, for PWA)
export async function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    try {
      const registration = await navigator.serviceWorker.register("/sw.js", {
        scope: "/",
      });
      console.log("Service Worker registered:", registration);
      return registration;
    } catch (error) {
      console.error("Service Worker registration failed:", error);
    }
  }
}

