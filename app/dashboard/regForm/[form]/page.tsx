"use client"
import HeadingWithUnderline from "@/app/components/dashboard/headingWithUnderline";
import { eventSchema } from "@/app/utils/forms/schema";
import { generateDefaultValues } from "@/app/utils/forms/generateDefaultValues";
import RenderForm from "@/app/components/dashboard/form/DynamicForm";
export default function SignUpPage() {
console.log(generateDefaultValues(eventSchema.subEvents.Basketball.specificPages[0].fields));
  return (
    <div className="h-screen w-full">
       <HeadingWithUnderline 
                 text="sport"
                 desktopSize="md:text-6xl"
                 mobileSize="text-3xl sm:text-2xl"
               />
                     <RenderForm schema={eventSchema.subEvents.Football.specificPages[0].fields} draftSchema={eventSchema.subEvents.Football.specificPages[0].draft} meta={eventSchema.subEvents.Football.specificPages[0].meta} />  {/* Calling PopoverForm */}

        </div>
  );
}
