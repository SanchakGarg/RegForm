"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { post } from "@/app/utils/PostGetData";
import styles from '../spinner.module.css';

export default function VerifyAccount() {
  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [content,setContent] = useState<string |null >(null);
  const [title,setTitle] = useState<string |null >("verifying");
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
  const handleEmailVerify = async (verificationToken: string | null, emailID: string |null) => {
    try {
      const response = await post<{ success: boolean }>("/api/auth/emailVerify", {
        vid: verificationToken,
        e: emailID
      });
      if (response.data && response.data.success) {
        setTitle("verified");
        setIsLoading(false);
        setContent("Email Verified. you can Login now");
      } else {
        setTitle("Invalid link")
        setIsLoading(false);
        setContent("Something went wrong please check again");
      }
    } catch (error) {
      console.error("Error verifying email:", error);
    }
  };

  // Trigger email verification when token is available
  useEffect(() => {
    if (token) {
      handleEmailVerify(token,email);
    }
  }, [token]);

  return (
    <Card className="w-[350px]">
      <CardHeader>
      {title && <CardTitle className="">{title}</CardTitle>}
      </CardHeader>
      <CardContent>
      {content && <p className="text-sm text-gray-600 mb-4">{content}</p>}
      {isLoading ? <div className={styles.spinner}></div> : null}
      </CardContent>
    </Card>
  );
}
