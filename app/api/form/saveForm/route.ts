import { getEmailFromToken } from "@/app/utils/forms/getEmail";
import { connectToDatabase } from "@/lib/mongodb";
import { Collection } from "mongodb";
import { NextRequest, NextResponse } from "next/server";
import { fetchUserData } from "@/app/utils/GetUpdateUser";

interface FormObj {
  ownerId: Object;
  fields: Object;
  createdAt: Date;
  status: string;
  updatedAt: Date;
  title: string;
}

export async function PUT(req: NextRequest) {
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

    const { formId, fields, isDraft } = data;
    if (!formId || !fields || typeof isDraft !== "boolean") {
      return NextResponse.json(
        { success: false, message: "Form ID, fields, and isDraft are required" },
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

    // Fetch form data based on formId
    const form = await formCollection.findOne({ _id: formId });
    if (!form) {
      return NextResponse.json(
        { success: false, message: "Form not found" },
        { status: 404 }
      );
    }

    const ownerId = form.ownerId;

    // Fetch user data based on the ownerId
    const userResponse = await fetchUserData("_id", ownerId, ["email"]);
    if (!userResponse.success || !userResponse.data?.email) {
      return NextResponse.json(
        { success: false, message: "Owner not found or invalid response" },
        { status: 404 }
      );
    }

    // Check if the email from the token matches the owner's email
    if (userResponse.data.email !== email) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: Emails do not match" },
        { status: 401 }
      );
    }

    // If status is "submitted", reject the update request
    if (form.status === "submitted") {
      return NextResponse.json(
        { success: false, message: "Cannot update a form that has been submitted" },
        { status: 400 }
      );
    }

    // Update form fields and status based on isDraft
    const updatedData: Partial<FormObj> = {
      fields,
      updatedAt: new Date(),
    };

    if (!isDraft) {
      updatedData.status = "submitted"; // Update status to "submitted" if isDraft is false
    }

    // Update the form in the database
    await formCollection.updateOne(
      { _id: formId },
      { $set: updatedData }
    );

    return NextResponse.json(
      { success: true, message: "Form updated successfully" },
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
