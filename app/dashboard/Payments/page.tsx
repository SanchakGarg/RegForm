"use client"
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable react-hooks/exhaustive-deps */
import { Separator } from "@/components/ui/separator"
import { format } from "date-fns"
import { Medal } from 'lucide-react';
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useFieldArray } from "react-hook-form"
import { z } from "zod"
import { useState, useEffect } from "react"
import styles from "@/app/styles/toast.module.css"
import { toast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { useRef } from "react";
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
} from "@/components/ui/select";
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
import { Plus, CalendarIcon, X } from 'lucide-react';
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import HeadingWithUnderline from "@/app/components/dashboard/headingWithUnderline"
import { post } from "@/app/utils/PostGetData"
import { sports } from '@/app/utils/forms/schema';
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import { useRouter } from "next/navigation";


const EmptyState = () => (
  <div className="flex flex-col items-center justify-center p-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
    <Medal className="w-16 h-16 text-gray-400 mb-4" />
    <h3 className="text-xl font-bold text-gray-700 mb-2">No Sports Registered</h3>
    <p className="text-gray-500 text-center max-w-md">
      You haven't registered for any sports yet.
    </p>
  </div>
);

export type FormData = {
  createdAt: string;
  sportsPlayers: { sport: string; players: string }[];
  paymentTypes: string[];
  amountInNumbers: number;
  status: string;
};

const StatusCell: React.FC<{ status: string }> = ({ status }) => {
  const isVerified = status === "verified";
  return (
    <div className="flex items-center gap-2">
      <span
        className={`w-2 h-2 rounded-full ${isVerified ? "bg-green-500" : "bg-yellow-500"}`}
      ></span>
      <span className={isVerified ? "text-green-500" : "text-yellow-500"}>{isVerified ? "Verified" : "In Review"}</span>
    </div>
  );
};

const columns: ColumnDef<FormData>[] = [
  {
    accessorKey: "transactionId",
    header: "Transaction ID",
  },
  {
    accessorKey: "paymentTypes",
    header: "Payment Type",
    cell: ({ row }) => row.original.paymentTypes.join(", "),
  },
  {
    accessorKey: "sportsPlayers",
    header: "Sports & Players",
    cell: ({ row }) =>
      row.original.sportsPlayers
        ? row.original.sportsPlayers
          .map((item) => `${sports[item.sport]} - ${item.players} Players`)
          .join(", ")
        : "No sports",
  },
  {
    accessorKey: "createdAt",
    header: "Form Submission",
    cell: ({ row }) => {
      const date = new Date(row.original.createdAt);
      return date.toLocaleString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "numeric",
        minute: "numeric",
      });
    },
  },
  {
    accessorKey: "amountInNumbers",
    header: "Amount",
    cell: ({ row }) => `₹${row.original.amountInNumbers}`,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusCell status={row.original.status} />,
  },
];





const FormSchema = z
  .object({
    needAccommodation: z.boolean(),
    numberOfPlayers: z
      .number({
        required_error: "Number of players is required when accommodation is needed",
        invalid_type_error: "Number of players must be a number",
      })
      .min(1, "Number of players must be at least 1")
      .optional(),
  })
  .refine(
    (data) =>
      data.needAccommodation
        ? data.numberOfPlayers !== undefined
        : data.numberOfPlayers === undefined,
    {
      message: "Number of players must be at least 1",
      path: ["numberOfPlayers"],
    }
  )

  const PaymentFormSchema = z.object({
    paymentTypes: z.array(z.string()).min(1, { message: "At least one payment type is required." }),
    paymentMode: z.string().nonempty({ message: "Payment mode is required." }),
    sportsPlayers: z
      .array(
        z.object({
          sport: z.string().nonempty({ message: "Sport is required." }),
          players: z.number().positive({ message: "Players must be a positive number." }),
        })
      )
      .optional(),
    accommodationPeople: z
      .number()
      .min(1, { message: "Number of people must be at least 1" })
      .optional(),
    amountInNumbers: z
      .number().min(800, { message: "Amount must be atleast 800 rupees" }),
    amountInWords: z.string().nonempty({ message: "Amount in words is required." }),
    payeeName: z.string().nonempty({ message: "Payee name is required." }),
    transactionId: z.string().nonempty({ message: "Transaction ID is required." }),
    paymentProof: z.any().refine((val) => val !== null && val !== undefined, {
      message: "Payment proof is required.",
    }),
    paymentDate: z
      .date()
      .refine((date) => !isNaN(date.getTime()), { message: "A valid payment date is required." }),
    remarks: z.string().optional(),
  });
  
  type PaymentFormValues = z.infer<typeof PaymentFormSchema>;
  
  interface PaymentFormProps {
    accommodationPrice?: number;
  }
  
  const PaymentForm: React.FC<PaymentFormProps> = ({ accommodationPrice = 2100 }) => {
    const router = useRouter();
    const [showSportFields, setShowSportFields] = useState(false);
    const [showAccommodationFields, setShowAccommodationFields] = useState(false);
    const [paymentFormloading, setPaymentFormloading] = useState<boolean>(false);
    const [resetForm, setResetForm] = useState<boolean>(false);
  
    const form = useForm<PaymentFormValues>({
      resolver: zodResolver(PaymentFormSchema),
      defaultValues: {
        paymentTypes: [],
        sportsPlayers: [],
        accommodationPeople: undefined,
      },
    });
  
    const { fields, append, remove } = useFieldArray({
      control: form.control,
      name: "sportsPlayers",
    });
  
    useEffect(() => {
      if (showSportFields && fields.length === 0) {
        append({ sport: "", players: 1 });
      }
    }, [showSportFields, fields.length, append]);
  
    // Calculate total amount
    const calculateTotalAmount = () => {
      let total = 0;
      
      // Calculate sports registration total
      const sportsPlayers = form.watch("sportsPlayers");
      if (sportsPlayers) {
        total += sportsPlayers.reduce((sum, sport) => sum + (sport.players * 800), 0);
      }
      
      // Add accommodation total if selected
      const accommodationPeople = form.watch("accommodationPeople");
      if (showAccommodationFields && accommodationPeople) {
        total += accommodationPeople * accommodationPrice;
      }
      
      return total;
    };
  
    // Watch for changes that affect total amount
    const totalAmount = calculateTotalAmount();
    useEffect(() => {
      // form.setValue("amountInNumbers", totalAmount);
    }, [totalAmount, form]);
  
    const resetFormAndState = () => {
      form.reset();
      setShowSportFields(false);
      setShowAccommodationFields(false);
      setPaymentFormloading(false);
    };
  
    const onSubmit = async (data: PaymentFormValues) => {
      setPaymentFormloading(true);
  
      try {
        const formData = new FormData();
  
        formData.append("paymentTypes", JSON.stringify(data.paymentTypes));
        formData.append("paymentMode", data.paymentMode);
  
        if (data.sportsPlayers && data.sportsPlayers.length > 0) {
          formData.append("sportsPlayers", JSON.stringify(data.sportsPlayers));
        }
  
        if (data.accommodationPeople) {
          formData.append("accommodationPeople", data.accommodationPeople.toString());
        }
  
        formData.append("amountInNumbers", data.amountInNumbers.toString());
        formData.append("amountInWords", data.amountInWords);
        formData.append("payeeName", data.payeeName);
        formData.append("transactionId", data.transactionId);
        formData.append("paymentDate", data.paymentDate.toISOString());
  
        if (data.paymentProof) {
          formData.append("paymentProof", data.paymentProof);
        }
        if (data.remarks) {
          formData.append("remarks", data.remarks);
        }
  
        const token = getAuthToken();
        if (!token) {
          setPaymentFormloading(false);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Authentication token missing. Please log in.",
            className: styles["mobile-toast"],
          });
          return;
        }
  
        const response = await fetch(`/api/payments/submit`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });
  
        const result = await response.json();
  
        if (response.ok && result.success) {
          toast({
            title: "Success",
            description: "Payment submitted successfully",
            className: styles["mobile-toast"],
          });
  
          resetFormAndState();
          setResetForm(!resetForm);
        } else {
          setPaymentFormloading(false);
          toast({
            variant: "destructive",
            title: "Error",
            description: result.message || "Failed to submit payment. Please try again.",
            className: styles["mobile-toast"],
          });
        }
      } catch (error) {
        setPaymentFormloading(false);
        toast({
          variant: "destructive",
          title: "Error",
          description: error instanceof Error ? error.message : "An unexpected error occurred.",
          className: styles["mobile-toast"],
        });
      }
    };
  
    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pb-6">
          {paymentFormloading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="paymentTypes"
                  render={({ field, fieldState }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className={cn(
                        "text-lg font-bold",
                        fieldState.error && "text-red-500"
                      )}>Payment Type</FormLabel>
                      <FormDescription className="mt-0">
                        Select all the payment types you want to make
                      </FormDescription>
  
                      <div className="flex gap-4">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            onCheckedChange={(checked) => {
                              const current = form.getValues("paymentTypes") || [];
                              if (checked) {
                                form.setValue("paymentTypes", [...current, "accommodation"]);
                                setShowAccommodationFields(true);
                              } else {
                                form.setValue("paymentTypes", current.filter(t => t !== "accommodation"));
                                setShowAccommodationFields(false);
                                form.setValue("accommodationPeople", undefined);
                              }
                            }}
                          />
                          <span>Accommodation</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            onCheckedChange={(checked) => {
                              const current = form.getValues("paymentTypes") || [];
                              if (checked) {
                                form.setValue("paymentTypes", [...current, "registration"]);
                                setShowSportFields(true);
                              } else {
                                form.setValue("paymentTypes", current.filter(t => t !== "registration"));
                                setShowSportFields(false);
                                form.setValue("sportsPlayers", []);
                              }
                            }}
                          />
                          <span>Player Registration</span>
                        </div>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
  
              
  
              {showAccommodationFields && (
                <div className="space-y-4">
                  <div>
                    <FormLabel className="text-lg font-bold block">Accommodation Details</FormLabel>
                    <FormDescription>
                      Enter the number of people requiring accommodation
                    </FormDescription>
                  </div>
                  <div className="flex items-center gap-4">
                    <FormField
                      control={form.control}
                      name="accommodationPeople"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <Input
                            type="number"
                            placeholder="Number of people"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            min={1}
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex-1">
                      <div className="bg-gray-100 px-4 py-2 rounded-md">
                        ₹{((form.watch("accommodationPeople") || 0) * accommodationPrice).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              )}
  
              {showSportFields && (
                <div className="space-y-4">
                  <div>
                    <FormLabel className="text-lg font-bold block">Sport Registration Details</FormLabel>
                    <FormDescription>
                      Please enter number of players for each sport you're paying registration fee for
                    </FormDescription>
                  </div>
                  <div className="flex items-center justify-between">
                    <FormLabel className="font-bold flex-1">Select Sport</FormLabel>
                    <FormLabel className="font-bold flex-1">Number of players</FormLabel>
                    <FormLabel className="font-bold flex-1">Registration Fee(₹)</FormLabel>
                  </div>
  
                  {fields.map((field, index) => (
                    <div key={field.id} className="flex items-center gap-4">
                      <FormField
                        control={form.control}
                        name={`sportsPlayers.${index}.sport`}
                        render={({ field, fieldState }) => (
                          <FormItem className="flex-1">
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger className={cn(
                                fieldState.error && "border-red-500"
                              )}>
                                <SelectValue placeholder="Choose a sport" />
                              </SelectTrigger>
                              <SelectContent className="overflow-y-scroll z-50">
                                {Object.entries(sports).map(([key, value]) => (
                                  <SelectItem key={key} value={key}>
                                    {value}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`sportsPlayers.${index}.players`}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <Input
                              type="number"
                              placeholder="Enter number"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                              min={1}
                              max={20}
                            />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="flex-1 flex items-center">
                        <div className="bg-gray-100 px-4 py-2 rounded-md w-full">
                          ₹{(form.watch(`sportsPlayers.${index}.players`) * 800 || 0).toLocaleString()}
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => remove(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  <Button
                    type="button"
                    className="bg-black text-white hover:bg-gray-800"
                    onClick={() => append({ sport: "", players: 1 })}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Sport
                  </Button>
                </div>
              )}
            <FormField
                control={form.control}
                name="paymentMode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg font-bold">Mode of Payment</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose payment method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bank">Bank Transfer</SelectItem>
                        <SelectItem value="cheque">Cheque</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

<FormField
              control={form.control}
              name="amountInNumbers"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel className={cn(
                    "text-lg font-bold",
                    fieldState.error && "text-red-500"
                  )}>Total Amount in Numbers</FormLabel>
                  <FormDescription className="mt-0">
                    Total amount to pay: ₹{totalAmount.toLocaleString()}
                  </FormDescription>
                  <Input
                    type="number"
                    placeholder="Enter amount in numbers"
                    {...field}
                    onChange={e => {
                      const value = parseFloat(e.target.value);
                      field.onChange(isNaN(value) ? 0 : value);
                    }}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amountInWords"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg font-bold">Total Amount in Words</FormLabel>
                  <FormDescription>Add "only" at the end</FormDescription>
                  <Input placeholder="Enter amount in words" {...field} />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="payeeName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg font-bold">Name of Payee</FormLabel>
                  <Input placeholder="Enter payee name" {...field} />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="transactionId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg font-bold">Transaction ID/Cheque Number</FormLabel>
                  <Input placeholder="Enter transaction ID or cheque number" {...field} />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="paymentProof"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg font-bold">Payment Proof</FormLabel>
                  <FormDescription>File Type: PDF or Image, Maximum 1</FormDescription>
                  <Input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={(e) => field.onChange(e.target.files?.[0])}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="paymentDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="font-bold text-lg">Date of Payment/ Cheque Deposit</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
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

            <FormField
              control={form.control}
              name="remarks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg font-bold">Remarks</FormLabel>
                  <Input placeholder="Enter any comments if you have" {...field} />
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full bg-black text-white hover:bg-gray-800">
              Submit Payment
            </Button>
          </>
        )}
      </form>
    </Form>
  );
};

const getAuthToken = (): string | null => {
  if (typeof document !== 'undefined') {
    const cookies = document.cookie.split("; ")
    const authToken = cookies.find((cookie) => cookie.startsWith("authToken="))
    return authToken ? authToken.split("=")[1] : null
  }
  return null
}

interface PaymentData {
  Accommodation: {
    needAccommodation: boolean;
    cp?: number;
  };
  submittedForms: {
    [key: string]: {
      Players: number;
    };
  } | null;

}

export default function Payments() {
  const paymentFormRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    // Scroll to the target section
    if (paymentFormRef.current) {
      paymentFormRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };
  const [showInput, setShowInput] = useState(false);
  const [paymentData, setPaymentData] = useState<PaymentData>({
    Accommodation: { needAccommodation: false },
    submittedForms: null
  })
  const [filledForms, setFilledForms] = useState<FormData[]>([]);
  const [updatePrice, setUpdatePrice] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [accommodationPrice, setAccomodationPrice] = useState<number>(2100);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: { needAccommodation: false, numberOfPlayers: undefined },
  })


  // const [formReset,setFormReset] = useState(false);


  const resetFormOnce = useRef(false);

  useEffect(() => {
    const fetchPaymentData = async () => {
      try {
        const token = getAuthToken();
        const response = await post<{ success: boolean; data?: PaymentData, form: FormData[] }>(

          `/api/payments`,
          {
            cookies: token,
          }
        );
        if (response.data?.success) {
          if (response.data.data?.Accommodation.cp) {
            setAccomodationPrice(response.data.data?.Accommodation.cp);
          }
          setPaymentData(
            response.data.data || {
              Accommodation: { needAccommodation: false },
              submittedForms: null,
            }
          );
          setFilledForms(response.data.form);
          console.log();
          console.log(response.data.form);

          setShowInput(response.data.data?.Accommodation.needAccommodation || false);

          // Only reset the form once after data is fetched
          if (!resetFormOnce.current) {
            form.reset({ needAccommodation: false, numberOfPlayers: undefined });
            form.reset(response.data.data?.Accommodation || {});
            resetFormOnce.current = true;
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch payment data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPaymentData();
  }, []);

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    try {

      const token = getAuthToken();
      const response = await post<{ success: boolean; data?: PaymentData }>(
        `/api/payments/Accommodation`,
        {
          cookies: token,
          accommodationData: data
        }
      );

      if (!response.data?.success) {
        return toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to save accommodation data. Please try again.",
          className: styles["mobile-toast"],

        });
      }

      toast({
        title: "Success",
        description: "Data saved successfully",
        className: styles["mobile-toast"],

      });

    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        className: styles["mobile-toast"],

      });
    }
  }


  // async function handleAddPayment(data: z.infer<typeof AddPaymentSchema>) {
  //   try {
  //     // Prepare form data
  //     const formData = new FormData();
  //     if (data.file) {
  //       formData.append("file", data.file); // Append the selected file
  //     }
  //     formData.append("amount", data.amount.toString()); // Append the amount
  //     if (data.message) {
  //       formData.append("message", data.message); // Append optional remarks
  //     }

  //     // Fetch token for authentication
  //     const token = getAuthToken();
  //     if (!token) {
  //       return toast({
  //         variant: "destructive",
  //         title: "Error",
  //         description: "Authentication token missing. Please log in.",
  //         className: styles["mobile-toast"],
  //       });
  //     }
  //     const response = await fetch(`/api/payments/upload`, {

  //       method: "POST",
  //       headers: {
  //         Authorization: `Bearer ${token}`, // Pass the token in headers
  //       },
  //       body: formData, // Send formData directly
  //     });

  //     const result = await response.json();

  //     // Handle response
  //     if (response.ok && result.success) {
  //       toast({
  //         title: "Success",
  //         description: "Payment added successfully",
  //         className: styles["mobile-toast"],
  //       });
  //       formAddPayment.reset(); // Reset the form after success
  //     } else {
  //       toast({
  //         variant: "destructive",
  //         title: "Error",
  //         description: result.message || "Failed to add payment. Please try again.",
  //         className: styles["mobile-toast"],
  //       });
  //     }
  //   } catch (error) {
  //     toast({
  //       variant: "destructive",
  //       title: "Error",
  //       description: error instanceof Error ? error.message : "An unexpected error occurred.",
  //       className: styles["mobile-toast"],
  //     });
  //   }
  // }



  const calculateSportsTotal = () => {
    if (!paymentData?.submittedForms) return 0
    return Object.entries(paymentData.submittedForms).reduce((total, [_, sport]) => {
      return total + (sport.Players * 800)
    }, 0)

  }

  const calculateAccommodationTotal = () => {
    if (!form.getValues("needAccommodation")) return 0
    const players = form.getValues("numberOfPlayers") || 0
    return players * accommodationPrice

  }

  const overallTotal = calculateSportsTotal() + calculateAccommodationTotal()

  if (isLoading) return <div className="flex items-center justify-center h-64">
    <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
  </div>
  if (error) return <div>Error: {error}</div>
  const DataTable = ({ columns, data }: { columns: ColumnDef<FormData>[]; data: FormData[] }) => {
    const table = useReactTable({
      data,
      columns,
      getCoreRowModel: getCoreRowModel(),
    });

    return (
      <div className="rounded-lg shadow-lg max-w-full">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="bg-black hover:bg-black-200 group">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="text-white text-center group-hover:bg-black-200 transition-colors duration-200"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="text-center">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    );
  };

  return (
    <div className="w-full h-full relative">
      <div className="w-full px-6 pb-6">
        <HeadingWithUnderline
          text="Accommodation and Payments"
          desktopSize="md:text-6xl"
          mobileSize="text-3xl sm:text-2xl"
        />
        <div className="mt-10 space-y-8 pb-10">
          <Button onClick={handleScroll}>Add Payment</Button>

          <Card>
            <CardHeader>
              <HeadingWithUnderline
                text="Amount to be Paid"
                desktopSize="md:text-4xl"
                mobileSize="text-2xl sm:text-xl"
              />
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                {!paymentData?.submittedForms || Object.keys(paymentData.submittedForms).length === 0 ? (
                  <EmptyState />
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="font-bold">Sport</TableHead>
                        <TableHead className="text-right font-bold">Players</TableHead>
                        <TableHead className="text-right font-bold">Registration Fee</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Object.entries(paymentData.submittedForms).map(([sport, data]) => (
                        <TableRow key={sport}>
                          <TableCell className="font-medium">{sports[sport]}</TableCell>
                          <TableCell className="text-right">{data.Players}</TableCell>
                          <TableCell className="text-right">₹{data.Players * 800}</TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="bg-muted/50">
                        <TableCell colSpan={2} className="font-bold">Total Registration Fee</TableCell>
                        <TableCell className="text-right font-bold">₹{calculateSportsTotal()}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Accommodation Details</CardTitle>
              <CardDescription>Accommodation cost per player for the entire event is ₹{accommodationPrice}</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="needAccommodation"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-3">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={(checked) => {
                              const isChecked = checked === true
                              field.onChange(isChecked)
                              setShowInput(isChecked)
                              if (!isChecked) {
                                form.setValue("numberOfPlayers", undefined);
                                form.reset({ needAccommodation: false })
                              }
                            }}
                          />
                        </FormControl>
                        <FormLabel>Do you need accommodation?</FormLabel>
                      </FormItem>
                    )}
                  />

                  {showInput && (
                    <FormField
                      control={form.control}
                      name="numberOfPlayers"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-bold">Number of players</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="number of players"
                              value={field.value || ""}
                              onChange={(e) => {
                                setUpdatePrice(!updatePrice);
                                field.onChange(
                                  e.target.value ? parseInt(e.target.value) : 0
                                )
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <div className="mt-4 p-4 bg-muted rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Accommodation Cost</span>
                      <span className="font-bold">₹{calculateAccommodationTotal()}</span>
                    </div>
                  </div>

                  <Button type="submit">Save</Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          <Card className="bg-primary/5">
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold text-primary">Total Amount to be Paid</span>
                <span className="text-2xl font-bold text-primary">₹{overallTotal}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 pb-8 overflow-auto">
          {filledForms.length === 0 ? (
            <div></div>
          ) : (
            <div>
              <Separator className="my-4" ref={paymentFormRef} />
              <CardTitle className="pb-1">Submitted payments</CardTitle>
              <CardDescription className="pb-5">
                Below is the info of submitted forms. if status is in review then our team will verify the payment and get back to you
              </CardDescription>
              <DataTable columns={columns} data={filledForms} />
            </div>
          )}
        </div>

        <Separator className="my-4" ref={paymentFormRef} />
        <h2 className="mt-5 text-2xl font-semibold text-gray-800">Payment Form</h2>
        <p className="text-sm text-gray-600 mb-4">Enter your payment details below</p>
        <PaymentForm />
      </div>
    </div>
  )
}