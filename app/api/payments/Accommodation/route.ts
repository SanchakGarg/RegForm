import { getEmailFromToken } from "@/app/utils/forms/getEmail";
import { updateUserData } from "@/app/utils/GetUpdateUser";
import { NextRequest, NextResponse } from "next/server";
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
interface UpdateResponse {
  success: boolean;
  message: string;
  data?: Record<string, any>;
}

export async function POST(req: NextRequest) {
  try {
    const email = getEmailFromToken(req);
    if (!email) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: Invalid token or email not found" },
        { status: 401 }
      );
    }

    const data = await req.json();
    const response = await updateUserData(email, {Accommodation:data.accommodationData});
    const updateResponse = response as UpdateResponse;

    if (updateResponse.success) {
      return NextResponse.json(
        {
          success: true,
          message: "User data updated successfully",
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { success: false, message: updateResponse.message },
      { status: 400 }
    );

  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}