import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, Target, Heart, Briefcase, Users, Sparkles, CheckCircle2 } from "lucide-react";
import { useGoals } from "@/hooks/useGoals";
import { useToast } from "@/hooks/use-toast";

interface GoalDiscoveryProps {
  onComplete: () => void;
  onSkip: () => void;
}

interface Question {
  id: string;
  category: string;
  question: string;
  options: {
    value: string;
    label: string;
    suggestedGoals: {
      title: string;
      description: string;
      category: string;
      timeframe: string;
    }[];
  }[];
}

const questions: Question[] = [
  {
    id: "health",
    category: "Health & Wellness",
    question: "What would you like to improve about your health?",
    options: [
      {
        value: "exercise",
        label: "Exercise more regularly",
        suggestedGoals: [
          {
            title: "Exercise 3 times per week",
            description: "Build a consistent exercise routine",
            category: "health",
            timeframe: "weekly",
          },
          {
            title: "Walk 10,000 steps daily",
            description: "Increase daily movement and activity",
            category: "health",
            timeframe: "daily",
          },
        ],
      },
      {
        value: "nutrition",
        label: "Eat healthier",
        suggestedGoals: [
          {
            title: "Cook 5 healthy meals per week",
            description: "Prepare nutritious meals at home",
            category: "health",
            timeframe: "weekly",
          },
          {
            title: "Drink 8 glasses of water daily",
            description: "Stay hydrated throughout the day",
            category: "health",
            timeframe: "daily",
          },
        ],
      },
      {
        value: "sleep",
        label: "Get better sleep",
        suggestedGoals: [
          {
            title: "Sleep 7-8 hours nightly",
            description: "Establish a consistent sleep schedule",
            category: "health",
            timeframe: "daily",
          },
          {
            title: "Create a bedtime routine",
            description: "Wind down and prepare for restful sleep",
            category: "health",
            timeframe: "weekly",
          },
        ],
      },
      {
        value: "mental",
        label: "Improve mental health",
        suggestedGoals: [
          {
            title: "Practice meditation 10 minutes daily",
            description: "Cultivate mindfulness and reduce stress",
            category: "health",
            timeframe: "daily",
          },
          {
            title: "Journal about my feelings weekly",
            description: "Process emotions and reflect",
            category: "health",
            timeframe: "weekly",
          },
        ],
      },
      {
        value: "none",
        label: "I'm good with my health",
        suggestedGoals: [],
      },
    ],
  },
  {
    id: "career",
    category: "Career & Work",
    question: "What would you like to achieve in your career?",
    options: [
      {
        value: "skills",
        label: "Learn new skills",
        suggestedGoals: [
          {
            title: "Complete an online course",
            description: "Invest in professional development",
            category: "career",
            timeframe: "monthly",
          },
          {
            title: "Read career-related books",
            description: "Expand knowledge in your field",
            category: "career",
            timeframe: "monthly",
          },
        ],
      },
      {
        value: "network",
        label: "Build professional relationships",
        suggestedGoals: [
          {
            title: "Attend 2 networking events this month",
            description: "Connect with professionals in your field",
            category: "career",
            timeframe: "monthly",
          },
          {
            title: "Reach out to 1 professional weekly",
            description: "Maintain and grow your network",
            category: "career",
            timeframe: "weekly",
          },
        ],
      },
      {
        value: "advance",
        label: "Advance in my current role",
        suggestedGoals: [
          {
            title: "Take on a new project at work",
            description: "Demonstrate leadership and initiative",
            category: "career",
            timeframe: "monthly",
          },
          {
            title: "Set up a meeting with my manager",
            description: "Discuss growth opportunities",
            category: "career",
            timeframe: "monthly",
          },
        ],
      },
      {
        value: "balance",
        label: "Improve work-life balance",
        suggestedGoals: [
          {
            title: "Leave work on time 4 days per week",
            description: "Protect personal time and boundaries",
            category: "career",
            timeframe: "weekly",
          },
          {
            title: "Take regular breaks during work",
            description: "Prevent burnout and maintain energy",
            category: "career",
            timeframe: "daily",
          },
        ],
      },
      {
        value: "none",
        label: "I'm satisfied with my career",
        suggestedGoals: [],
      },
    ],
  },
  {
    id: "relationships",
    category: "Relationships",
    question: "How would you like to improve your relationships?",
    options: [
      {
        value: "family",
        label: "Spend more time with family",
        suggestedGoals: [
          {
            title: "Have a family dinner weekly",
            description: "Connect with loved ones regularly",
            category: "relationships",
            timeframe: "weekly",
          },
          {
            title: "Call a family member weekly",
            description: "Stay in touch with distant relatives",
            category: "relationships",
            timeframe: "weekly",
          },
        ],
      },
      {
        value: "friends",
        label: "Strengthen friendships",
        suggestedGoals: [
          {
            title: "Plan a social activity weekly",
            description: "Nurture friendships and have fun",
            category: "relationships",
            timeframe: "weekly",
          },
          {
            title: "Reach out to an old friend",
            description: "Reconnect with someone you miss",
            category: "relationships",
            timeframe: "monthly",
          },
        ],
      },
      {
        value: "romantic",
        label: "Improve my romantic relationship",
        suggestedGoals: [
          {
            title: "Have a date night weekly",
            description: "Prioritize quality time together",
            category: "relationships",
            timeframe: "weekly",
          },
          {
            title: "Express gratitude to my partner daily",
            description: "Show appreciation and strengthen bond",
            category: "relationships",
            timeframe: "daily",
          },
        ],
      },
      {
        value: "new",
        label: "Meet new people",
        suggestedGoals: [
          {
            title: "Join a club or group",
            description: "Find people with shared interests",
            category: "relationships",
            timeframe: "monthly",
          },
          {
            title: "Attend a social event monthly",
            description: "Put yourself out there and connect",
            category: "relationships",
            timeframe: "monthly",
          },
        ],
      },
      {
        value: "none",
        label: "My relationships are good",
        suggestedGoals: [],
      },
    ],
  },
  {
    id: "personal",
    category: "Personal Growth",
    question: "What personal growth would you like to focus on?",
    options: [
      {
        value: "hobbies",
        label: "Develop new hobbies",
        suggestedGoals: [
          {
            title: "Dedicate 2 hours weekly to a hobby",
            description: "Make time for activities you enjoy",
            category: "personal",
            timeframe: "weekly",
          },
          {
            title: "Try a new activity this month",
            description: "Explore new interests and passions",
            category: "personal",
            timeframe: "monthly",
          },
        ],
      },
      {
        value: "learning",
        label: "Learn something new",
        suggestedGoals: [
          {
            title: "Read for 30 minutes daily",
            description: "Expand your knowledge and perspective",
            category: "personal",
            timeframe: "daily",
          },
          {
            title: "Learn a new language",
            description: "Challenge yourself and open new opportunities",
            category: "personal",
            timeframe: "long_term",
          },
        ],
      },
      {
        value: "creativity",
        label: "Express my creativity",
        suggestedGoals: [
          {
            title: "Create something weekly",
            description: "Make art, write, or build something",
            category: "personal",
            timeframe: "weekly",
          },
          {
            title: "Start a creative project",
            description: "Begin something meaningful to you",
            category: "personal",
            timeframe: "monthly",
          },
        ],
      },
      {
        value: "confidence",
        label: "Build confidence",
        suggestedGoals: [
          {
            title: "Do one thing that scares me weekly",
            description: "Step outside your comfort zone",
            category: "personal",
            timeframe: "weekly",
          },
          {
            title: "Practice positive self-talk daily",
            description: "Be kinder to yourself",
            category: "personal",
            timeframe: "daily",
          },
        ],
      },
      {
        value: "none",
        label: "I'm focused on other areas",
        suggestedGoals: [],
      },
    ],
  },
];

export function GoalDiscovery({ onComplete, onSkip }: GoalDiscoveryProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [suggestedGoals, setSuggestedGoals] = useState<
    {
      title: string;
      description: string;
      category: string;
      timeframe: string;
    }[]
  >([]);
  const [selectedGoals, setSelectedGoals] = useState<Set<number>>(new Set());
  const [isCreating, setIsCreating] = useState(false);
  const { createGoal } = useGoals();
  const { toast } = useToast();

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const showSuggestions = suggestedGoals.length > 0;

  const handleAnswer = (value: string, option: Question["options"][0]) => {
    const newAnswers = { ...answers, [currentQuestion.id]: value };
    setAnswers(newAnswers);

    // Collect suggested goals from this answer
    const newSuggestedGoals = [...suggestedGoals, ...option.suggestedGoals];
    setSuggestedGoals(newSuggestedGoals);

    if (isLastQuestion) {
      // Show suggestions after last question
      return;
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handleToggleGoal = (index: number) => {
    const newSelected = new Set(selectedGoals);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedGoals(newSelected);
  };

  const handleCreateGoals = async () => {
    if (selectedGoals.size === 0) {
      toast({
        title: "No goals selected",
        description: "Please select at least one goal to create, or skip this step",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    try {
      const goalsToCreate = Array.from(selectedGoals).map(
        (index) => suggestedGoals[index]
      );

      for (const goal of goalsToCreate) {
        await createGoal(
          goal.title,
          goal.category,
          goal.description,
          undefined,
          goal.timeframe,
          false
        );
      }

      toast({
        title: "Goals created!",
        description: `Successfully created ${goalsToCreate.length} art project${goalsToCreate.length > 1 ? "s" : ""}`,
      });

      onComplete();
    } catch (error) {
      console.error("Error creating goals:", error);
      toast({
        title: "Error creating goals",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleBack = () => {
    if (showSuggestions) {
      // Go back to questions
      setSuggestedGoals([]);
      setSelectedGoals(new Set());
    } else {
      setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1));
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "health":
        return Heart;
      case "career":
        return Briefcase;
      case "relationships":
        return Users;
      case "personal":
        return Sparkles;
      default:
        return Target;
    }
  };

  // Show suggestions screen
  if (showSuggestions) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-background">
        <div className="w-full max-w-2xl animate-fade-in">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6">
              <Target className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-serif font-medium text-foreground mb-3">
              Suggested Art Projects
            </h1>
            <p className="text-muted-foreground">
              Based on your answers, here are some goals we think you might like. Select the ones you want to work on.
            </p>
          </div>

          <div className="space-y-3 mb-6 max-h-[60vh] overflow-y-auto">
            {suggestedGoals.map((goal, index) => {
              const Icon = getCategoryIcon(goal.category);
              const isSelected = selectedGoals.has(index);

              return (
                <button
                  key={index}
                  onClick={() => handleToggleGoal(index)}
                  className={`w-full p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                    isSelected
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50 hover:bg-primary/5"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                        isSelected
                          ? "border-primary bg-primary"
                          : "border-border"
                      }`}
                    >
                      {isSelected && (
                        <CheckCircle2 className="w-4 h-4 text-primary-foreground" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className="w-4 h-4 text-primary" />
                        <div className="font-medium text-foreground">
                          {goal.title}
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {goal.description}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {suggestedGoals.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p>No specific goals suggested based on your answers.</p>
              <p className="text-sm mt-2">
                You can always create your own art projects later!
              </p>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              className="h-12 rounded-xl px-4"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <Button
              onClick={handleCreateGoals}
              disabled={isCreating || selectedGoals.size === 0}
              className="flex-1 h-12 rounded-xl bg-primary hover:bg-primary/90"
            >
              {isCreating ? (
                "Creating..."
              ) : (
                <>
                  Create {selectedGoals.size} Art Project{selectedGoals.size !== 1 ? "s" : ""}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={onSkip}
              className="h-12 rounded-xl px-4"
            >
              Skip
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Show question screen
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-background">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6">
            <Target className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-serif font-medium text-foreground mb-3">
            {currentQuestion.category}
          </h1>
          <p className="text-muted-foreground text-lg">
            {currentQuestion.question}
          </p>
        </div>

        <div className="space-y-3 mb-6">
          {currentQuestion.options.map((option) => (
            <button
              key={option.value}
              onClick={() => handleAnswer(option.value, option)}
              className="w-full p-4 rounded-xl bg-card border border-border hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 text-left group"
            >
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-primary mt-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex-1 font-medium text-foreground">
                  {option.label}
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={currentQuestionIndex === 0 ? onSkip : handleBack}
            className="h-12 rounded-xl px-4"
          >
            {currentQuestionIndex === 0 ? (
              "Skip"
            ) : (
              <>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </>
            )}
          </Button>

          <div className="flex items-center gap-2">
            {questions.map((_, i) => (
              <div
                key={i}
                className={`h-2 rounded-full transition-all ${
                  i === currentQuestionIndex
                    ? "w-8 bg-primary"
                    : i < currentQuestionIndex
                    ? "w-2 bg-primary/50"
                    : "w-2 bg-muted"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

