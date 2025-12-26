import { useAuth } from "@/hooks/useAuth";
import { useReminders } from "@/hooks/useReminders";
import { NameForm } from "@/components/NameForm";
import { ChatJournal } from "@/components/ChatJournal";
import { CheckInDialog } from "@/components/CheckInDialog";

const Index = () => {
  const { user, loading } = useAuth();
  const { checkInReminder, setCheckInReminder } = useReminders();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center animate-fade-in">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <NameForm />;
  }

  return (
    <>
      <ChatJournal />
      {checkInReminder && (
        <CheckInDialog
          open={!!checkInReminder}
          onOpenChange={(open) => {
            if (!open) setCheckInReminder(null);
          }}
          reminder={checkInReminder}
        />
      )}
    </>
  );
};

export default Index;