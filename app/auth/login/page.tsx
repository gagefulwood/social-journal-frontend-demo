import { AuthLayout } from "@/components/layout/AuthLayout";
import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <AuthLayout>
      <h2 className="text-2xl font-bold mb-6 text-center text-black">
        Login
      </h2>
      <LoginForm />
    </AuthLayout>
  );
}