import LoginForm from "@/domain/auth/ui/login-form";

export default function Page() {
  return (
    <div className="w-full min-h-screen lg:grid lg:grid-cols-2 ">
      <div className="flex items-center justify-center p-4 py-12">
        <LoginForm />
      </div>
      <div className="hidden bg-muted lg:block"></div>
    </div>
  );
}
