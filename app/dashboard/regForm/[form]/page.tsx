"use client";
import HeadingWithUnderline from "@/app/components/dashboard/headingWithUnderline";
import { eventSchema } from "@/app/utils/forms/schema";
import { generateDefaultValues } from "@/app/utils/forms/generateDefaultValues";
import RenderForm from "@/app/components/dashboard/form/DynamicForm";
import { useSearchParams } from "next/navigation"; // Import the hook
import { decrypt } from "@/app/utils/encryption";

export default function SignUpPage() {
  // Get URL search parameters
  const searchParams = useSearchParams();
  const paramI = decrypt(searchParams.get("i") || ""); // Replace "i" with the name of your query parameter

  console.log(); // Log the parameter to see its value

  return (
    <div className="h-screen w-full">
      <HeadingWithUnderline
        text={paramI.title}
        desktopSize="md:text-6xl"
        mobileSize="text-3xl sm:text-2xl"
      />
      <RenderForm
        schema={eventSchema.subEvents.Shooting.specificPages[0].fields}
        draftSchema={eventSchema.subEvents.Shooting.specificPages[0].draft}
        meta={eventSchema.subEvents.Shooting.specificPages[0].meta}
        defaultvalues={{}}
      />
    </div>
  );
}
