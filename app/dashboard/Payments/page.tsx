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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import HeadingWithUnderline from "@/app/components/dashboard/headingWithUnderline"
import { post } from "@/app/utils/PostGetData"
import { sports } from '@/app/utils/forms/schema';
const EmptyState = () => (
  <div className="flex flex-col items-center justify-center p-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
    <Medal className="w-16 h-16 text-gray-400 mb-4" />
    <h3 className="text-xl font-bold text-gray-700 mb-2">No Sports Registered</h3>
    <p className="text-gray-500 text-center max-w-md">
      You haven't registered for any sports yet. Register for a sport to start your athletic journey!
    </p>
  </div>
);


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
  registrations: z
    .array(
      z.object({
        sport: z.string().nonempty({ message: "Sport is required." }),
        players: z.number().positive({ message: "Players must be a positive number." }),
      })
    )
    .optional(),
  amountInNumbers: z
    .number().min(1, { message: "Amount must be greater than zero" }),
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

const PaymentForm = () => {
  const [showSportFields, setShowSportFields] = useState(false);

  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(PaymentFormSchema),
    defaultValues: {
      paymentTypes: [],
      registrations: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "registrations",
  });

  useEffect(() => {
    if (showSportFields && fields.length === 0) {
      append({ sport: "", players: 1 });
    }
  }, [showSportFields, fields.length, append]);

  const onSubmit = async (data: PaymentFormValues) => {
    try {
      // Prepare form data
      const formData = new FormData();

      // Append payment types
      formData.append("paymentTypes", JSON.stringify(data.paymentTypes));

      // Append payment mode
      formData.append("paymentMode", data.paymentMode);

      // Append registrations if present
      if (data.registrations && data.registrations.length > 0) {
        formData.append("registrations", JSON.stringify(data.registrations));
      }

      // Append amounts
      formData.append("amountInNumbers", data.amountInNumbers.toString());
      formData.append("amountInWords", data.amountInWords);

      // Append payee details
      formData.append("payeeName", data.payeeName);
      formData.append("transactionId", data.transactionId);

      // Append payment date
      formData.append("paymentDate", data.paymentDate.toISOString());

      // Append payment proof file if present
      if (data.paymentProof) {
        formData.append("paymentProof", data.paymentProof);
      }
      if (data.remarks) {
        formData.append("remarks", data.remarks);
      }

      // Fetch token for authentication
      const token = getAuthToken();
      if (!token) {
        return toast({
          variant: "destructive",
          title: "Error",
          description: "Authentication token missing. Please log in.",
          className: styles["mobile-toast"],
        });
      }

      // Send the request
      const response = await fetch(`/api/payments/submit`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();

      // Handle response
      if (response.ok && result.success) {
        toast({
          title: "Success",
          description: "Payment submitted successfully",
          className: styles["mobile-toast"],
        });

        // Reset the form
        form.reset();
        setShowSportFields(false);
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.message || "Failed to submit payment. Please try again.",
          className: styles["mobile-toast"],
        });
      }
    } catch (error) {
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
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="paymentTypes"
            render={({ field, fieldState }) => (
              <FormItem className="flex flex-col gap-4">
                <FormLabel className={cn(
                  "text-lg font-bold",
                  fieldState.error && "text-red-500"
                )}>Payment Type</FormLabel>
                <div className="flex gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      onCheckedChange={(checked) => {
                        const current = form.getValues("paymentTypes") || [];
                        if (checked) {
                          form.setValue("paymentTypes", [...current, "accommodation"]);
                        } else {
                          form.setValue("paymentTypes", current.filter(t => t !== "accommodation"));
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
                          form.setValue("registrations", []);
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

        {showSportFields && (
          <div className="space-y-4">
            <div>
              <FormLabel className="text-lg font-bold block">Sport Registration Details</FormLabel>
              <FormDescription>
                Please enter number of players for each sport you're paying registration fee for
              </FormDescription>
            </div>
            <div className="flex items-center gap-25 justify-around">
              <FormLabel className="font-bold">Select Sport</FormLabel>
              <FormLabel className="font-bold">Number of players</FormLabel>
            </div>

            {fields.map((field, index) => (
              <div key={field.id} className="flex items-center gap-4">
                <FormField
                  control={form.control}
                  name={`registrations.${index}.sport`}
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
                  name={`registrations.${index}.players`}
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
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className=""
                  onClick={() => remove(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
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
          name="amountInNumbers"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel className={cn(
                "text-lg font-bold",
                fieldState.error && "text-red-500"
              )}>Total Amount in Numbers</FormLabel>
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

        {/* Rest of the form fields remain the same */}
        <FormField
          control={form.control}
          name="amountInWords"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-lg font-bold">Total Amount in Words</FormLabel>
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
              <FormLabel className="font-bold text-lg">Date of Payment</FormLabel>
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
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
        const response = await post<{ success: boolean; data?: PaymentData }>(

          `/api/payments`,
          {
            cookies: token,
          }
        );
        if (response.data?.success) {
          setPaymentData(
            response.data.data || {
              Accommodation: { needAccommodation: false },
              submittedForms: null,
            }
          );

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
    return players * 2100

  }

  const overallTotal = calculateSportsTotal() + calculateAccommodationTotal()

  if (isLoading) return <div className="flex items-center justify-center h-64">
    <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
  </div>
  if (error) return <div>Error: {error}</div>

  return (
    <div className="h-screen pr-6 pb-6">
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
                            onChange={(e) =>
                              field.onChange(
                                e.target.value ? parseInt(e.target.value) : 0
                              )
                            }
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
      <Separator className="my-4" ref={paymentFormRef} />
      <h2 className="mt-5 text-2xl font-semibold text-gray-800">Payment Form</h2>
      <p className="text-sm text-gray-600 mb-4">Enter your payment details below</p>
      <PaymentForm />
    </div>
  )
}