import RequestPasswordResetForm from "@/domain/auth/ui/request-password-reset-form";

export default async function Page() {
  return (
    <div className="w-full min-h-screen grid items-center">
      <div className="flex items-center justify-center p-4 py-12">
        <RequestPasswordResetForm />
      </div>
    </div>
  );
}
