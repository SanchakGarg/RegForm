
import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function VerifyAccount() {
  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Verify Your Account</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 mb-4">
          An email has been sent to your registered email address. Please check your inbox and follow the instructions to verify your account.
        </p>
        <p className="text-sm text-gray-500 mb-4">
          If you don’t see the email, check your spam or junk folder.
        </p>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button>
          Resend Email
        </Button>
      </CardFooter>
    </Card>
  );
}
