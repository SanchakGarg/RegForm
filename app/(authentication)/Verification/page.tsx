'use client';
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { decrypt } from "@/app/utils/encryption";
import styles from './auth.module.css';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { post } from "@/app/utils/PostGetData";

export default function VerifyAccount() {
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [token, setToken] = useState<string | null>(null); // State to safely track token

  // Manually parse token from the URL's query string
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tokenFromURL = params.get("v");
      if (tokenFromURL) {
        setToken(tokenFromURL);
      }
    }
  }, []);

  const handleResendEmail = async () => {
    if (!token) {
      setError("unable to resend email.");
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const decryptedValue = decrypt(token);

      if (!decryptedValue?.email) {
        setError("Unable to decrypt token or invalid data.");
        setIsLoading(false);
        return;
      }

      const response = await post<{ email: string }>("/api/Mailer/Verification", {
        email: decryptedValue.email,
      });

      if (response.error) {
        setError(response.error.message);
      } else {
        setSuccess("Verification email has been resent.");
      }
    } catch (error) {
      console.error("Error during resend email:", error);
      setError("An unexpected error occurred.");
    }

    setIsLoading(false);
  };

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
        {error && <p className="text-red-500">{error}</p>}
        {success && <p className="text-green-500">{success}</p>}
      </CardContent>

      <CardFooter className="flex justify-end">
        <Button
          onClick={handleResendEmail}
          disabled={isLoading}
          className={isLoading ? "opacity-50 cursor-not-allowed" : ""}
        >
          {isLoading ? <div className={styles.spinner}></div> : "Resend Email"}
        </Button>
      </CardFooter>
    </Card>
  );
}
