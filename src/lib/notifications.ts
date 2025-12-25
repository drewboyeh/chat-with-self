// Browser push notification service
export class NotificationService {
  private static permission: NotificationPermission = "default";
  private static notificationClickHandlers: Map<string, () => void> = new Map();

  static getPermission(): NotificationPermission {
    if (!("Notification" in window)) {
      return "denied";
    }
    return Notification.permission;
  }

  static isSupported(): boolean {
    return "Notification" in window;
  }

  static async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported()) {
      console.warn("This browser does not support notifications");
      return "denied";
    }

    if (Notification.permission === "granted") {
      this.permission = "granted";
      return "granted";
    }

    if (Notification.permission === "denied") {
      this.permission = "denied";
      return "denied";
    }

    // Permission is "default" - request it
    try {
      const permission = await Notification.requestPermission();
      this.permission = permission;
      return permission;
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      return "denied";
    }
  }

  static async showNotification(
    title: string,
    options?: NotificationOptions & { onClick?: () => void }
  ): Promise<Notification | null> {
    if (!this.isSupported()) {
      console.warn("This browser does not support notifications");
      return null;
    }

    if (Notification.permission !== "granted") {
      const permission = await this.requestPermission();
      if (permission !== "granted") {
        console.warn("Notification permission denied");
        return null;
      }
    }

    try {
      const { onClick, ...notificationOptions } = options || {};
      
      const notification = new Notification(title, {
        icon: "/favicon.ico",
        badge: "/favicon.ico",
        dir: "auto",
        lang: "en",
        ...notificationOptions,
      });

      // Handle click event
      if (onClick) {
        const tag = notificationOptions.tag || `notification-${Date.now()}`;
        this.notificationClickHandlers.set(tag, onClick);
        
        notification.onclick = () => {
          onClick();
          notification.close();
          this.notificationClickHandlers.delete(tag);
        };
      }

      // Auto-close after 10 seconds (unless requireInteraction is true)
      if (!notificationOptions.requireInteraction) {
        setTimeout(() => {
          notification.close();
          if (notificationOptions.tag) {
            this.notificationClickHandlers.delete(notificationOptions.tag);
          }
        }, 10000);
      }

      return notification;
    } catch (error) {
      console.error("Error showing notification:", error);
      return null;
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

