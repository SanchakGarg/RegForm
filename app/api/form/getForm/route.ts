import { getEmailFromToken } from "@/app/utils/forms/getEmail";
import { connectToDatabase } from "@/lib/mongodb";
import { Collection, ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";
import { fetchUserData } from "@/app/utils/GetUpdateUser";

// interface FormObj {
//   ownerId: Object;
//   fields?: Object;
//   createdAt: Date;
//   status: string;
//   updatedAt: Date;
//   title: string;
// }

export async function POST(req: NextRequest) {
  try {
    // Ensure the request has a JSON body
    const data = await req.json();
    // console.log("Received data:", data);
    if (!data || Object.keys(data).length === 0) {
      return NextResponse.json(
        { success: false, message: "Invalid or empty data" },
        { status: 400 }
      );
    }

    const formId = data.formId; // Expecting formId in the request body
    if (!formId) {
      return NextResponse.json(
        { success: false, message: "Form ID is required" },
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
    const form = await formCollection.findOne({ _id: new ObjectId(formId) });
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

    // If status is not draft, return error
    if (form.status !== "draft") {
      return NextResponse.json(
        { success: false, message: "Form has already been submitted" },
        { status: 400 }
      );
    }

    // Return form fields or an empty object if fields don't exist
    const formFields = form.fields || {};
    
    
    return NextResponse.json(
      {
        success: true,
        message: "Form data retrieved successfully",
        data:{
          title: form.title,  // Return the title from the form
          fields: formFields,
        }
      },
      { status: 200 }
    );
  } catch (error) {
    // console.error("Error in API handler:", error);

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
