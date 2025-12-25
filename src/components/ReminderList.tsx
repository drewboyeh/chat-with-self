import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { format, isPast, isToday } from "date-fns";
import { Bell, BellOff, Trash2, Check } from "lucide-react";
import { NotificationPermissionPrompt, NotificationStatus } from "./NotificationPermissionPrompt";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Reminder {
  id: string;
  task: string;
  reminder_time: string;
  recurrence: "none" | "daily" | "weekly" | "weekdays";
  is_active: boolean;
  completed_at: string | null;
}

export function ReminderList() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    fetchReminders();
  }, [user]);

  const fetchReminders = async () => {
    if (!user) return;

    setIsLoading(true);
    const { data, error } = await supabase
      .from("reminders")
      .select("*")
      .eq("user_id", user.id)
      .order("reminder_time", { ascending: true });

    if (error) {
      console.error("Error fetching reminders:", error);
    } else {
      setReminders(data || []);
    }
    setIsLoading(false);
  };

  const toggleReminder = async (id: string, currentState: boolean) => {
    const { error } = await supabase
      .from("reminders")
      .update({ is_active: !currentState })
      .eq("id", id);

    if (error) {
      console.error("Error updating reminder:", error);
    } else {
      fetchReminders();
    }
  };

  const deleteReminder = async (id: string) => {
    const { error } = await supabase.from("reminders").delete().eq("id", id);

    if (error) {
      console.error("Error deleting reminder:", error);
    } else {
      fetchReminders();
      setDeleteId(null);
    }
  };

  const markComplete = async (id: string) => {
    const { error } = await supabase
      .from("reminders")
      .update({ completed_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      console.error("Error marking reminder complete:", error);
    } else {
      fetchReminders();
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>Loading reminders...</p>
      </div>
    );
  }

  if (reminders.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p className="text-sm">No reminders yet. Set one to get started!</p>
      </div>
    );
  }

  const activeReminders = reminders.filter((r) => r.is_active);
  const inactiveReminders = reminders.filter((r) => !r.is_active);

  return (
    <div className="space-y-4">
      <NotificationPermissionPrompt />
      
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground">Active Reminders</h3>
        <NotificationStatus />
      </div>

      {activeReminders.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-foreground">Active Reminders</h3>
          {activeReminders.map((reminder) => {
            const reminderDate = new Date(reminder.reminder_time);
            const isOverdue = isPast(reminderDate) && !isToday(reminderDate);

            return (
              <div
                key={reminder.id}
                className={`p-4 rounded-lg border ${
                  isOverdue
                    ? "bg-destructive/5 border-destructive/20"
                    : "bg-card border-border"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-foreground">{reminder.task}</p>
                      {reminder.recurrence !== "none" && (
                        <Badge variant="secondary" className="text-xs">
                          {reminder.recurrence}
                        </Badge>
                      )}
                      {isOverdue && (
                        <Badge variant="destructive" className="text-xs">
                          Overdue
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {format(reminderDate, "MMM d, yyyy 'at' h:mm a")}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    {!reminder.completed_at && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => markComplete(reminder.id)}
                        className="h-8 w-8"
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleReminder(reminder.id, reminder.is_active)}
                      className="h-8 w-8"
                    >
                      <BellOff className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteId(reminder.id)}
                      className="h-8 w-8 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {inactiveReminders.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-muted-foreground">Inactive Reminders</h3>
          {inactiveReminders.map((reminder) => (
            <div
              key={reminder.id}
              className="p-4 rounded-lg border bg-muted/30 border-border opacity-60"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <p className="font-medium text-foreground line-through">{reminder.task}</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(reminder.reminder_time), "MMM d, yyyy 'at' h:mm a")}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleReminder(reminder.id, reminder.is_active)}
                    className="h-8 w-8"
                  >
                    <Bell className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeleteId(reminder.id)}
                    className="h-8 w-8 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Reminder?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this reminder. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && deleteReminder(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

