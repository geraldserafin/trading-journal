import { LogoutButton } from "@/domain/auth/ui/logout-button";
import { authorizeRequest } from "@/lib/auth";

export default async function Home() {
  const { user } = await authorizeRequest();

  return (
    <>
      <h1>{user.email}</h1>
      <LogoutButton />
    </>
  );
}
