import { authorizeRequest } from "@/lib/auth";
import { redirect } from "next/navigation";

type RootLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

export default async function Layout({ children }: RootLayoutProps) {
  const session = await authorizeRequest({ onUnauthorized: () => null });

  if (session) {
    redirect("/");
  }

  return children;
}
