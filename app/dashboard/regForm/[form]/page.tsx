"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

import HeadingWithUnderline from "@/app/components/dashboard/headingWithUnderline";
import { eventSchema, sports, SportsGuidlines } from "@/app/utils/forms/schema";
import RenderForm from "@/app/components/dashboard/form/DynamicForm";
import { useSearchParams } from "next/navigation";
import { decrypt } from "@/app/utils/encryption";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { post } from "@/app/utils/PostGetData";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
const getAuthToken = (): string | null => {
  const cookies = document.cookie.split("; ");
  const authToken = cookies.find((cookie) => cookie.startsWith("authToken="));
  return authToken ? authToken.split("=")[1] : null;
};
function typecastDatesInPlayerFields(playerFields: Record<string, any>[]) {
  playerFields.forEach((obj) => {
    for (const key in obj) {
      if (typeof obj[key] === "string" && !isNaN(Date.parse(obj[key]))) {
        obj[key] = new Date(obj[key]); // Convert string to Date
      }
    }
  });
}

export default function Form() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<Record<string, unknown>>({});
  const [title, setTitle] = useState<string>("");
  const [markdownContent, setMarkdownContent] = useState<string>("");
  const searchParams = useSearchParams();
  const eparam = searchParams.get("i") || ""
  const paramI = decrypt(eparam);
  const formId = paramI.id;

  useEffect(() => {
    const getForms = async () => {
      try {
        const token = getAuthToken();
        if (!token) {
          console.error("Auth token not found");
          setLoading(false);
          return;
        }

        const response = await post<{ success: boolean; data?: Record<string, any> }>(`/api/form/getForm`, {
          formId,
          cookies: token,
        });

        if (response.data?.success && response.data?.data) {
try{
  typecastDatesInPlayerFields(response.data.data.fields.playerFields)

}catch(e){
}
          setData(response.data.data.fields);
          setTitle(response.data.data.title);
        } else {
          console.error("Failed to retrieve form data or no data returned.");
        }
      } catch (error) {
        console.error("Error fetching form data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (formId) getForms();
  }, [formId]);


  useEffect(() => {
    const fetchMarkdown = async () => {
      try {
        const response = await fetch(`/markdown/${SportsGuidlines[title]}.md`);
        if (response.ok) {
          const text = await response.text();
          setMarkdownContent(text);
        } else {
          console.error("Markdown file not found:", `/markdown/${title}.md`);
        }
      } catch (error) {
        console.error("Error fetching markdown file:", error);
      }
    };

    if (title) fetchMarkdown();
  }, [title]);
  return (
    <div className="w-full mt-6 pb-8 pr-5">
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="h-screen w-full">
          <HeadingWithUnderline
            text={sports[title]}
            desktopSize="md:text-6xl"
            mobileSize="text-5xl sm:text-2xl"
          />
          <Drawer>
            <DrawerTrigger asChild>
              <Button variant="link" className="text-blue-500 underline">
                View Sport Guidelines
              </Button>
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>Guidlines and rules for {sports[title]}</DrawerTitle>
                <DrawerDescription></DrawerDescription>
              </DrawerHeader>
              <div className="px-4 py-2 max-h-[60vh] overflow-y-auto">
                <ReactMarkdown>{markdownContent}</ReactMarkdown>
              </div>
              <DrawerFooter>
                <DrawerClose asChild>
                  <Button >Close</Button>
                </DrawerClose>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
          <RenderForm
            schema={eventSchema.subEvents[title].specificPages[0].fields}
            draftSchema={eventSchema.subEvents[title].specificPages[0].draft}
            meta={eventSchema.subEvents[title].specificPages[0].meta}
            defaultvalues={data}
            formId={formId as string}
          />
        </div>
      )}
    </div>
  );
}
