import { Button } from "@/components/ui/button";
import { Palette } from "lucide-react";

interface SplashScreenProps {
  onGetStarted: () => void;
}

export function SplashScreen({ onGetStarted }: SplashScreenProps) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-background via-background to-muted/20">
      <div className="w-full max-w-md text-center animate-fade-in">
        <div className="mb-12">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary/10 mb-8 animate-pulse">
            <Palette className="w-12 h-12 text-primary" />
          </div>
          <h1 className="text-6xl font-serif font-bold text-foreground mb-6 tracking-tight">
            selfart
          </h1>
          <p className="text-2xl text-muted-foreground font-light italic">
            turn life into your masterpiece
          </p>
        </div>

        <Button
          onClick={onGetStarted}
          className="w-full h-14 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-lg transition-all duration-200 text-lg hover:scale-105"
          size="lg"
        >
          Get Started
        </Button>
      </div>
    </div>
  );
}

