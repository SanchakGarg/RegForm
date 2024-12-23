"use client"
import HeadingWithUnderline from "@/app/components/dashboard/headingWithUnderline";
import { PopoverForm } from "@/app/components/dashboard/form/PopoverForm";  // Import the PopoverForm component
import RenderForm from "@/app/components/dashboard/form/DynamicForm";
import { coachFields, eventSchema, sportField } from "@/app/utils/forms/schema";

export default function regForm() {
  return (
    <div className="h-screen w-full relative">
      {/* Heading */}
      <div className="w-full">
        <HeadingWithUnderline
          text="Registration Forms"
          desktopSize="md:text-6xl"
          mobileSize="text-3xl sm:text-2xl"
        />
      </div>
      

      {/* Button and Alert Dialog */}
      <div className="flex justify-end">
        <div className="pr-5">
          <PopoverForm />  {/* Calling PopoverForm */}
        </div>
        

      </div>
      <RenderForm schema={eventSchema.commonPages[0].fields}></RenderForm>
    </div>
  );
}
