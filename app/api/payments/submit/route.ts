import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { writeFile, mkdir } from "fs/promises";
import { Collection, ObjectId } from "mongodb";
import { connectToDatabase } from "@/lib/mongodb";
import { getEmailFromToken } from "@/app/utils/forms/getEmail";
import { fetchUserData } from "@/app/utils/GetUpdateUser";
import crypto from "crypto";
interface PaymentData {
  paymentTypes: string[];
  paymentMode: string;
  sportsPlayers: [];  // Now properly typed as an array of Registration objects
  amountInNumbers: number;
  amountInWords: string;
  payeeName: string;
  transactionId: string;
  paymentDate: Date;
  paymentProofFile?: string;
  remarks?: string;
  ownerId: ObjectId;
  status: string;
  createdAt: Date;
}
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    
    // Validate authentication
    const email = getEmailFromToken(req);
    if (!email) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: Invalid token or email not found" },
        { status: 401 }
      );
    }

    // Get user data
    const userResponse = await fetchUserData("email", email, ["_id"]);
    if (!userResponse.success || !userResponse.data?._id) {
      return NextResponse.json(
        { success: false, message: "Owner not found" },
        { status: 404 }
      );
    }

    // Handle file upload if present
    let paymentProofFile: string | undefined;
    const file = formData.get("paymentProof") as File | null;
    
    if (file) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const fileExtension = path.extname(file.name);
      // Generate random filename
      const randomId = crypto.randomBytes(16).toString('hex');
      const filename = `${randomId}${fileExtension}`;
      
      const directoryPath = process.env.UPLOAD_PATH || path.join(process.cwd(), "/assets");
      
      try {
        await mkdir(directoryPath, { recursive: true });
        await writeFile(path.join(directoryPath, filename), buffer);
        paymentProofFile = filename;
      } catch (error) {
        return NextResponse.json(
          { success: false, message: "Failed to save file" },
          { status: 500 }
        );
      }
    }
    // Get and validate sportsPlayers
    // Prepare payment data
    const paymentData: PaymentData = {
      ownerId: userResponse.data._id,
      paymentTypes: JSON.parse(formData.get("paymentTypes") as string),
      paymentMode: formData.get("paymentMode") as string,
      sportsPlayers: JSON.parse(formData.get("sportsPlayers") as string),  // Now properly typed
      amountInNumbers: Number(formData.get("amountInNumbers")),
      amountInWords: formData.get("amountInWords") as string,
      payeeName: formData.get("payeeName") as string,
      transactionId: formData.get("transactionId") as string,
      paymentDate: new Date(formData.get("paymentDate") as string),
      status: "In review",
      createdAt: new Date(),
    };

    // Add optional fields
    const remarks = formData.get("remarks");
    if (remarks) {
      paymentData.remarks = remarks as string;
    }

    if (paymentProofFile) {
      paymentData.paymentProofFile = paymentProofFile;
    }

    // Save to MongoDB
    const { db } = await connectToDatabase();
    const paymentCollection: Collection = db.collection("payments");
    const result = await paymentCollection.insertOne(paymentData);

    return NextResponse.json(
      {
        success: true,
        message: "Payment submitted successfully",
        paymentId: result.insertedId,
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("Error in payment submission:", error);
    
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { success: false, message: "Invalid data format" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}