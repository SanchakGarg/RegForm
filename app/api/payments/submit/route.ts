import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { writeFile, mkdir } from "fs/promises";
import { Collection, ObjectId } from "mongodb";
import { connectToDatabase } from "@/lib/mongodb";
import { getEmailFromToken } from "@/app/utils/forms/getEmail";
import { fetchUserData } from "@/app/utils/GetUpdateUser";
import crypto from "crypto";
import { sendPaymentConfirmationEmail } from "@/app/utils/mailer/PaymentEmail";
/* eslint-disable @typescript-eslint/no-unused-vars */

// Helper to add file to Strapi's database
async function addFileToStrapiDatabase(fileData: {
  name: string;
  hash: string;
  ext: string;
  mime: string;
  size: number;
  url: string;
}) {
  const { db } = await connectToDatabase();
  const uploadCollection: Collection = db.collection("upload_file");

  const result = await uploadCollection.insertOne({
    name: fileData.name,
    hash: fileData.hash,
    ext: fileData.ext,
    mime: fileData.mime,
    size: fileData.size,
    url: fileData.url,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  if (!result.insertedId) {
    throw new Error("Failed to insert file into Strapi database.");
  }

  return result.insertedId;
}

// Interfaces for data
interface SportPlayers {
  sport: string;
  players: number;
}
interface PaymentFormData {
  accommodationPrice?: number;
  accommodationPeople?: number;
  name?: string;
  email?: string;
  paymentTypes: string[];
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
  accommodationPeople?: number;
  accommodationPrice?: number;
  amountInNumbers: number;
  amountInWords: string;
  payeeName: string;
  transactionId: string;
  paymentDate: Date;
  paymentProofFile?: string;
  strapiId?: ObjectId;
  remarks?: string;
  ownerId: ObjectId;
  status: string;
  createdAt: Date;
}

// Main POST handler
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
    const userResponse = await fetchUserData("email", email, ["_id", "name"]);
    if (!userResponse.success || !userResponse.data?._id) {
      return NextResponse.json(
        { success: false, message: "Owner not found" },
        { status: 404 }
      );
    }

    // Handle file upload if present
    let paymentProofFile: string | undefined;
    let strapiId: ObjectId | undefined;
    const file = formData.get("paymentProof") as File | null;

    if (file) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const fileExtension = path.extname(file.name);
      const mimeType = file.type;
      const fileSize = buffer.byteLength / (1024 * 1024); // File size in MB

      // Generate random filename and hash
      const randomId = crypto.randomBytes(16).toString("hex");
      const filename = `${randomId}${fileExtension}`;
      const hash = crypto.createHash("md5").update(filename).digest("hex");

      const directoryPath = process.env.UPLOAD_PATH || path.join(process.cwd(), "/assets");

      try {
        await mkdir(directoryPath, { recursive: true });
        await writeFile(path.join(directoryPath, filename), buffer);

        const fileUrl = `/uploads/${filename}`;
        paymentProofFile = filename;

        // Save file metadata to Strapi database
        strapiId = await addFileToStrapiDatabase({
          name: file.name,
          hash,
          ext: fileExtension,
          mime: mimeType,
          size: fileSize,
          url: fileUrl,
        });
      } catch (error) {
        return NextResponse.json(
          { success: false, message: "Failed to save file" },
          { status: 500 }
        );
      }
    }

    // Prepare payment data
    const paymentData: PaymentData = {
      ownerId: userResponse.data._id,
      paymentTypes: JSON.parse(formData.get("paymentTypes") as string),
      paymentMode: formData.get("paymentMode") as string,
      sportsPlayers: JSON.parse(formData.get("sportsPlayers") as string),
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
    if (acpeople) {
      paymentData.accommodationPeople = acpeople;
      paymentData.accommodationPrice = Number(formData.get("accommodationPrice"));
    }

    if (paymentProofFile) {
      paymentData.paymentProofFile = paymentProofFile;
    }

    if (strapiId) {
      paymentData.strapiId = strapiId;
    }

    // Save to MongoDB
    const { db } = await connectToDatabase();
    const paymentCollection: Collection = db.collection("payments");
    const result = await paymentCollection.insertOne(paymentData);

    // Prepare data for confirmation email
    const formDataObj: PaymentFormData = {
      name: userResponse.data?.name,
      email: email,
      paymentTypes: JSON.parse(formData.get("paymentTypes") as string),
      paymentMode: formData.get("paymentMode") as string,
      sportsPlayers: JSON.parse(formData.get("sportsPlayers") as string),
      amountInNumbers: parseFloat(formData.get("amountInNumbers") as string),
      amountInWords: formData.get("amountInWords") as string,
      payeeName: formData.get("payeeName") as string,
      transactionId: formData.get("transactionId") as string,
      paymentDate: new Date(formData.get("paymentDate") as string),
      paymentProof: file || undefined,
      accommodationPeople: Number(formData.get("accommodationPeople")),
      accommodationPrice: Number(formData.get("accommodationPrice")),
      remarks: formData.get("remarks") as string || undefined,
    };

    // Send email confirmation
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
