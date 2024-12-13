/* eslint-disable @typescript-eslint/no-unused-vars */

import Image from "next/image";
import Link from "next/link";
import { SignUp } from "../../components/authentication/login_SignUpCard";

export default function SignUpPage() {
  return (
    <div>
        <SignUp />
        <p>
          Already have an account? {" "}
          <Link href="/authentication/Login" className="text-blue-600 hover:underline">
            Sign In
          </Link>
        </p>
        </div>
  );
}
