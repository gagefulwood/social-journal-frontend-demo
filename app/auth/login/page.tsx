import { AuthLayout } from "@/components/layout/AuthLayout";
import LoginForm from "@/components/auth/LoginForm";
import Link from "next/link";

export default function LoginPage() {
  return (
    <AuthLayout>
      <h2 className="text-2xl font-bold mb-6 text-center text-black">
        Login
      </h2>
      <LoginForm />

      <p className="text-center mt-6 text-gray-600">
        Don&apos;t have an account?{" "}
        <Link
          href="/auth/register"
          className="text-blue-600 hover:text-blue-800 font-medium underline decoration-2 underline-offset-2 hover:decoration-blue-800 transition-colors"
        >
          Register here
        </Link>
      </p>

      <p className="text-center mt-2 text-gray-600">
        <Link
          href="/auth/reset/"
          className="text-red-600 hover:text-blue-800 font-medium underline decoration-2 underline-offset-2 hover:decoration-blue-800 transition-colors"
        >
          Forgot your password?
        </Link>
      </p>
    </AuthLayout>
  );
}
