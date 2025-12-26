import { useState, useEffect } from "react";
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
import { Calendar, Clock, Globe } from "lucide-react";

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
  
  // Get user's timezone or default to browser timezone
  const getUserTimezone = () => {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  };

  const [task, setTask] = useState(initialTask);
  const [date, setDate] = useState(defaultDateTime.date);
  const [time, setTime] = useState(defaultDateTime.time);
  const [timezone, setTimezone] = useState(getUserTimezone());
  const [recurrence, setRecurrence] = useState<"none" | "daily" | "weekly" | "weekdays">("none");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Get list of common timezones
  const commonTimezones = [
    { value: "America/New_York", label: "Eastern Time (ET)" },
    { value: "America/Chicago", label: "Central Time (CT)" },
    { value: "America/Denver", label: "Mountain Time (MT)" },
    { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
    { value: "America/Phoenix", label: "Arizona (MST)" },
    { value: "America/Anchorage", label: "Alaska (AKST)" },
    { value: "Pacific/Honolulu", label: "Hawaii (HST)" },
    { value: "Europe/London", label: "London (GMT)" },
    { value: "Europe/Paris", label: "Paris (CET)" },
    { value: "Europe/Berlin", label: "Berlin (CET)" },
    { value: "Asia/Tokyo", label: "Tokyo (JST)" },
    { value: "Asia/Shanghai", label: "Shanghai (CST)" },
    { value: "Asia/Dubai", label: "Dubai (GST)" },
    { value: "Australia/Sydney", label: "Sydney (AEDT)" },
    { value: "America/Toronto", label: "Toronto (EST)" },
    { value: "America/Vancouver", label: "Vancouver (PST)" },
    { value: "America/Mexico_City", label: "Mexico City (CST)" },
    { value: "America/Sao_Paulo", label: "São Paulo (BRT)" },
    { value: "Asia/Kolkata", label: "Mumbai/Delhi (IST)" },
    { value: "Asia/Singapore", label: "Singapore (SGT)" },
  ];

  // Sort timezones, putting user's timezone first
  const sortedTimezones = [...commonTimezones].sort((a, b) => {
    if (a.value === timezone) return -1;
    if (b.value === timezone) return 1;
    return a.label.localeCompare(b.label);
  });

  // Helper function to get timezone offset in milliseconds
  const getTimezoneOffset = (date: Date, timeZone: string): number => {
    const utcDate = new Date(date.toLocaleString("en-US", { timeZone: "UTC" }));
    const tzDate = new Date(date.toLocaleString("en-US", { timeZone }));
    return utcDate.getTime() - tzDate.getTime();
  };

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
      // Convert date/time from user's timezone to UTC for storage
      const [year, month, day] = finalDate.split("-").map(Number);
      const [hours, minutes] = finalTime.split(":").map(Number);
      
      // Create a UTC date with these components
      const utcTest = new Date(Date.UTC(year, month - 1, day, hours, minutes, 0));
      
      // Format this UTC date in the user's timezone to see what it displays as
      const formatter = new Intl.DateTimeFormat("en-US", {
        timeZone: timezone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });
      
      const parts = formatter.formatToParts(utcTest);
      const displayedYear = parseInt(parts.find(p => p.type === "year")?.value || "0");
      const displayedMonth = parseInt(parts.find(p => p.type === "month")?.value || "0");
      const displayedDay = parseInt(parts.find(p => p.type === "day")?.value || "0");
      const displayedHour = parseInt(parts.find(p => p.type === "hour")?.value || "0");
      const displayedMinute = parseInt(parts.find(p => p.type === "minute")?.value || "0");
      
      // Calculate the difference between target and displayed time
      const targetTime = new Date(year, month - 1, day, hours, minutes, 0).getTime();
      const displayedTime = new Date(displayedYear, displayedMonth - 1, displayedDay, displayedHour, displayedMinute, 0).getTime();
      const timeDiff = targetTime - displayedTime;
      
      // Adjust UTC time to get the correct UTC equivalent
      const reminderDateTime = new Date(utcTest.getTime() + timeDiff);

      console.log("Creating reminder with:", {
        user_id: user.id,
        task: task.trim(),
        reminder_time: reminderDateTime.toISOString(),
        recurrence,
        timezone,
      });

      const { data, error } = await supabase.from("reminders").insert({
        user_id: user.id,
        task: task.trim(),
        reminder_time: reminderDateTime.toISOString(),
        recurrence,
        timezone,
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
            onChange={(e) => {
              const selectedDate = e.target.value;
              const today = new Date().toISOString().split("T")[0];
              
              // Allow today and future dates
              if (selectedDate >= today) {
                setDate(selectedDate);
              } else {
                toast({
                  title: "Invalid date",
                  description: "Please select today or a future date.",
                  variant: "destructive",
                });
              }
            }}
            min={new Date().toISOString().split("T")[0]}
            max="2099-12-31"
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

      <div className="grid grid-cols-2 gap-4">
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

        <div className="space-y-2">
          <Label htmlFor="timezone">
            <Globe className="w-4 h-4 inline mr-2" />
            Timezone
          </Label>
          <Select value={timezone} onValueChange={setTimezone}>
            <SelectTrigger id="timezone">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-[300px]">
              {sortedTimezones.map((tz) => (
                <SelectItem key={tz.value} value={tz.value}>
                  {tz.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
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

