import RegisterForm from "@/domain/auth/ui/register-form";

export default function Page() {
  return (
    <div className="w-full min-h-screen lg:grid lg:grid-cols-2 ">
      <div className="flex items-center justify-center p-4 py-12">
        <RegisterForm />
      </div>
      <div className="hidden bg-muted lg:block"></div>
    </div>
  );
}
