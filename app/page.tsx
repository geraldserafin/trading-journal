import { getUser } from "@/lib/auth";

export default async function Home() {
  const user = await getUser();

  if (!user) {
    return <h1>You are not logged in</h1>;
  }

  return <h1>{user.email}</h1>;
}
