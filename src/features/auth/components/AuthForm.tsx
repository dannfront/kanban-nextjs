"use client";

import { useForm } from "react-hook-form";
import type { Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { loginSchema, signUpSchema } from "@/features/auth/schemas";
import type { LoginFormData, SignUpFormData } from "@/features/auth/schemas";
import { signIn, signUp } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useNotify, messages } from "@/lib/notifications";

type AuthFormData = LoginFormData & Partial<SignUpFormData>;

interface AuthFormProps {
  mode: "login" | "signup";
}

export function AuthForm({ mode }: AuthFormProps) {
  const isSignUp = mode === "signup";
  const schema = isSignUp ? signUpSchema : loginSchema;
  const resolver = zodResolver(schema) as Resolver<AuthFormData>;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AuthFormData>({
    resolver,
    defaultValues: {
      email: "",
      password: "",
      ...(isSignUp && { name: "", confirmPassword: "" }),
    },
  });
  const router = useRouter();
  const notify = useNotify();

  const onSubmit = async (dataForm: AuthFormData) => {
    const { name, email, password, confirmPassword } = dataForm;
    if (mode === "signup") {
      const {} = await signUp.email(
        {
          email,
          name: name!,
          password,
          callbackURL: "/",
        },
        {
          onSuccess: (ctx) => {
            router.push("/");
          },
          onError: (_ctx) => {
            notify.error(messages.auth.signup.error);
          },
        },
      );
    }

    const { data, error } = await signIn.email(
      {
        email,
        password,
        callbackURL: "/",
        rememberMe: false,
      },
      {
        onSuccess: (ctx) => {
          router.push("/");
        },
        onError: (_ctx) => {
          notify.error(messages.auth.login.error);
        },
      },
    );
  };

  const heading = isSignUp ? "Create Account" : "Welcome Back";
  const submitText = isSignUp ? "Sign Up" : "Log In";
  const switchText = isSignUp
    ? "Already have an account?"
    : "Don't have an account?";
  const switchLink = isSignUp ? "/auth/login" : "/auth/sign-up";
  const switchLabel = isSignUp ? "Log In" : "Sign Up";

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
            {heading}
          </h1>
          <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
            {isSignUp
              ? "Sign up to start managing your tasks"
              : "Log in to your account"}
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-5 rounded-lg border border-[var(--color-lines-dark)]/25 bg-[var(--color-bg-modal)] p-8 shadow-lg"
          noValidate
        >
          {isSignUp && (
            <Input
              label="Name"
              error={errors.name?.message}
              placeholder="Your name"
              autoComplete="name"
              {...register("name")}
            />
          )}

          <Input
            label="Email"
            type="email"
            error={errors.email?.message}
            placeholder="you@example.com"
            autoComplete="email"
            {...register("email")}
          />

          <Input
            label="Password"
            type="password"
            error={errors.password?.message}
            placeholder={isSignUp ? "At least 8 characters" : "Your password"}
            autoComplete={isSignUp ? "new-password" : "current-password"}
            {...register("password")}
          />

          {isSignUp && (
            <Input
              label="Confirm Password"
              type="password"
              error={errors.confirmPassword?.message}
              placeholder="Repeat your password"
              autoComplete="new-password"
              {...register("confirmPassword")}
            />
          )}

          <Button type="submit" variant="primary" size="lg" className="w-full">
            {submitText}
          </Button>
        </form>

        <p className="text-center text-sm text-[var(--color-text-secondary)]">
          {switchText}{" "}
          <Link
            href={switchLink}
            className="font-bold text-[var(--color-main-purple)] hover:text-[var(--color-main-purple-hover)]"
          >
            {switchLabel}
          </Link>
        </p>
      </div>
    </div>
  );
}
