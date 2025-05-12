
import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { User, Session } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  session: Session | null; 
  loading: boolean;
  signUp: (email: string, password: string, username: string) => Promise<{ error: any } | undefined>;
  signIn: (email: string, password: string) => Promise<{ error: any } | undefined>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth state changed:", event, session);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("Initial session check:", session);
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, username: string) => {
    try {
      console.log("Signing up:", { email, username });
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
          },
        },
      });

      if (error) {
        console.error("Signup error:", error);
        throw error;
      }
      
      console.log("Signup successful:", data);
      
      if (data.user) {
        const { error: profileError } = await supabase.from('profiles').insert([
          { 
            id: data.user.id, 
            username, 
            email, 
            created_at: new Date() 
          }
        ]);
        
        if (profileError) {
          console.error("Error creating profile:", profileError);
        } else {
          console.log("Profile created successfully");
        }
        
        if (!error) {
          await signIn(email, password);
        }
      }
      
    } catch (error) {
      console.error("Signup process error:", error);
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log("Signing in:", { email });
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Signin error:", error);
        throw error;
      }
      
      console.log("Signin successful:", data);
    } catch (error) {
      console.error("Signin process error:", error);
      return { error };
    }
  };

  const signOut = async () => {
    console.log("Signing out");
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, signUp, signIn, signOut, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
