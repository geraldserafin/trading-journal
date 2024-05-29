import VerifyEmailForm from "@/domain/auth/ui/verify-email-form";
import { authorizeRequest } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Page() {
  const result = await authorizeRequest({ onUnverified: () => null });

  if (result) {
    redirect("/");
  }

  return (
    <div className="w-full min-h-screen grid items-center">
      <div className="flex items-center justify-center p-4 py-12">
        <VerifyEmailForm />
      </div>
    </div>
  );
}
