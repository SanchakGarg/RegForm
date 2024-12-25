import HeadingWithUnderline from "@/app/components/dashboard/headingWithUnderline";
import { eventSchema } from "@/app/utils/forms/schema";
import { generateDefaultValues } from "@/app/utils/forms/generateDefaultValues";
export default function SignUpPage() {
  console.log(generateDefaultValues(eventSchema.subEvents.Basketball.specificPages[0].fields));

  return (
    <div className="h-screen">
       <HeadingWithUnderline 
                 text="sport"
                 desktopSize="md:text-6xl"
                 mobileSize="text-3xl sm:text-2xl"
               />
        </div>
  );
}
