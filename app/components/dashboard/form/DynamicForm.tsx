"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z, ZodObject, ZodRawShape, ZodString, ZodNumber, ZodBoolean, ZodArray, ZodDate,ZodEnum,ZodEffects } from "zod"
import { generateDefaultValues } from "@/app/utils/forms/generateDefaultValues"
import { toast } from "@/hooks/use-toast"
import { useState } from "react";
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
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
interface FormSelectProps {
  name: string;
  options: { value: string; label: string }[]; // Array of options with value and label
}

const RenderForm: React.FC<{ schema: ZodObject<ZodRawShape> }> = ({ schema }) => {
  const [isSubmitting, setIsSubmitting] = useState(false); 
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: generateDefaultValues(schema),
  })

  async function onSubmit(data: z.infer<typeof schema>) {
    setIsSubmitting(true); // Set loading state to true
    try {
      console.log(data);
      toast({
        title: "Submission Successful",
        description: "Your form data has been submitted.",
      });
    } catch (error) {
      console.error("Submission error:", error);
    } finally {
      setIsSubmitting(false); // Reset loading state
    }
  }

  
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-




  const FormInput = ({ name }: { name: string; }) => (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{name}</FormLabel>
          <FormControl>
            <Input placeholder="shadcn" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )  // Render form fields based on the provided schema


  const FormDate = ({name}:{name:string;}) => (
    <FormField
          control={form.control}
          name={name}
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>{name}</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-[240px] pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) =>
                      date > new Date() || date < new Date("1900-01-01")
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
  )

  const FormSelect = ({ name, options }: FormSelectProps) => (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{name}</FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );

  const renderFormFields = (schema: ZodObject<ZodRawShape>, path = "") => {
    return Object.entries(schema.shape).map(([key, value]) => {
      const fieldPath = path ? `${path}.${key}` : key; // Generate the full path for the field
      if (value instanceof ZodEffects) {
        const baseSchema = value._def.schema;
  
        // Process based on the base type
        if (baseSchema instanceof ZodString) {
          return <FormInput key={fieldPath} name={fieldPath} />;
        } else if (baseSchema instanceof ZodDate) {
          return <FormDate key={fieldPath} name={fieldPath} />;
        }
      }
      else if (value instanceof ZodString) {
        return <FormInput key={fieldPath} name={fieldPath} />;
      } else if (value instanceof ZodDate) {
        return <FormDate key={fieldPath} name={fieldPath} />;
      } else if (value instanceof ZodEnum) {
        const options = (value as ZodEnum<[string, ...string[]]>)._def.values.map((option) => ({
          value: option,
          label: option,
        }));
        return <FormSelect key={fieldPath} name={fieldPath} options={options} />;
      } else if (value instanceof ZodObject) {
        // For nested Zod objects, recursively call renderFormFields
        return (
          <div key={fieldPath} className="nested-form">
            <h3>{key}</h3>
            {renderFormFields(value, fieldPath)} {/* Pass the current path */}
          </div>
        );
      }
      // Handle other types if needed
      return null;
    });
  };
  
  

  // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
  return (
    <Form {...form}>
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {renderFormFields(schema)}
      <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <div className="spinner-border animate-spin inline-block w-4 h-4 border-2 rounded-full"></div>
          ) : (
            "Submit"
          )}
        </Button>
    </form>
  </Form>
  )
}

export default RenderForm
