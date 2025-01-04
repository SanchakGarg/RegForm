import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { writeFile, mkdir } from "fs/promises";
import { Collection, ObjectId } from "mongodb";
import { connectToDatabase } from "@/lib/mongodb";
import { getEmailFromToken } from "@/app/utils/forms/getEmail";
import { fetchUserData } from "@/app/utils/GetUpdateUser";
import crypto from "crypto";
import { sendPaymentConfirmationEmail } from "@/app/utils/mailer/PaymentEmail";

interface SportPlayers {
  sport: string;
  players: number;  // Number of players
}
interface PaymentFormData {
  accommodationPrice?:number,
  accommodationPeople?:number,
  name?:string,
  email?:string,
  paymentTypes: string[];  // Will contain max 2 strings
  paymentMode: string;
  sportsPlayers?: SportPlayers[];
  amountInNumbers: number;
  amountInWords: string;
  payeeName: string;
  transactionId: string;
  paymentDate: Date;
  paymentProof?: File;
  remarks?: string;
}
interface PaymentData {
  paymentTypes: string[];
  paymentMode: string;
  sportsPlayers: []; 
  accommodationPeople?:number; 
  accommodationPrice?:number;// Now properly typed as an array of Registration objects
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
    const userResponse = await fetchUserData("email", email, ["_id","name"]);
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
    const acpeople = Number(formData.get("accommodationPeople"));
    if (acpeople){
      paymentData.accommodationPeople= Number(formData.get("accommodationPeople"))
      paymentData.accommodationPrice= Number(formData.get("accommodationPrice"))
    }

    if (paymentProofFile) {
      paymentData.paymentProofFile = paymentProofFile;
    }

    // Save to MongoDB
    const { db } = await connectToDatabase();
    const paymentCollection: Collection = db.collection("payments");
    const result = await paymentCollection.insertOne(paymentData);
    const formDataObj: PaymentFormData = {
      name:userResponse.data?.name,
      email:email,
      paymentTypes: JSON.parse(formData.get("paymentTypes") as string), // Parse JSON if it's a serialized string
      paymentMode: formData.get("paymentMode") as string,
      sportsPlayers: JSON.parse(formData.get("sportsPlayers") as string), // Parse JSON if applicable
      amountInNumbers: parseFloat(formData.get("amountInNumbers") as string), // Convert to number
      amountInWords: formData.get("amountInWords") as string,
      payeeName: formData.get("payeeName") as string,
      transactionId: formData.get("transactionId") as string,
      paymentDate: new Date(formData.get("paymentDate") as string), // Convert to Date
      paymentProof: file || undefined, // Attach file if present
      accommodationPeople:Number(formData.get("accommodationPeople")),
      accommodationPrice:Number(formData.get("accommodationPrice")),
      remarks: formData.get("remarks") as string || undefined, // Optional field
    };
    
    await sendPaymentConfirmationEmail(formDataObj);
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