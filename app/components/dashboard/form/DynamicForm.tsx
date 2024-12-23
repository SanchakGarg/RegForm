"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z, ZodObject, ZodRawShape, ZodString, ZodNumber, ZodBoolean, ZodArray, ZodTypeAny } from "zod"

import { toast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

// Function to generate default values for a Zod schema
const generateDefaultValues = (schema: ZodObject<ZodRawShape>): Record<string, any> => {
  const defaultValues: Record<string, any> = {}

  // Iterate through each field in the schema
  for (const [key, value] of Object.entries(schema.shape)) {
    if (value instanceof ZodObject) {
      // If the field is a nested Zod object, recursively generate default values for it
      defaultValues[key] = generateDefaultValues(value)
    } else if (value instanceof ZodString) {
      // If the field is a string, set an empty string as the default
      defaultValues[key] = ''
    } else if (value instanceof ZodNumber) {
      // If the field is a number, set 0 as the default
      defaultValues[key] = 0
    } else if (value instanceof ZodBoolean) {
      // If the field is a boolean, set false as the default
      defaultValues[key] = false
    } else if (value instanceof ZodArray) {
      // If the field is an array, set an empty array as the default
      defaultValues[key] = []
    } else {
      // For other types, set null as the default
      defaultValues[key] = null
    }
  }

  return defaultValues
}

const RenderForm: React.FC<{ schema: ZodObject<ZodRawShape> }> = ({ schema }) => {
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: generateDefaultValues(schema),
  })

  function onSubmit(data: z.infer<typeof schema>) {
    toast({
      title: "You submitted the following values:",
      description: (
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
    })
  }

  // Render form fields based on the provided schema
  return (
    <div>
      {/* Add your form rendering logic here */}
    </div>
  )
}

export default RenderForm
