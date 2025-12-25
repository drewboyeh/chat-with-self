import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, Clock } from "lucide-react";

interface ReminderFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  initialTask?: string;
}

export function ReminderForm({ onSuccess, onCancel, initialTask = "" }: ReminderFormProps) {
  const [task, setTask] = useState(initialTask);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [recurrence, setRecurrence] = useState<"none" | "daily" | "weekly" | "weekdays">("none");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !task.trim() || !date || !time) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Combine date and time into a single timestamp
      const reminderDateTime = new Date(`${date}T${time}`);
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      const { error } = await supabase.from("reminders").insert({
        user_id: user.id,
        task: task.trim(),
        reminder_time: reminderDateTime.toISOString(),
        recurrence,
        timezone,
        is_active: true,
      });

      if (error) throw error;

      toast({
        title: "Reminder set!",
        description: "Your future self will check in with you.",
      });

      setTask("");
      setDate("");
      setTime("");
      setRecurrence("none");
      onSuccess?.();
    } catch (error) {
      console.error("Error creating reminder:", error);
      toast({
        title: "Failed to create reminder",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Set default time to 1 hour from now
  const getDefaultDateTime = () => {
    const now = new Date();
    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
    return {
      date: oneHourLater.toISOString().split("T")[0],
      time: oneHourLater.toTimeString().slice(0, 5),
    };
  };

  const defaultDateTime = getDefaultDateTime();

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="task">What do you want to do?</Label>
        <Input
          id="task"
          value={task}
          onChange={(e) => setTask(e.target.value)}
          placeholder="e.g., Go to the gym, Meditate, Call mom..."
          className="w-full"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="date">
            <Calendar className="w-4 h-4 inline mr-2" />
            Date
          </Label>
          <Input
            id="date"
            type="date"
            value={date || defaultDateTime.date}
            onChange={(e) => setDate(e.target.value)}
            min={new Date().toISOString().split("T")[0]}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="time">
            <Clock className="w-4 h-4 inline mr-2" />
            Time
          </Label>
          <Input
            id="time"
            type="time"
            value={time || defaultDateTime.time}
            onChange={(e) => setTime(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="recurrence">Repeat</Label>
        <Select value={recurrence} onValueChange={(v) => setRecurrence(v as typeof recurrence)}>
          <SelectTrigger id="recurrence">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Just once</SelectItem>
            <SelectItem value="daily">Daily</SelectItem>
            <SelectItem value="weekdays">Weekdays only</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-2 pt-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting} className="flex-1">
          {isSubmitting ? "Setting reminder..." : "Set Reminder"}
        </Button>
      </div>
    </form>
  );
}

