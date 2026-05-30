"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { toast } from "sonner";
import { loginSchema, type LoginFormData } from "@/features/auth/lib/login-schema";
import { AuthInput } from "@/features/auth/components/auth-input";
import { AuthButton } from "@/features/auth/components/auth-button";
import { AuthDivider } from "@/features/auth/components/auth-divider";
import { AuthFooter } from "@/features/auth/components/auth-footer";
import { GitHubButton } from "@/features/auth/components/github-button";
import { GoogleButton } from "@/features/auth/components/google-button";
import { Logo } from "@/features/auth/components/logo";

async function apiLogin(username: string, password: string) {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) {
    const d = await res.json().catch(() => ({}));
    throw new Error(d.error || 'Login failed');
  }
  return res.json();
}

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(data: LoginFormData) {
    try {
      await apiLogin(data.email, data.password);
      toast.success('Signed in successfully');
      router.push('/dashboard');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Invalid credentials');
    }
  }

  async function quickLogin() {
    try {
      await apiLogin('admin', 'admin');
      toast.success('Signed in as admin');
      router.push('/dashboard');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Login failed');
    }
  }

  return (
    <div className="space-y-6">
      <Logo />
      <div className="space-y-1 text-center">
        <h1 className="text-2xl font-bold text-foreground">Welcome Back</h1>
        <p className="text-sm text-muted-foreground">
          Sign in to your 3A Studio dashboard
        </p>
      </div>

      <div className="space-y-3">
        <GitHubButton />
        <GoogleButton />
      </div>
      <AuthDivider />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <AuthInput
          icon={<Mail className="h-4 w-4" />}
          placeholder="Username or email"
          error={errors.email?.message}
          {...register("email")}
        />
        <AuthInput
          icon={<Lock className="h-4 w-4" />}
          rightIcon={
            <button type="button" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          }
          type={showPassword ? "text" : "password"}
          placeholder="Password"
          error={errors.password?.message}
          {...register("password")}
        />
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input type="checkbox" className="rounded border-border" />
            Remember me
          </label>
          <Link href="/forgot-password" className="text-sm text-brand-accent hover:underline">
            Forgot password?
          </Link>
        </div>
        <AuthButton type="submit" loading={isSubmitting}>
          Sign In
        </AuthButton>
      </form>
      <p className="text-center text-xs text-muted-foreground">
        Demo: admin / admin
      </p>
      <button
        type="button"
        onClick={quickLogin}
        className="w-full rounded-lg border border-border bg-muted py-2 text-sm text-muted-foreground transition-colors hover:border-brand-accent hover:text-foreground"
      >
        Quick Login as Admin
      </button>
      <AuthFooter mode="login" />
    </div>
  );
}
