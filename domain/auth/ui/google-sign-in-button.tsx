import { Button } from "@/ui/button";
import Link from "next/link";

export function GoogleSignInButton() {
  return (
    <Button variant="outline" className="w-full" asChild>
      <Link href="/auth/login/google">Login with Google</Link>
    </Button>
  );
}
