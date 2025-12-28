import { useState } from "react";
import { Button } from "@/components/ui/button";
import { BookOpen, ArrowRight, Sparkles } from "lucide-react";

interface OnboardingProps {
  onComplete: () => void;
  onStartWriting: () => void;
}

export function Onboarding({ onComplete, onStartWriting }: OnboardingProps) {
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: "You Are a Work of Art",
      description: "Every goal you complete, every reflection you make, creates a new piece in your gallery. You're not just growing—you're creating art.",
      icon: Palette,
    },
    {
      title: "Your Gallery Grows With You",
      description: "Set goals, reflect on your journey, and watch your gallery fill with beautiful art pieces that represent your growth.",
      icon: Sparkles,
    },
    {
      title: "Start Creating",
      description: "Begin by setting a goal or reflecting on your journey. Each action adds to your gallery—your collection of who you're becoming.",
      icon: ArrowRight,
    },
  ];

  const currentStep = steps[step];
  const Icon = currentStep.icon;

  if (step < steps.length - 1) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-background">
        <div className="text-center max-w-md animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 mb-6">
            <Icon className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-3xl font-serif font-medium text-foreground mb-4">
            {currentStep.title}
          </h2>
          <p className="text-muted-foreground leading-relaxed text-lg mb-8">
            {currentStep.description}
          </p>
          <div className="flex items-center justify-center gap-4">
            {step > 0 && (
              <Button
                variant="ghost"
                onClick={() => setStep(step - 1)}
                className="text-muted-foreground"
              >
                Back
              </Button>
            )}
            <Button
              onClick={() => setStep(step + 1)}
              className="min-w-[120px]"
            >
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
          <div className="flex items-center justify-center gap-2 mt-6">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-2 rounded-full transition-all ${
                  i === step
                    ? "w-8 bg-primary"
                    : "w-2 bg-muted"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Final step - ready to start
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <div className="text-center max-w-md animate-fade-in">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 mb-6">
          <Icon className="w-10 h-10 text-primary" />
        </div>
        <h2 className="text-3xl font-serif font-medium text-foreground mb-4">
          {currentStep.title}
        </h2>
        <p className="text-muted-foreground leading-relaxed text-lg mb-8">
          {currentStep.description}
        </p>
        <div className="flex flex-col gap-3">
          <Button
            onClick={onStartWriting}
            size="lg"
            className="w-full"
          >
            Start Writing
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          <Button
            variant="ghost"
            onClick={onComplete}
            className="text-muted-foreground"
          >
            Skip for now
          </Button>
        </div>
      </div>
    </div>
  );
}

