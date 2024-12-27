"use client";
import HeadingWithUnderline from "@/app/components/dashboard/headingWithUnderline";
import { eventSchema, sports } from "@/app/utils/forms/schema";
import { generateDefaultValues } from "@/app/utils/forms/generateDefaultValues";
import RenderForm from "@/app/components/dashboard/form/DynamicForm";
import { useSearchParams } from "next/navigation"; // Import the hook
import { decrypt } from "@/app/utils/encryption";
import { useEffect, useState } from "react";
import { post } from "@/app/utils/PostGetData";

const getAuthToken = (): string | null => {
  const cookies = document.cookie.split("; ")
  const authToken = cookies.find((cookie) => cookie.startsWith("authToken="))
  return authToken ? authToken.split("=")[1] : null
}
export default function form() {
  // Get URL search parameters
  const [loading, setLoading] = useState(true)

  const [data, setData] = useState<Record<string,any>>({})
const [title,setTitle] = useState<string>("");
  const searchParams = useSearchParams();
  const paramI = decrypt(searchParams.get("i") || ""); // Replace "i" with the name of your query parameter
  const id = paramI.id

  useEffect(() => {
    const getForms = async () => {
      try {
        const token = getAuthToken()
        if (!token) {
          console.error("Auth token not found")
          setLoading(false)
          return
        }

        const response = await post<{ success: boolean; data?: Record<string,any> }>(
          `/api/form/getForm`,
          {
            formId:id,
            cookies: token,
          }
        )
        console.log(response)

        if (response.data?.success && response.data?.data) {
          setData(response.data.data.fields)
          setTitle(response.data.data.title)
        } else {
          console.error("Failed to retrieve form data or no data returned.")
        }
      } catch (error) {
        console.error("Error fetching form data:", error)
      } finally {
        setLoading(false)
      }
    }

    getForms()
  }, [])
  return (
    <div className="w-full mt-6 pb-8 pr-5">
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (<div className="h-screen w-full">
        <HeadingWithUnderline
          text={sports[title]}
          desktopSize="md:text-6xl"
          mobileSize="text-3xl sm:text-2xl"
        />
         <RenderForm
            schema={eventSchema.subEvents[title].specificPages[0].fields}
            draftSchema={eventSchema.subEvents[title].specificPages[0].draft}
            meta={eventSchema.subEvents[title].specificPages[0].meta}
            defaultvalues={data}
          /> 
      </div>)}
    </div>
  );
}
