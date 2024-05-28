import { LogoutButton } from "@/domain/auth/ui/logout-button";
import ValidateOTPForm from "@/domain/auth/ui/validate-otp-form";

export default function Page() {
  return (
    <div className="w-full min-h-screen grid items-center">
      <div className="grid gap-4 justify-center p-4 py-12">
        <ValidateOTPForm />
        <LogoutButton variant="link" className="underline w-full" />
      </div>
    </div>
  );
}
