import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Loader2, ArrowRight, Phone, Users, ArrowLeft, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

const therapistStyles = [
  {
    id: "collaborative",
    name: "Collaborative",
    focus: "Your own internal values",
    question: "Why is this change important to you?",
  },
  {
    id: "practical",
    name: "Practical",
    focus: "Skill mastery and logic",
    question: "What new habit can we build today?",
  },
  {
    id: "empathetic",
    name: "Empathetic",
    focus: "Safety and self-acceptance",
    question: "How can you be kinder to yourself?",
  },
  {
    id: "challenger",
    name: "Challenger",
    focus: "Vision of the future",
    question: "What does your life look like without this?",
  },
  {
    id: "archeologist",
    name: "Archeologist",
    focus: "Deep self-understanding",
    question: "Where did this pattern begin?",
  },
];

export function NameForm() {
  const [step, setStep] = useState(1); // 1 = welcome, 2 = phone, 3 = verify, 4 = style, 5 = name
  const [phone, setPhone] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const { signInAnonymously } = useAuth();
  const { toast } = useToast();

  const handleWelcomeContinue = () => {
    setStep(2);
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) return;

    console.log('📞 Starting phone verification for:', phone.trim());
    setSendingCode(true);
    
    try {
      console.log('📡 Calling send-verification-code function...');
      const { data, error } = await supabase.functions.invoke('send-verification-code', {
        body: { phone: phone.trim() }
      });

      console.log('📥 Response received:', { data, error });

      if (error) {
        console.error('❌ Supabase function error:', error);
        throw error;
      }

      if (data?.error) {
        console.error('❌ Error in response data:', data.error);
        throw new Error(data.error);
      }

      // Log the code for debugging (remove in production)
      if (data?.code) {
        console.log('═══════════════════════════════════════');
        console.log('🔐 VERIFICATION CODE:', data.code);
        console.log('📱 Message SID:', data.messageSid);
        console.log('📊 Message Status:', data.messageStatus);
        console.log('═══════════════════════════════════════');
      } else {
        console.warn('⚠️ No code in response:', data);
      }

      toast({
        title: "Code sent!",
        description: data?.code 
          ? `Check your phone. Code: ${data.code} (testing mode)` 
          : "Check your phone for the verification code",
      });
      setStep(3);
    } catch (error: any) {
      console.error('═══════════════════════════════════════');
      console.error('❌ ERROR SENDING CODE:');
      console.error('Error object:', error);
      console.error('Error message:', error.message);
      console.error('Error data:', error.data);
      console.error('Full error:', JSON.stringify(error, null, 2));
      console.error('═══════════════════════════════════════');
      
      // Extract error message from various possible formats
      let errorMessage = "Please try again";
      if (error.message) {
        errorMessage = error.message;
      } else if (error.data?.error) {
        errorMessage = error.data.error;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      toast({
        title: "Failed to send code",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setSendingCode(false);
      console.log('✅ Phone submit handler finished');
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (verificationCode.length !== 6) return;

    setVerifying(true);
    try {
      const { data, error } = await supabase.functions.invoke('verify-code', {
        body: { phone: phone.trim(), code: verificationCode }
      });

      if (error) {
        throw error;
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      toast({
        title: "Phone verified!",
        description: "Your phone number has been verified",
      });
      setStep(4);
    } catch (error: any) {
      console.error('Error verifying code:', error);
      toast({
        title: "Verification failed",
        description: error.message || "Invalid code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setVerifying(false);
    }
  };

  const handleResendCode = async () => {
    setSendingCode(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-verification-code', {
        body: { phone: phone.trim() }
      });

      if (error) {
        throw error;
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      toast({
        title: "Code resent!",
        description: "Check your phone for the new verification code",
      });
      setVerificationCode("");
    } catch (error: any) {
      toast({
        title: "Failed to resend code",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setSendingCode(false);
    }
  };

  const handleStyleSelect = (styleId: string) => {
    setSelectedStyle(styleId);
    setStep(5);
  };

  const handleNameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);

    const { error } = await signInAnonymously(name.trim(), phone.trim(), selectedStyle);

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
        description: "Your journey begins now.",
      });
    }
  };

  const handleBack = () => {
    if (step === 3) {
      setVerificationCode("");
    }
    setStep((prev) => prev - 1);
  };

  // Step indicators - now 5 steps
  const StepIndicator = ({ current }: { current: number }) => (
    <div className="flex items-center justify-center gap-2 mt-6">
      {[1, 2, 3, 4, 5].map((s) => (
        <div
          key={s}
          className={`h-2 rounded-full transition-all ${
            s === current ? "w-8 bg-primary" : "w-2 bg-muted"
          }`}
        />
      ))}
    </div>
  );

  // Step 1: Welcome
  if (step === 1) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-background">
        <div className="w-full max-w-md animate-fade-in">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-8">
              <Sparkles className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-4xl font-serif font-medium text-foreground mb-4">
              Start Your Journey
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              A space for reflection, growth, and understanding yourself better.
            </p>
          </div>

          <Button
            onClick={handleWelcomeContinue}
            className="w-full h-14 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-warm transition-all duration-200 text-lg"
          >
            Begin
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>

          <StepIndicator current={1} />
        </div>
      </div>
    );
  }

  // Step 2: Phone
  if (step === 2) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-background">
        <div className="w-full max-w-md animate-fade-in">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6">
              <Phone className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-serif font-medium text-foreground mb-3">
              Your Phone Number
            </h1>
            <p className="text-muted-foreground">
              We'll send you a verification code
            </p>
          </div>

          <div className="bg-card rounded-2xl p-8 shadow-soft border border-border">
            <form onSubmit={handlePhoneSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium">
                  Phone number
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="(555) 123-4567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  autoFocus
                  className="h-12 rounded-xl bg-background border-border focus:border-primary focus:ring-primary/20 text-lg"
                />
                <p className="text-xs text-muted-foreground">
                  Your number is kept private and secure
                </p>
              </div>

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
                  type="submit"
                  disabled={!phone.trim() || sendingCode}
                  className="flex-1 h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-warm transition-all duration-200"
                >
                  {sendingCode ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      Send Code
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>

          <StepIndicator current={2} />
        </div>
      </div>
    );
  }

  // Step 3: Verify Code
  if (step === 3) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-background">
        <div className="w-full max-w-md animate-fade-in">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6">
              <ShieldCheck className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-serif font-medium text-foreground mb-3">
              Enter Verification Code
            </h1>
            <p className="text-muted-foreground">
              We sent a 6-digit code to {phone}
            </p>
          </div>

          <div className="bg-card rounded-2xl p-8 shadow-soft border border-border">
            <form onSubmit={handleVerifyCode} className="space-y-6">
              <div className="space-y-4">
                <Label className="text-sm font-medium text-center block">
                  Verification code
                </Label>
                <div className="flex justify-center">
                  <InputOTP
                    maxLength={6}
                    value={verificationCode}
                    onChange={(value) => setVerificationCode(value)}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleResendCode}
                    disabled={sendingCode}
                    className="text-sm text-primary hover:underline disabled:opacity-50"
                  >
                    {sendingCode ? "Sending..." : "Didn't receive a code? Resend"}
                  </button>
                </div>
              </div>

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
                  type="submit"
                  disabled={verificationCode.length !== 6 || verifying}
                  className="flex-1 h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-warm transition-all duration-200"
                >
                  {verifying ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      Verify
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>

          <StepIndicator current={3} />
        </div>
      </div>
    );
  }

  // Step 4: Therapist Style
  if (step === 4) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-background">
        <div className="w-full max-w-md animate-fade-in">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6">
              <Users className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-serif font-medium text-foreground mb-3">
              Choose Your Style
            </h1>
            <p className="text-muted-foreground">
              How would you like your AI therapist to work with you?
            </p>
          </div>

          <div className="space-y-3 mb-6">
            {therapistStyles.map((style) => (
              <button
                key={style.id}
                onClick={() => handleStyleSelect(style.id)}
                className="w-full p-4 rounded-xl bg-card border border-border hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 text-left group"
              >
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="flex-1">
                    <div className="font-medium text-foreground mb-1">
                      {style.name}
                    </div>
                    <div className="text-sm text-muted-foreground mb-2">
                      {style.focus}
                    </div>
                    <div className="text-sm text-primary/80 italic">
                      "{style.question}"
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={handleBack}
            className="w-full h-12 rounded-xl"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <StepIndicator current={4} />
        </div>
      </div>
    );
  }

  // Step 5: Name
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-serif font-medium text-foreground mb-3">
            What should I call you?
          </h1>
          <p className="text-muted-foreground">
            Your AI therapist would like to know your name
          </p>
        </div>

        <div className="bg-card rounded-2xl p-8 shadow-soft border border-border">
          <form onSubmit={handleNameSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Your name
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
            </div>

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
                type="submit"
                disabled={loading || !name.trim()}
                className="flex-1 h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-warm transition-all duration-200"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Start My Journey
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>

        <StepIndicator current={5} />
      </div>
    </div>
  );
}
