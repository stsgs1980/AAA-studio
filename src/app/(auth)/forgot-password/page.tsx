"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { forgotPasswordSchema, type ForgotPasswordFormData } from "@/features/auth/lib/forgot-password-schema";
import { AuthInput } from "@/features/auth/components/auth-input";
import { AuthButton } from "@/features/auth/components/auth-button";
import { Logo } from "@/features/auth/components/logo";

export default function ForgotPasswordPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  async function onSubmit(_data: ForgotPasswordFormData) {
    await new Promise((r) => setTimeout(r, 1000));
    toast.success("Reset link sent to your email");
  }

  return (
    <div className="space-y-6">
      <Link href="/login" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to Sign In
      </Link>
      <Logo />
      <div className="space-y-1 text-center">
        <h1 className="text-2xl font-bold text-foreground">Reset Password</h1>
        <p className="text-sm text-muted-foreground">
          Enter your email and we&apos;ll send you a reset link
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <AuthInput
          icon={<Mail className="h-4 w-4" />}
          placeholder="Email address"
          error={errors.email?.message}
          {...register("email")}
        />
        <AuthButton type="submit" loading={isSubmitting}>
          Send Reset Link
        </AuthButton>
      </form>
    </div>
  );
}
