
import Link from "next/link";
import { Login } from "../../components/authentication/Login";

export default function LoginPage() {
  return (
   <div className="items-center sm:items-center justify-items-center">
        <Login />
        <p className="pt-5">
        Don&apos;t have an account? {" "}
          <Link href="/SignUp/" className="text-blue-600 hover:underline">
            Sign Up now
          </Link>
        </p>
    </div>
  );
}
