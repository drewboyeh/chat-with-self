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

    // Request notification permission on mount
    NotificationService.requestPermission();

    // Check for due reminders every minute
    const checkReminders = async () => {
      const now = new Date();
      const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);

      const { data, error } = await supabase
        .from("reminders")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .is("completed_at", null)
        .lte("reminder_time", fiveMinutesFromNow.toISOString())
        .gte("reminder_time", now.toISOString());

      if (error) {
        console.error("Error checking reminders:", error);
        return;
      }

      if (data && data.length > 0) {
        // Check if we've already notified about this reminder recently
        for (const reminder of data) {
          const lastNotified = reminder.last_notified_at
            ? new Date(reminder.last_notified_at)
            : null;
          const shouldNotify =
            !lastNotified ||
            now.getTime() - lastNotified.getTime() > 60 * 1000; // Don't notify more than once per minute

          if (shouldNotify) {
            // Show browser notification
            await NotificationService.showNotification(
              "Future Self Check-In",
              {
                body: `Did you ${reminder.task.toLowerCase()}? How will your future self feel?`,
                tag: `reminder-${reminder.id}`,
                requireInteraction: true,
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

    // Then check every minute
    const interval = setInterval(checkReminders, 60 * 1000);

    return () => clearInterval(interval);
  }, [user, checkInReminder]);

  return {
    checkInReminder,
    setCheckInReminder,
  };
}

