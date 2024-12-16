"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { post } from "@/app/utils/PostGetData";
import { decrypt } from "@/app/utils/encryption";

export default function VerifyAccount() {
  const [token, setToken] = useState<string | null>(null);

  // Extract token from URL query parameters
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tokenFromURL = params.get("i");
      if (tokenFromURL) {
        setToken(tokenFromURL);
        console.log("Extracted token:", tokenFromURL); // Correctly logs the extracted token
      }
    }
  }, []);

  // Function to verify email
  const handleEmailVerify = async (verificationToken: string | null) => {
    if (!verificationToken) {
      console.error("No token provided for verification");
      return;
    }

    try {
      const response = await post<{ email: string }>("/api/auth/emailVerify", {
        vid: verificationToken,
      });
      console.log("Verification response:", response);
    } catch (error) {
      console.error("Error verifying email:", error);
    }
  };

  // Trigger email verification when token is available
  useEffect(() => {
    if (token) {
      handleEmailVerify(token);
    }
  }, [token]);

  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Verify Your Account</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 mb-4">Checking your verification token...</p>
        <p className="text-sm text-gray-500 mb-4">
          {token ? "Token found! Verifying your account." : "No token found in the URL."}
        </p>
      </CardContent>
    </Card>
  );
}
