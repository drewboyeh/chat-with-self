import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  userName: string | null;
  signInAnonymously: (name: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      // Get user name from metadata
      if (session?.user) {
        const name = session.user.user_metadata?.name || null;
        setUserName(name);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        // Get user name from metadata
        if (session?.user) {
          const name = session.user.user_metadata?.name || null;
          setUserName(name);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signInAnonymously = async (name: string, birthday?: string) => {
    // Sign in anonymously with name and birthday in metadata
    const metadata: { name: string; birthday?: string } = { name };
    if (birthday) {
      metadata.birthday = birthday;
    }

    const { data, error } = await supabase.auth.signInAnonymously({
      options: {
        data: metadata,
      },
    });

    if (data?.user) {
      setUserName(name);
    }

    return { error: error as Error | null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUserName(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, userName, signInAnonymously, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
