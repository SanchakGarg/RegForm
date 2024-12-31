"use client"
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

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
    defaultValues: paymentData.Accommodation,
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
          accommodationData:data
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
                <div className="text-center py-4 text-gray-500">Not registered for any sports</div>
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
                              form.setValue("numberOfPlayers", undefined)
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
                                e.target.value ? parseInt(e.target.value) : undefined
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