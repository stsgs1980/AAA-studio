"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Mail, Lock, User } from "lucide-react";
import { toast } from "sonner";
import { signupSchema, type SignupFormData } from "@/features/auth/lib/signup-schema";
import { AuthInput } from "@/features/auth/components/auth-input";
import { AuthButton } from "@/features/auth/components/auth-button";
import { AuthDivider } from "@/features/auth/components/auth-divider";
import { AuthFooter } from "@/features/auth/components/auth-footer";
import { GitHubButton } from "@/features/auth/components/github-button";
import { GoogleButton } from "@/features/auth/components/google-button";
import { PasswordStrength } from "@/features/auth/components/password-strength";
import { RoleSelector } from "@/features/auth/components/role-selector";
import { Logo } from "@/features/auth/components/logo";

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: { role: "operator" },
  });
  const password = watch("password");

  async function onSubmit(_data: SignupFormData) {
    await new Promise((r) => setTimeout(r, 1000));
    toast.success("Account created successfully");
  }

  return (
    <div className="space-y-6">
      <Logo />
      <div className="space-y-1 text-center">
        <h1 className="text-2xl font-bold text-foreground">Create Account</h1>
        <p className="text-sm text-muted-foreground">Get started with 3A Studio</p>
      </div>

      <div className="space-y-3">
        <GitHubButton />
        <GoogleButton />
      </div>
      <AuthDivider />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <AuthInput
          icon={<User className="h-4 w-4" />}
          placeholder="Full Name"
          error={errors.name?.message}
          {...register("name")}
        />
        <AuthInput
          icon={<Mail className="h-4 w-4" />}
          placeholder="Email address"
          error={errors.email?.message}
          {...register("email")}
        />
        <div>
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
          placeholder="Confirm Password"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />
        <div>
          <label className="mb-1.5 block text-sm text-muted-foreground">Role</label>
          <Controller
            control={control}
            name="role"
            render={({ field }) => (
              <RoleSelector value={field.value} onChange={field.onChange} />
            )}
          />
          {errors.role && (
            <p className="mt-1 text-xs text-brand-red">{errors.role.message}</p>
          )}
        </div>
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <input type="checkbox" {...register("agreeTerms")} className="rounded border-border" />
          I agree to the{" "}
          <a href="#" className="text-brand-accent hover:underline">Terms of Service</a>
        </label>
        {errors.agreeTerms && (
          <p className="text-xs text-brand-red">{errors.agreeTerms.message}</p>
        )}
        <AuthButton type="submit" loading={isSubmitting}>Create Account</AuthButton>
      </form>
      <AuthFooter mode="signup" />
    </div>
  );
}
