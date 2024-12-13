
import "../globals.css";
import Image from "next/image";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
        <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8  sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-center justify-items-center">
        <Image
          className="dark:invert"
          src="/logo2.png"
          alt="Next.js logo"
          width={180}
          height={38}
          priority
        />
        {children}
      </main>
    </div>
        
     
  );
}
