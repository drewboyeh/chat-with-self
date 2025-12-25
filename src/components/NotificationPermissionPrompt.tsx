import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { NotificationService } from "@/lib/notifications";
import { useToast } from "@/hooks/use-toast";
import { Bell, BellOff, X, TestTube } from "lucide-react";

export function NotificationPermissionPrompt() {
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [isRequesting, setIsRequesting] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!NotificationService.isSupported()) {
      setPermission("denied");
      return;
    }

    setPermission(NotificationService.getPermission());

    // Listen for permission changes
    const checkPermission = () => {
      setPermission(NotificationService.getPermission());
    };

    // Check periodically (some browsers don't fire events)
    const interval = setInterval(checkPermission, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleRequestPermission = async () => {
    setIsRequesting(true);
    const result = await NotificationService.requestPermission();
    setPermission(result);
    setIsRequesting(false);
  };

  // Don't show if dismissed, denied, or granted
  if (dismissed || permission === "denied" || permission === "granted") {
    return null;
  }

  // Only show if permission is "default" (not yet requested)
  if (permission !== "default") {
    return null;
  }

  return (
    <Alert className="mb-4 border-primary/20 bg-primary/5">
      <Bell className="h-4 w-4 text-primary" />
      <AlertTitle className="flex items-center justify-between">
        <span>Enable Notifications</span>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => setDismissed(true)}
        >
          <X className="h-4 w-4" />
        </Button>
      </AlertTitle>
      <AlertDescription className="space-y-2">
        <p>
          Get reminders from your future self! We'll notify you when it's time to check in on your goals.
        </p>
        <Button
          onClick={handleRequestPermission}
          disabled={isRequesting}
          size="sm"
          className="mt-2"
        >
          {isRequesting ? (
            <>
              <Bell className="w-4 h-4 mr-2 animate-pulse" />
              Requesting...
            </>
          ) : (
            <>
              <Bell className="w-4 h-4 mr-2" />
              Enable Notifications
            </>
          )}
        </Button>
      </AlertDescription>
    </Alert>
  );
}

export function NotificationStatus() {
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const { toast } = useToast();

  useEffect(() => {
    if (!NotificationService.isSupported()) {
      setPermission("denied");
      return;
    }

    setPermission(NotificationService.getPermission());

    const interval = setInterval(() => {
      setPermission(NotificationService.getPermission());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleTestNotification = async () => {
    if (permission !== "granted") {
      toast({
        title: "Permission required",
        description: "Please enable notifications first.",
        variant: "destructive",
      });
      return;
    }

    await NotificationService.showNotification("Test Notification", {
      body: "If you see this, notifications are working! 🎉",
      tag: "test-notification",
      icon: "/favicon.ico",
    });

    toast({
      title: "Test notification sent!",
      description: "Check your notifications.",
    });
  };

  if (!NotificationService.isSupported()) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <BellOff className="w-4 h-4" />
        <span>Notifications not supported</span>
      </div>
    );
  }

  if (permission === "granted") {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 text-sm text-primary">
          <Bell className="w-4 h-4" />
          <span>Notifications enabled</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleTestNotification}
          className="h-7 text-xs"
        >
          <TestTube className="w-3 h-3 mr-1" />
          Test
        </Button>
      </div>
    );
  }

  if (permission === "denied") {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <BellOff className="w-4 h-4" />
        <span>Notifications blocked</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Bell className="w-4 h-4" />
      <span>Notifications not enabled</span>
    </div>
  );
}

