import { getEmailFromToken } from "@/app/utils/forms/getEmail";
import { fetchUserData } from "@/app/utils/GetUpdateUser";
import { NextRequest, NextResponse } from "next/server";


export async function POST(req: NextRequest) {
  try {
    const email = getEmailFromToken(req);
    if (!email) {
      console.error("Unauthorized: Invalid token or email not found");
      return NextResponse.json(
        { success: false, message: "Unauthorized: Invalid token or email not found" },
        { status: 401 }
      );
    }

    const userResponse = await fetchUserData("email", email, ["Accommodation", "submittedForms"]);

    if (userResponse.success) {
      console.log("User data retrieved successfully:", userResponse.data);
      return NextResponse.json(
        {
          success: true,
          message: "User data retrieved successfully",
          data: userResponse.data,
        },
        { status: 200 }
      );
    } else {
      console.error("Failed to retrieve user data:", userResponse.message);
      return NextResponse.json(
        {
          success: false,
          message: "Failed to retrieve user data",
        },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error("Error in API handler:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
