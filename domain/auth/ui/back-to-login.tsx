import Link from "next/link";
import React from "react";

export function BackToLogin(props: { children: React.ReactNode } | undefined) {
  return (
    <Link className="text-sm underline" href="/login">
      {props?.children ?? "Back to login"}
    </Link>
  );
}
