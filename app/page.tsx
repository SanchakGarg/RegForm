/* eslint-disable @typescript-eslint/no-unused-vars */

import Image from "next/image";
import Link from "next/link";
import { Login } from "./components/authentication/loginCard";

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-center justify-items-center">
        <Image
          className="dark:invert"
          src="/logo2.png"
          alt="Next.js logo"
          width={180}
          height={38}
          priority
        />
        <Login />
        <p>
          Don&apos;t have an account?{" "}
          <Link href="/authentication/SignUp" className="text-blue-600 hover:underline">
            Sign Up now
          </Link>
        </p>
      </main>
    </div>
  );
}
