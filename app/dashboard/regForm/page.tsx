import HeadingWithUnderline from "@/app/components/dashboard/headingWithUnderline";

export default function regForm() { 
    return (
      <div className="h-screen relative">
        <div>
        <HeadingWithUnderline 
          text="Registration Forms"
          desktopSize="md:text-6xl"
          mobileSize="text-3xl sm:text-2xl"
        />
        </div>
        
      </div>
    );
}
