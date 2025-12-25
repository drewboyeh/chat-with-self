import { useEffect, useState } from "react";
import { useAuth } from "./useAuth";
import { supabase } from "@/integrations/supabase/client";
import { NotificationService } from "@/lib/notifications";
import { CheckInDialog } from "@/components/CheckInDialog";

export function useReminders() {
  const { user } = useAuth();
  const [checkInReminder, setCheckInReminder] = useState<{
    id: string;
    task: string;
  } | null>(null);

  useEffect(() => {
    if (!user) return;

    // Don't auto-request permission - let user do it via UI
    // Just check if it's already granted
    if (NotificationService.getPermission() === "granted") {
      console.log("Notification permission already granted");
    }

    // Check for due reminders every 30 seconds for better precision
    const checkReminders = async () => {
      const now = new Date();
      // Check reminders that are due now or within the next 2 minutes
      const twoMinutesFromNow = new Date(now.getTime() + 2 * 60 * 1000);

      const { data, error } = await supabase
        .from("reminders")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .is("completed_at", null)
        .lte("reminder_time", twoMinutesFromNow.toISOString())
        .gte("reminder_time", new Date(now.getTime() - 5 * 60 * 1000).toISOString()); // Include reminders from 5 min ago (in case we missed them)

      if (error) {
        console.error("Error checking reminders:", error);
        return;
      }

      if (data && data.length > 0) {
        // Check if we've already notified about this reminder recently
        for (const reminder of data) {
          const reminderTime = new Date(reminder.reminder_time);
          const timeDiff = reminderTime.getTime() - now.getTime();
          
          // Only notify if reminder is due (within 2 minutes) and we haven't notified recently
          const lastNotified = reminder.last_notified_at
            ? new Date(reminder.last_notified_at)
            : null;
          const shouldNotify =
            timeDiff <= 2 * 60 * 1000 && // Reminder is due or very soon
            (!lastNotified || now.getTime() - lastNotified.getTime() > 5 * 60 * 1000); // Don't notify more than once per 5 minutes

          if (shouldNotify) {
            // Show browser notification with click handler
            await NotificationService.showNotification(
              "Future Self Check-In",
              {
                body: `Did you ${reminder.task.toLowerCase()}? How will your future self feel?`,
                tag: `reminder-${reminder.id}`,
                requireInteraction: true,
                onClick: () => {
                  // Focus the window and show check-in dialog
                  window.focus();
                  if (!checkInReminder) {
                    setCheckInReminder({
                      id: reminder.id,
                      task: reminder.task,
                    });
                  }
                },
              }
            );

            // Update last_notified_at
            await supabase
              .from("reminders")
              .update({ last_notified_at: now.toISOString() })
              .eq("id", reminder.id);

            // Show check-in dialog for the first reminder
            if (!checkInReminder) {
              setCheckInReminder({
                id: reminder.id,
                task: reminder.task,
              });
            }
          }
        }
      }

      // Check for overdue reminders (past due time, not completed)
      const { data: overdueReminders } = await supabase
        .from("reminders")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .is("completed_at", null)
        .lt("reminder_time", now.toISOString());

      if (overdueReminders && overdueReminders.length > 0) {
        // Notify about overdue reminders (less frequently)
        for (const reminder of overdueReminders) {
          const lastNotified = reminder.last_notified_at
            ? new Date(reminder.last_notified_at)
            : null;
          const shouldNotify =
            !lastNotified ||
            now.getTime() - lastNotified.getTime() > 60 * 60 * 1000; // Once per hour for overdue

          if (shouldNotify) {
            await NotificationService.showNotification(
              "Overdue Reminder",
              {
                body: `You haven't checked in about: ${reminder.task}`,
                tag: `overdue-${reminder.id}`,
              }
            );

            await supabase
              .from("reminders")
              .update({ last_notified_at: now.toISOString() })
              .eq("id", reminder.id);
          }
        }
      }
    };

    // Check immediately
    checkReminders();

    // Then check every 30 seconds for better precision
    const interval = setInterval(checkReminders, 30 * 1000);

    return () => clearInterval(interval);
  }, [user, checkInReminder]);

  return {
    checkInReminder,
    setCheckInReminder,
  };
}

