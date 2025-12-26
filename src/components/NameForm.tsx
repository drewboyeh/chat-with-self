import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { BookOpen, Loader2, ArrowRight, Calendar } from "lucide-react";

export function NameForm() {
  const [step, setStep] = useState(1); // 1 = name, 2 = birthday
  const [name, setName] = useState("");
  const [birthday, setBirthday] = useState("");
  const [loading, setLoading] = useState(false);
  const { signInAnonymously } = useAuth();
  const { toast } = useToast();

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setStep(2);
  };

  const handleBirthdaySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!birthday) return;

    setLoading(true);

    const { error } = await signInAnonymously(name.trim(), birthday);

    if (error) {
      toast({
        title: "Something went wrong",
        description: error.message,
        variant: "destructive",
      });
      setLoading(false);
    } else {
      toast({
        title: `Welcome, ${name}!`,
        description: "Your journal is ready. Let's begin.",
      });
      // The app will automatically navigate once auth state updates
    }
  };

  const handleBack = () => {
    setStep(1);
  };

  // Step 1: Name
  if (step === 1) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-background">
        <div className="w-full max-w-md animate-fade-in">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6">
              <BookOpen className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl font-serif font-medium text-foreground mb-3">
              Welcome
            </h1>
            <p className="text-muted-foreground text-lg">
              Let's personalize your journal
            </p>
          </div>

          {/* Form */}
          <div className="bg-card rounded-2xl p-8 shadow-soft border border-border">
            <form onSubmit={handleNameSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  What's your name?
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoFocus
                  maxLength={50}
                  className="h-12 rounded-xl bg-background border-border focus:border-primary focus:ring-primary/20 text-lg"
                />
                <p className="text-xs text-muted-foreground">
                  This is just for personalization. Your data stays private and secure.
                </p>
              </div>

              <Button
                type="submit"
                disabled={!name.trim()}
                className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-warm transition-all duration-200"
              >
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </form>
          </div>

          <div className="flex items-center justify-center gap-2 mt-6">
            <div className="h-2 w-8 rounded-full bg-primary" />
            <div className="h-2 w-2 rounded-full bg-muted" />
          </div>
        </div>
      </div>
    );
  }

  // Step 2: Birthday
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <div className="w-full max-w-md animate-fade-in">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6">
            <Calendar className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-serif font-medium text-foreground mb-3">
            When's your birthday?
          </h1>
          <p className="text-muted-foreground text-lg">
            We'll use this to personalize your experience
          </p>
        </div>

        {/* Form */}
        <div className="bg-card rounded-2xl p-8 shadow-soft border border-border">
          <form onSubmit={handleBirthdaySubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="birthday" className="text-sm font-medium">
                Your birthday
              </Label>
              <Input
                id="birthday"
                type="date"
                value={birthday}
                onChange={(e) => setBirthday(e.target.value)}
                required
                autoFocus
                max={new Date().toISOString().split("T")[0]}
                className="h-12 rounded-xl bg-background border-border focus:border-primary focus:ring-primary/20 text-lg"
              />
              <p className="text-xs text-muted-foreground">
                We'll celebrate special moments with you
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                className="flex-1 h-12 rounded-xl"
              >
                Back
              </Button>
              <Button
                type="submit"
                disabled={loading || !birthday}
                className="flex-1 h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-warm transition-all duration-200"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Start Journaling
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>

        <div className="flex items-center justify-center gap-2 mt-6">
          <div className="h-2 w-2 rounded-full bg-muted" />
          <div className="h-2 w-8 rounded-full bg-primary" />
        </div>
      </div>
    </div>
  );
}

