import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";
import { decrypt } from "../encryption";

/**
 * Extracts the email from the JWT token in the cookies.
 * @param req - The NextRequest object.
 * @returns The email from the token, or null if not found or invalid.
 */
export function getEmailFromToken(req: NextRequest): string {
  // Step 1: Get the secret key from the environment variables
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    console.error("JWT secret key is not defined in the environment variables.");
    return "";
  }

  // Step 2: Get the token from cookies
  const token = decrypt(req.cookies.get("authToken")?.value as string).jwt;

  if (!token) {
    console.error("Auth token not found in cookies.");
    return "";
  }

  try {
    // Step 3: Decode and verify the token
    const decoded = jwt.verify(token, secret) as { email?: string };

    // Step 4: Extract and return the email from the decoded token
    return decoded.email || "";
  } catch (error) {
    console.error("Error decoding token:", error);
    return "";
  }
}
