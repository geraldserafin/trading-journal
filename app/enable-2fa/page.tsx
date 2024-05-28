import ValidateOTPForm from "@/domain/auth/ui/validate-otp-form";
import { authorizeRequest } from "@/lib/auth";
import { users } from "@/models/users";
import { encodeHex } from "oslo/encoding";
import { createTOTPKeyURI } from "oslo/otp";

export default async function Page() {
  const { user } = await authorizeRequest({
    onSessionPending: (data) => data,
  });

  if (user.twoFactorEnabled) {
    return <h1>2fa already enabled</h1>;
  }

  const twoFactorSecret = crypto.getRandomValues(new Uint8Array(20));

  await users().update({ id: user.id }, { twoFactorSecret: encodeHex(twoFactorSecret) });

  const link = createTOTPKeyURI("trading-journal", user.email, twoFactorSecret);
  return (
    <div className="w-full min-h-screen grid items-center">
      <div className="flex items-center justify-center p-4 py-12">
        <ValidateOTPForm link={link} />
      </div>
    </div>
  );
}
