import { AuthLayout } from "@/components/layout/AuthLayout";
import { MFASetupCard } from "@/components/auth/MFASetupCard";

export default function MFASetupPage() {
  return (
    <AuthLayout>
      <h2 className="mb-6 text-center text-2xl font-bold text-black">
        MFA Setup
      </h2>
      <MFASetupCard />
    </AuthLayout>
  );
}
