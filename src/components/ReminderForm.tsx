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
  
  const [task, setTask] = useState(initialTask);
  const [date, setDate] = useState(defaultDateTime.date);
  const [time, setTime] = useState(defaultDateTime.time);
  const [recurrence, setRecurrence] = useState<"none" | "daily" | "weekly" | "weekdays">("none");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Use actual values from state or defaults
    const finalDate = date || defaultDateTime.date;
    const finalTime = time || defaultDateTime.time;
    
    if (!user || !task.trim() || !finalDate || !finalTime) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Combine date and time into a single timestamp (use final values)
      const reminderDateTime = new Date(`${finalDate}T${finalTime}`);

      console.log("Creating reminder with:", {
        user_id: user.id,
        task: task.trim(),
        reminder_time: reminderDateTime.toISOString(),
        recurrence,
      });

      const { data, error } = await supabase.from("reminders").insert({
        user_id: user.id,
        task: task.trim(),
        reminder_time: reminderDateTime.toISOString(),
        recurrence,
        is_active: true,
      }).select();

      if (error) {
        console.error("Supabase error details:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
          fullError: error,
        });
        // Supabase errors have a specific structure
        const supabaseError = new Error(
          error.message || error.details || error.hint || "Database error occurred"
        );
        (supabaseError as any).code = error.code;
        throw supabaseError;
      }

      console.log("Reminder created successfully:", data);

      toast({
        title: "Reminder set!",
        description: "Your future self will check in with you.",
      });

      setTask("");
      setDate(defaultDateTime.date);
      setTime(defaultDateTime.time);
      setRecurrence("none");
      onSuccess?.();
    } catch (error) {
      console.error("Error creating reminder:", error);
      
      // Extract error message properly
      let errorMessage = "Please try again.";
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (error && typeof error === 'object') {
        // Handle Supabase error objects
        const supabaseError = error as any;
        if (supabaseError.message) {
          errorMessage = supabaseError.message;
        } else if (supabaseError.error) {
          errorMessage = supabaseError.error;
        } else if (supabaseError.details) {
          errorMessage = supabaseError.details;
        } else {
          errorMessage = JSON.stringify(error);
        }
      } else if (error) {
        errorMessage = String(error);
      }
      
      // Check if it's a table not found error
      const isTableMissing = errorMessage.includes("relation") && errorMessage.includes("does not exist");
      const isPermissionError = errorMessage.includes("permission") || errorMessage.includes("policy");
      
      toast({
        title: "Failed to create reminder",
        description: isTableMissing
          ? "Database table not found. Please run the migration in Supabase."
          : isPermissionError
          ? "Permission denied. Check your Supabase RLS policies."
          : errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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
            value={date}
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
            value={time}
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

