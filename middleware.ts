import { NextRequest, NextResponse } from "next/server";
import { post } from "@/app/utils/PostGetData";

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("authToken")?.value;

  const isSignInPage = req.nextUrl.pathname === "/SignIn";

  // If there's no token
  if (!token) {
    if (isSignInPage) {
      // Allow access to the SignIn page if unauthenticated
      return NextResponse.next();
    }
    // Redirect unauthenticated users on protected routes to SignIn
    return NextResponse.redirect(new URL("/SignIn", req.url), { status: 302 });
  }

  // Validate the token
  const isValid = await validateToken(token);

  if (isValid) {
    if (isSignInPage) {
      // Redirect authenticated users away from SignIn to Dashboard
      return NextResponse.redirect(new URL("/dashboard", req.url), { status: 302 });
    }
    // Allow access to protected routes if authenticated
    return NextResponse.next();
  }

  // Redirect to SignIn if the token is invalid or expired
  return NextResponse.redirect(new URL("/SignIn", req.url), { status: 302 });
}

// Token validation function
async function validateToken(token: string): Promise<boolean> {
  try {
    const response = await post<{ success: boolean }>(`${process.env.ROOT_URL}api/auth/middleware`, { tokene: token });

    if (response.error) {
// console.error("Error during token validation:", response.error);

      return false;
    }

    if (response.data) {
      const data = response.data;
      return data.success ?? false;
    }

    return false;
  } catch (error) {
// console.error("Exception during token validation:", error);

    return false;
  }
}

// Middleware matcher configuration
export const config = {
  matcher: [
    "/dashboard/:path*", // Protect all Dashboard routes
  ],
};
