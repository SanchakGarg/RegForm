import { NextRequest, NextResponse } from "next/server";
import { post } from "@/app/utils/PostGetData";

// Define the expected shape of the response inline
type PostResponse = {
  success: boolean
};

export function middleware(req: NextRequest) {
  const token = req.cookies.get("authToken")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/SignIn", req.url), { status: 302 });
  }

  return validateToken(token)
    .then((isValid) => {
      if (isValid) {
        return NextResponse.next();
      }

      return NextResponse.redirect(new URL("/SignIn", req.url), { status: 302 });
    })
    .catch(() => {
      return NextResponse.redirect(new URL("/SignIn", req.url), { status: 302 });
    });
}

// Token validation with inline typing
async function validateToken(token: string): Promise<boolean> {
  const response = await post<{ success: boolean }>(`${process.env.ROOT_URL}api/auth/middleware`, { tokene: token });

  if (response.error) {
    console.error("Error during token validation:", response.error);
    return false;
  }
  if(response.data){
    const data = response.data;
  return data.success ?? false;
  }
  return false;
}

// Match protected routes
export const config = {
  matcher: ["/dashboard/:path*"],
};
