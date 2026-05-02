import { AuthLayout } from "@/components/layout/AuthLayout";

export default function MFASetupPage() {
  return (
    <AuthLayout>
      <h2 className="mb-6 text-center text-2xl font-bold text-black">
        MFA Setup
      </h2>
      <p className="text-center text-sm text-gray-600">
        MFA setup coming in auth rebuild.
      </p>
    </AuthLayout>
  );
}
