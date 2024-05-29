"use client";

import { Button, ButtonProps } from "@/ui/button";
import { useAction } from "next-safe-action/hooks";
import { logout } from "../actions";

export function LogoutButton(props: ButtonProps) {
  const { execute, status } = useAction(logout);

  return (
    <form action={execute}>
      <Button type="submit" disabled={status === "executing"} {...props}>
        Sign out
      </Button>
    </form>
  );
}
