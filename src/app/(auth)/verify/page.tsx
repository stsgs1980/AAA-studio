"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { verifySchema, type VerifyFormData } from "@/features/auth/lib/verify-schema";
import { OtpInput } from "@/features/auth/components/otp-input";
import { AuthButton } from "@/features/auth/components/auth-button";
import { Logo } from "@/features/auth/components/logo";

export default function VerifyPage() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const { handleSubmit, setValue } = useForm<VerifyFormData>({
    resolver: zodResolver(verifySchema),
    defaultValues: { code: "" },
  });

  function handleCodeChange(val: string) {
    setCode(val);
    setValue("code", val);
  }

  async function onSubmit(_data: VerifyFormData) {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
    toast.success("Verification successful");
  }

  return (
    <div className="space-y-6">
      <Logo />
      <div className="space-y-1 text-center">
        <h1 className="text-2xl font-bold text-text-primary">
          Two-Factor Authentication
        </h1>
        <p className="text-sm text-text-secondary">
          Enter the 6-digit code from your authenticator app
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex justify-center">
          <OtpInput value={code} onChange={handleCodeChange} />
        </div>
        <AuthButton type="submit" loading={loading}>
          Verify
        </AuthButton>
      </form>

      <div className="flex justify-center gap-4 text-sm text-text-secondary">
        <button type="button" onClick={() => toast.info("Code resent")} className="hover:text-text-primary">
          Resend code
        </button>
        <span className="text-text-muted">|</span>
        <button type="button" onClick={() => toast.info("Backup code flow")} className="hover:text-text-primary">
          Use backup code
        </button>
      </div>
    </div>
  );
}
