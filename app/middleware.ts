import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { decrypt } from "@/app/utils/encryption";

const JWT_SECRET = process.env.JWT_SECRET || "your-256-bit-secret";

export function middleware(req: NextRequest) {
  // Get token from cookies
  const token = req.cookies.get("authToken")?.value; // Extract value

  if (!token) {
    return NextResponse.redirect(new URL("/authentication/SignIn", req.url));
  }

  try {
    const decryptedToken = decrypt(token).jwt;
    jwt.verify(decryptedToken, JWT_SECRET);
    return NextResponse.next();
  } catch (error) {
    console.error("Invalid token:", error);
    return NextResponse.redirect(new URL("/authentication/SignIn", req.url));
  }
}

// Apply middleware to protected routes
export const config = {
  matcher: ["/dashboard/:path*"], // Protect the '/dashboard' route
};
