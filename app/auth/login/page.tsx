import { AuthLayout } from "@/components/layout/AuthLayout";
import LoginForm from "@/components/auth/LoginForm";
import Link from "next/link";

export default function LoginPage() {
  return (
    <AuthLayout>
      <h2 className="text-2xl font-bold mb-6 text-center text-black">Login</h2>
      <LoginForm />

      <p className="text-center mt-6 text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link
          href="/auth/register"
          className="text-primary-strong hover:text-primary font-medium underline decoration-2 underline-offset-2 hover:decoration-primary transition-colors"
        >
          Register here
        </Link>
      </p>

      <p className="text-center mt-2 text-muted-foreground">
        <Link
          href="/auth/reset/"
          className="text-primary-strong hover:text-primary font-medium underline decoration-2 underline-offset-2 hover:decoration-primary transition-colors"
        >
          Forgot your password?
        </Link>
      </p>
    </AuthLayout>
  );
}
