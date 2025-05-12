
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { isSupabaseConfigured } from "../lib/supabase";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const supabaseReady = isSupabaseConfigured();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!supabaseReady) {
      toast({
        title: "Supabase not configured",
        description: "Please connect your app to Supabase before logging in.",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);

    try {
      const result = await signIn(email, password);
      
      if (result?.error) {
        console.log("Login error:", result.error);
        
        if (result.error.message.includes("Email not confirmed")) {
          toast({
            title: "Email not confirmed",
            description: "Please check your email to confirm your account before logging in.",
            variant: "destructive",
          });
        } else if (result.error.message.includes("Invalid login credentials")) {
          toast({
            title: "Invalid credentials",
            description: "Email or password is incorrect. Please try again.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Login failed",
            description: result.error.message,
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Welcome back!",
          description: "You've successfully logged in.",
        });
        navigate("/home");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login failed",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center quickbite-container">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-[#F97316] mb-2">QuickBite</h1>
        <p className="text-gray-600">Find recipes with ingredients you have</p>
      </div>

      <div className="quickbite-card">
        <h2 className="text-xl font-semibold mb-6 text-center">Login to your account</h2>

        {!supabaseReady && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-yellow-700 text-sm">
              <strong>Supabase connection needed:</strong> Please connect your app to Supabase using the green Supabase button at the top of the editor before logging in.
            </p>
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="quickbite-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="quickbite-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="quickbite-button w-full mb-4"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{" "}
            <Link to="/signup" className="text-[#F97316] hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
