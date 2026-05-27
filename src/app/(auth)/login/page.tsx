"use client";

import { useState } from "react";
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

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(_data: LoginFormData) {
    await new Promise((r) => setTimeout(r, 1000));
    toast.success("Signed in successfully");
  }

  return (
    <div className="space-y-6">
      <Logo />
      <div className="space-y-1 text-center">
        <h1 className="text-2xl font-bold text-text-primary">Welcome Back</h1>
        <p className="text-sm text-text-secondary">
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
          placeholder="Email address"
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
          <label className="flex items-center gap-2 text-sm text-text-secondary">
            <input type="checkbox" className="rounded border-midnight-border" />
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
      <AuthFooter mode="login" />
    </div>
  );
}
