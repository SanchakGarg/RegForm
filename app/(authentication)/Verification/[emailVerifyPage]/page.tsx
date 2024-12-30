"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { post } from "@/app/utils/PostGetData";
import styles from "@/app/styles/spinner.module.css";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function VerifyAccount() {
  const router = useRouter();

  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [content, setContent] = useState<string | null>(null);
  const [title, setTitle] = useState<string | null>("verifying");

  // Extract token from URL query parameters
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tokenFromURL = params.get("i");
      const emailFromUrl = params.get("e");
      if (tokenFromURL) {
        setToken(tokenFromURL);
      }
      if (emailFromUrl) {
        setEmail(emailFromUrl);
      }
    }
  }, []);

  // Function to verify email
  const handleEmailVerify = async (verificationToken: string | null, emailID: string | null) => {
    try {
      const response = await post<{ success: boolean; token: string }>("/api/auth/emailVerify", {
        vid: verificationToken,
        e: emailID,
      });
      if (response.data && response.data.success) {
        setTitle("verified");
        setIsLoading(false);
        setContent("Email Verified. You can Login now");
        if (response.data.token) {
          document.cookie = `authToken=${response.data.token}; path=/;`;
          console.log("cookie set");
        }
      } else {
        setTitle("Invalid link");
        setIsLoading(false);
        setContent("Something went wrong. Please check again.");
      }
    } catch (error) {
      console.error("Error verifying email:", error);
      setTitle("Error");
      setIsLoading(false);
      setContent("An error occurred during verification. Please try again later.");
    }
  };

  // Trigger email verification when token is available
  useEffect(() => {
    if (token) {
      handleEmailVerify(token, email);
    }
  }, [token]);

  const navigateToDashboard = () => {
    router.push("/dashboard");
  };

  return (
    <Card className="w-[350px]">
      <CardHeader>
        {title && <CardTitle className="">{title}</CardTitle>}
      </CardHeader>
      <CardContent>
        {content && <p className="text-sm text-gray-600 mb-4">{content}</p>}
        {isLoading ? <div className={styles.spinner}></div> : null}
      </CardContent>
      {!isLoading && title === "verified" && (
        <CardFooter className="justify-end">
          <Button onClick={navigateToDashboard}>
            Go to Dashboard
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
