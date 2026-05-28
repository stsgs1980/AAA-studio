"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Lock, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { newPasswordSchema, type NewPasswordFormData } from "@/features/auth/lib/new-password-schema";
import { AuthInput } from "@/features/auth/components/auth-input";
import { AuthButton } from "@/features/auth/components/auth-button";
import { PasswordStrength } from "@/features/auth/components/password-strength";
import { Logo } from "@/features/auth/components/logo";

export default function ResetPasswordPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<NewPasswordFormData>({
    resolver: zodResolver(newPasswordSchema),
  });
  const password = watch("password");

  async function onSubmit(_data: NewPasswordFormData) {
    await new Promise((r) => setTimeout(r, 1000));
    toast.success("Password reset successfully");
  }

  return (
    <div className="space-y-6">
      <Link href="/login" className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary">
        <ArrowLeft className="h-4 w-4" /> Back to Sign In
      </Link>
      <Logo />
      <div className="space-y-1 text-center">
        <h1 className="text-2xl font-bold text-text-primary">Set New Password</h1>
        <p className="text-sm text-text-secondary">
          Create a new password for your account
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <AuthInput
            icon={<Lock className="h-4 w-4" />}
            rightIcon={
              <button type="button" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
            type={showPassword ? "text" : "password"}
            placeholder="New Password"
            error={errors.password?.message}
            {...register("password")}
          />
          <PasswordStrength password={password} className="mt-2" />
        </div>
        <AuthInput
          icon={<Lock className="h-4 w-4" />}
          rightIcon={
            <button type="button" onClick={() => setShowConfirm(!showConfirm)}>
              {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          }
          type={showConfirm ? "text" : "password"}
          placeholder="Confirm New Password"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />
        <AuthButton type="submit" loading={isSubmitting}>
          Reset Password
        </AuthButton>
      </form>
    </div>
  );
}
