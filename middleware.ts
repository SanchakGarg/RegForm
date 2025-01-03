import { NextRequest, NextResponse } from "next/server";
import { post } from "@/app/utils/PostGetData";

// Define the expected shape of the response inline
export async function middleware(req: NextRequest) {
  const token = req.cookies.get("authToken")?.value;

  // Check if the user is trying to access the SignIn, SignUp, or Verification pages
  const isSignInPage = req.nextUrl.pathname === "/SignIn";

  if (!token) {
    // If there's no token and the user is on a protected route, redirect to SignIn
    if (!isSignInPage ) {
      return NextResponse.redirect(new URL("/SignIn", req.url), { status: 302 });
    }
    // Allow access to the SignIn, SignUp, or Verification page if unauthenticated
    return NextResponse.next();
  }

  // Validate the token
  const isValid = await validateToken(token);

  if (isValid) {
    // Redirect authenticated users from the SignIn, SignUp, or Verification page to the Dashboard
    if (isSignInPage ) {
      return NextResponse.redirect(new URL("/dashboard", req.url), { status: 302 });
    }
    // Allow access to other routes if authenticated
    return NextResponse.next();
  }

  // Redirect to SignIn if the token is invalid
  return NextResponse.redirect(new URL("/SignIn", req.url), { status: 302 });
}

// Token validation with inline typing
async function validateToken(token: string): Promise<boolean> {
  const response = await post<{ success: boolean }>(`${process.env.ROOT_URL}api/auth/middleware`, { tokene: token });

  if (response.error) {
    console.error("Error during token validation:", response.error);
    return false;
  }

  if (response.data) {
    const data = response.data;
    return data.success ?? false;
  }
  return false;
}
// Match protected routes and the SignIn, SignUp, and Verification pages
export const config = {

  matcher: ["/dashboard/:path*", "/SignIn"], // Add SignUp and Verification to the matcher

};
