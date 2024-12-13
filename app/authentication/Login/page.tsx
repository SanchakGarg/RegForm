/* eslint-disable @typescript-eslint/no-unused-vars */

import Link from "next/link";
import { Login, SignUp } from "../../components/authentication/login_SignUpCard";

export default function LoginPage() {
  return (
   <div>
        <Login />
        <p>
        Don&apos;t have an account? {" "}
          <Link href="/authentication/SignUp/" className="text-blue-600 hover:underline">
            Sign Up now
          </Link>
        </p>
    </div>
  );
}
