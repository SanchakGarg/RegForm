import Link from "next/link";
import { SignUp } from "../components/authentication/SignUp";

export default function SignUpPage() {
  return (
    <div className=" items-center sm:items-center justify-items-center">
        <SignUp />
        <p className="pt-5">
          Already have an account? {" "}
          <Link href="/SignIn" className="text-blue-600 hover:underline">
            Sign In
          </Link>
        </p>
        </div>
  );
}
