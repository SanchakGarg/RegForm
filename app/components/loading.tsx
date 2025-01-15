import Image from "next/image";

// app/loading.tsx
const LoadingScreen = () => {
    return (
        <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8  sm:p-20 font-[family-name:var(--font-geist-sans)]">
            <main className="flex flex-col gap-8 row-start-2 items-center sm:items-center justify-items-center">
                <Image
                    className=""
                    src="/logo2.png"
                    alt="Next.js logo"
                    width={180}
                    height={38}
                    priority
                />
                <div className="flex items-center justify-center h-64">
                    <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
                </div>
            </main>
        </div>
    );
};

export default LoadingScreen;
