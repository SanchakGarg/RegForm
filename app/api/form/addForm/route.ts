import { encrypt } from "@/app/utils/encryption";
import { getEmailFromToken } from "@/app/utils/forms/getEmail";
import { connectToDatabase } from "@/lib/mongodb";
import { Collection } from "mongodb";
import { NextRequest, NextResponse } from "next/server";
import { fetchUserData } from "@/app/utils/GetUpdateUser";

interface FormObj {
  ownerId: Object;
  fields?: Object;
  createdAt: Date;
  status: string;
  updatedAt: Date;
  title: string;
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

    // Fetch user data based on the email
    const userResponse = await fetchUserData("email", email, ["_id"]);

    if (!userResponse.success || !userResponse.data?._id) {
      return NextResponse.json(
        { success: false, message: "Owner not found or invalid response" },
        { status: 404 }
      );
    }

    const ownerId = userResponse.data._id;
    const selectedSports = data.data.sports;
    // Check if a form with the same title and ownerId already exists
    const existingForm = await formCollection.findOne({ title: selectedSports, ownerId });

    if (existingForm) {
      return NextResponse.json(
        { success: false, message: "A form for this sport already exists" },
        { status: 400 }
      );
    }

    const newFormData: FormObj = {
      ownerId,
      title: selectedSports,
      status: "draft",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await formCollection.insertOne(newFormData);
    const insertedId = result.insertedId;
    return NextResponse.json(
      {
        success: true,
        message: "Data processed successfully",
        formId: insertedId.toString,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in API handler:", error);

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { success: false, message: "Invalid JSON format" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}