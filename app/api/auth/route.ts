import { hashPassword } from "@/app/utils/hashing";
import { connectToDatabase } from "@/lib/mongodb";
import crypto from "crypto";

function generateVerificationId() {
  return crypto.randomBytes(32).toString("hex"); // Generates a 64-character token
}


// Define custom error response structure
interface ErrorMessage {
  code: number;
  message: string;
  details?: string;
}

function createErrorResponse(code: number, message: string, details?: string): Response {
  const error: ErrorMessage = { code, message, details };
  return new Response(JSON.stringify(error), { status: code });
}

// Handle POST requests for user registration
export async function POST(req: Request) {
  const { name, universityName, email,password } = await req.json();

  try {
    const { db } = await connectToDatabase();
    const collection = db.collection("users");

    // Check if the email already exists
    const existingUser = await collection.findOne({ email });

    if (existingUser) {
      return createErrorResponse(
        409,
        "Email is already registered.",
        "Please use a different email address."
      );
    }

    // Hash the password and store user
    const hashedPassword = await hashPassword(password);
    const vid = generateVerificationId();
    const currentTime = new Date(); // Get current date and time
    const expirationTime = new Date(currentTime.getTime() + 15 * 60 * 1000);
    await collection.insertOne({
      name,
      universityName,
      email,
      password: hashedPassword,
      emailVerified: false,
      VerificationId: vid,
      vTimeLimit: expirationTime,
    });

    return new Response(
      JSON.stringify({ message: "User created successfully." }),
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating user:", error);
    return createErrorResponse(
      500,
      "Internal server error.",
      "An unexpected error occurred. Please try again later."
    );
  }
}
