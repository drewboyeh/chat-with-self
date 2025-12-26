import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { BookOpen, Loader2, ArrowRight } from "lucide-react";

export function NameForm() {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const { signInAnonymously } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);

    const { error } = await signInAnonymously(name.trim());

    if (error) {
      toast({
        title: "Something went wrong",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: `Welcome, ${name}!`,
        description: "Your journal is ready. Let's begin.",
      });
    }

    setLoading(false);
  };

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
          <form onSubmit={handleSubmit} className="space-y-6">
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
                This is just for personalization. Your data stays private and secure, even if others use the same name.
              </p>
            </div>

            <Button
              type="submit"
              disabled={loading || !name.trim()}
              className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-warm transition-all duration-200"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Your journal is stored securely on your device and in the cloud
        </p>
      </div>
    </div>
  );
}

