"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Loader2 } from "lucide-react";
import { useStore } from "@/lib/store";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const [isSignUp, setIsSignUp] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const { setUserProfile } = useStore();

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const supabase = createClient();

        if (isSignUp) {
            // Sign Up Flow
            const { data, error: signUpError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                    },
                },
            });

            if (signUpError) {
                setError(signUpError.message);
                setLoading(false);
                return;
            }

            if (data.user) {
                // Determine role based on email (demo logic)
                const role = email.toLowerCase().includes('admin') ? 'admin' : 'dev';

                // Explicitly insert into profiles table
                const { error: profileError } = await supabase
                    .from('profiles')
                    .upsert({
                        id: data.user.id,
                        full_name: fullName,
                        role: role
                    });

                if (profileError) {
                    console.error("Profile creation error:", profileError);
                }

                setUserProfile({ name: fullName, role });
                router.push("/");
                router.refresh();
            }
        } else {
            // Login Flow
            const { data, error: signInError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (signInError) {
                setError(signInError.message);
                setLoading(false);
            } else {
                // Fetch profile
                const { data: profile, error: profileError } = await supabase
                    .from('profiles')
                    .select('full_name, role')
                    .eq('id', data.user.id)
                    .single();

                if (profile) {
                    setUserProfile({ name: profile.full_name || email, role: profile.role || 'dev' });
                } else {
                    // Fallback if profile doesn't exist
                    setUserProfile({ name: email, role: 'dev' });
                }

                router.push("/");
                router.refresh();
            }
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-4">
            <div className="w-full max-w-md space-y-8 bg-card p-8 rounded-xl border shadow-lg">
                <div className="text-center">
                    <div className="mx-auto w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                        <Image src="/logo.svg" alt="Task Blazar Logo" width={48} height={48} className="drop-shadow-lg" />
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight">
                        {isSignUp ? "Create an account" : "Welcome back"}
                    </h2>
                    <p className="text-muted-foreground mt-2">
                        {isSignUp ? "Enter your details to register" : "Sign in to your account"}
                    </p>
                </div>

                <form onSubmit={handleAuth} className="space-y-6">
                    {isSignUp && (
                        <div className="space-y-2">
                            <label className="text-sm font-medium" htmlFor="fullName">Full Name</label>
                            <input
                                id="fullName"
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="w-full bg-background border rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="John Doe"
                                required
                            />
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-sm font-medium" htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-background border rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="name@example.com"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium" htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-background border rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    {error && (
                        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md text-sm text-destructive">
                            {error}
                        </div>
                    )}

                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                        {isSignUp ? "Sign Up" : "Sign In"}
                    </Button>
                </form>

                <div className="text-center text-sm text-muted-foreground">
                    {isSignUp ? (
                        <>
                            Already have an account?{" "}
                            <button onClick={() => setIsSignUp(false)} className="text-primary hover:underline">
                                Sign In
                            </button>
                        </>
                    ) : (
                        <>
                            Don't have an account?{" "}
                            <button onClick={() => setIsSignUp(true)} className="text-primary hover:underline">
                                Sign Up
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
