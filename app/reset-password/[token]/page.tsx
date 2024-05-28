import PasswordResetForm from "@/domain/auth/ui/password-reset-form";

export default async function Page({ params }: { params: { token: string } }) {
  return (
    <div className="w-full min-h-screen grid items-center">
      <div className="flex items-center justify-center p-4 py-12">
        <PasswordResetForm token={params.token} />
      </div>
    </div>
  );
}
