import { encrypt } from "@/app/utils/encryption";
import { getEmailFromToken } from "@/app/utils/forms/getEmail";
import { eventSchema } from "@/app/utils/forms/schema";
import { fetchUserData } from "@/app/utils/GetUpdateUser";
import { connectToDatabase } from "@/lib/mongodb";
import { Collection } from "mongodb";
import { NextRequest, NextResponse } from "next/server";

interface FormObj {
  ownerId: Object;
  fields?: Object;
  createdAt: Date;
  updatedAt: Date;
  title:string
}

interface FetchUserResponse {
  data: { _id: Object };
}

interface FetchUserError {
  error: string;
}

export async function POST(req: NextRequest) {

  try {
    // Ensure the request has a JSON body
    const data = await req.json();
    console.log("Received data:", data);
    if (!data || Object.keys(data).length === 0) {
      return NextResponse.json(
        { success: false, message: "Invalid or empty data" },
        { status: 400 }
      );
    }

    const email = getEmailFromToken(req);
    if (!email) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: Invalid token or email not found" },
        { status: 401 }
      );
    }

    const { db } = await connectToDatabase();
    const formCollection: Collection = db.collection("form");

    const userResponse = await fetchUserData("email", email, ["_id"]);

    if (!userResponse.success || !userResponse.data?._id) {
      return NextResponse.json(
        { success: false, message: "Owner not found or invalid response" },
        { status: 404 }
      );
    }
    
    const ownerId = userResponse.data._id; // Safely access the _id property
    const selectedSports=data.data.sports;
    const newFormData: FormObj = {
      ownerId,
      title:selectedSports,
      // fields: generateDefaultValues(eventSchema.subEvents.[].sports)
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await formCollection.insertOne(newFormData);

    return NextResponse.json(
      { success: true, message: "Data processed successfully",formId:encrypt(userResponse.data) },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in API handler:", error);

    // Handle JSON parsing errors
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { success: false, message: "Invalid JSON format" },
        { status: 400 }
      );
    }

    // Handle other errors
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
