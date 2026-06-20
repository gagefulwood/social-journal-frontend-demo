"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { authApi } from "@/lib/api/authApi";
import type { ApiError, RegisterPayload } from "@/types/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const registerSchema = z
  .object({
    first_name: z.string().min(1, "First name is required"),
    last_name: z.string().min(1, "Last name is required"),
    username: z.string().min(1, "Username is required"),
    email: z.string().email("Enter a valid email address"),
    phone_number: z.string().optional(),
    password: z.string().min(8, "Password must be at least 8 characters"),
    password_confirm: z.string().min(1, "Confirm your password"),
  })
  .refine((data) => data.password === data.password_confirm, {
    message: "Passwords do not match",
    path: ["password_confirm"],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

const fieldNames: Array<keyof RegisterFormValues> = [
  "first_name",
  "last_name",
  "username",
  "email",
  "phone_number",
  "password",
  "password_confirm",
];

function passwordStrength(password: string) {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score;
}

export default function RegisterForm() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      username: "",
      email: "",
      phone_number: "",
      password: "",
      password_confirm: "",
    },
  });

  const password = useWatch({ control, name: "password" }) ?? "";
  const strength = useMemo(() => passwordStrength(password), [password]);

  const onSubmit = async (values: RegisterFormValues) => {
    const payload: RegisterPayload = {
      ...values,
      phone_number: values.phone_number || undefined,
    };

    try {
      await authApi.register(payload);
      toast.success("Account created. You can now log in.");
      router.push("/auth/login");
    } catch (err) {
      const apiError = err as ApiError;

      if (apiError.fieldErrors) {
        for (const fieldName of fieldNames) {
          const fieldError = apiError.fieldErrors[fieldName]?.[0];
          if (fieldError) {
            setError(fieldName, { message: fieldError });
          }
        }
      }

      if (!apiError.fieldErrors) {
        setError("root", {
          message: apiError.message || "Registration failed.",
        });
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      {errors.root?.message && (
        <p className="text-sm text-destructive">{errors.root.message}</p>
      )}

      <div>
        <Label htmlFor="first_name">First Name</Label>
        <Input id="first_name" {...register("first_name")} />
        {errors.first_name?.message && (
          <p className="text-sm text-destructive">
            {errors.first_name.message}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="last_name">Last Name</Label>
        <Input id="last_name" {...register("last_name")} />
        {errors.last_name?.message && (
          <p className="text-sm text-destructive">{errors.last_name.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="username">Username</Label>
        <Input id="username" {...register("username")} />
        {errors.username?.message && (
          <p className="text-sm text-destructive">{errors.username.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" {...register("email")} />
        {errors.email?.message && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="phone_number">Phone Number (optional)</Label>
        <Input id="phone_number" {...register("phone_number")} />
        {errors.phone_number?.message && (
          <p className="text-sm text-destructive">
            {errors.phone_number.message}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" {...register("password")} />

        <div className="mt-2 h-2 w-full rounded bg-muted">
          <div
            className={`h-2 rounded ${
              strength <= 1
                ? "bg-destructive"
                : strength <= 3
                  ? "bg-warning"
                  : "bg-success"
            }`}
            style={{ width: `${(strength / 4) * 100}%` }}
          />
        </div>

        {errors.password?.message && (
          <p className="text-sm text-destructive">{errors.password.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="password_confirm">Confirm Password</Label>
        <Input
          id="password_confirm"
          type="password"
          {...register("password_confirm")}
        />
        {errors.password_confirm?.message && (
          <p className="text-sm text-destructive">
            {errors.password_confirm.message}
          </p>
        )}
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Registering..." : "Register"}
      </Button>
    </form>
  );
}
