import { z } from "zod";

export const verifySchema = z.object({
  code: z
    .string()
    .length(6, "Verification code must be 6 digits")
    .regex(/^\d{6}$/, "Code must contain only digits"),
});

export type VerifyFormData = z.infer<typeof verifySchema>;
