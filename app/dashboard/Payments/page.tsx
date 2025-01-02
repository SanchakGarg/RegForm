"use client"
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable react-hooks/exhaustive-deps */

import { Medal } from 'lucide-react';
import { Medal } from 'lucide-react';
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useState, useEffect } from "react"
import styles from "@/app/styles/toast.module.css"
import { toast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { useRef } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
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
const EmptyState = () => (
  <div className="flex flex-col items-center justify-center p-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
    <Medal className="w-16 h-16 text-gray-400 mb-4" />
    <h3 className="text-xl font-bold text-gray-700 mb-2">No Sports Registered</h3>
    <p className="text-gray-500 text-center max-w-md">
      You haven't registered for any sports yet. Register for a sport to start your athletic journey!
    </p>
  </div>
);

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

const AddPaymentSchema = z.object({
  amount: z
    .number({
      required_error: "Amount is required",
      invalid_type_error: "Amount must be a number",
    })
    .positive("Amount must be positive"),
  file: z
    .instanceof(File)
    .refine((file) => file.size > 0, {
      message: "Please select a valid file",
    }),
  message: z.string().optional(),
});




const AddPaymentSchema = z.object({
  amount: z
    .number({
      required_error: "Amount is required",
      invalid_type_error: "Amount must be a number",
    })
    .positive("Amount must be positive"),
  file: z
    .instanceof(File)
    .refine((file) => file.size > 0, {
      message: "Please select a valid file",
    }),
  message: z.string().optional(),
});




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

  const formAddPayment = useForm<z.infer<typeof AddPaymentSchema>>({
    resolver: zodResolver(AddPaymentSchema),
    defaultValues: { amount: undefined, file: undefined, message: "" },
    defaultValues: { needAccommodation: false, numberOfPlayers: undefined },
  })

  const formAddPayment = useForm<z.infer<typeof AddPaymentSchema>>({
    resolver: zodResolver(AddPaymentSchema),
    defaultValues: { amount: undefined, file: undefined, message: "" },
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


  async function handleAddPayment(data: z.infer<typeof AddPaymentSchema>) {
    try {
      // Prepare form data
      const formData = new FormData();
      if (data.file) {
        formData.append("file", data.file); // Append the selected file
      }
      formData.append("amount", data.amount.toString()); // Append the amount
      if (data.message) {
        formData.append("message", data.message); // Append optional remarks
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
  
      // Make the API request
      const response = await fetch(`/api/payments/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`, // Pass the token in headers
        },
        body: formData, // Send formData directly
      });
  
      const result = await response.json();
  
      // Handle response
      if (response.ok && result.success) {
        toast({
          title: "Success",
          description: "Payment added successfully",
          className: styles["mobile-toast"],
        });
        formAddPayment.reset(); // Reset the form after success
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.message || "Failed to add payment. Please try again.",
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
  }
  


  const calculateSportsTotal = () => {
    if (!paymentData?.submittedForms) return 0
    return Object.entries(paymentData.submittedForms).reduce((total, [_, sport]) => {
      return total + (sport.Players * 800)
    }, 0)

  }

  const calculateAccommodationTotal = () => {
    if (!form.getValues("needAccommodation")) return 0
    const players = form.getValues("numberOfPlayers") || 0
    return players * 500

  }

  const overallTotal = calculateSportsTotal() + calculateAccommodationTotal()

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div className="h-screen p-6">
      <HeadingWithUnderline
        text="Accommodation and Payments"
        desktopSize="md:text-6xl"
        mobileSize="text-3xl sm:text-2xl"
      />
      <div className="mt-10 space-y-8 pb-10">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button>Add Payment</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Add Payment</AlertDialogTitle>
              <AlertDialogDescription>
                Enter payment details below.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <Form {...formAddPayment}>
              <form onSubmit={formAddPayment.handleSubmit(handleAddPayment)} className="space-y-4">
                {/* Amount Field */}
                <FormField
                  control={formAddPayment.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold">Amount</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter amount"
                          value={field.value || ""}
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* File Input Field */}
                <FormField
                  control={formAddPayment.control}
                  name="file"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold">Upload Proof of Payment</FormLabel>
                      <FormControl>
                        <Input
                          type="file"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            field.onChange(file || null); // Pass the file or null to the field
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Remarks Field */}
                <FormField
                  control={formAddPayment.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold">Remarks (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="Add remarks (if any)"
                          value={field.value || ""}
                          onChange={(e) => field.onChange(e.target.value)}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                {/* Submit Button */}
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <Button type="submit">Submit</Button>
                </AlertDialogFooter>
              </form>
            </Form>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button>Add Payment</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Add Payment</AlertDialogTitle>
              <AlertDialogDescription>
                Enter payment details below.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <Form {...formAddPayment}>
              <form onSubmit={formAddPayment.handleSubmit(handleAddPayment)} className="space-y-4">
                {/* Amount Field */}
                <FormField
                  control={formAddPayment.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold">Amount</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter amount"
                          value={field.value || ""}
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* File Input Field */}
                <FormField
                  control={formAddPayment.control}
                  name="file"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold">Upload Proof of Payment</FormLabel>
                      <FormControl>
                        <Input
                          type="file"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            field.onChange(file || null); // Pass the file or null to the field
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Remarks Field */}
                <FormField
                  control={formAddPayment.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold">Remarks (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="Add remarks (if any)"
                          value={field.value || ""}
                          onChange={(e) => field.onChange(e.target.value)}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                {/* Submit Button */}
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <Button type="submit">Submit</Button>
                </AlertDialogFooter>
              </form>
            </Form>
          </AlertDialogContent>
        </AlertDialog>


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
                        <TableCell className="font-medium">{sport}</TableCell>
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
                            placeholder="Enter number of players"
                            value={field.value || ""}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value ? parseInt(e.target.value) : 0
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
    </div>
  )
}