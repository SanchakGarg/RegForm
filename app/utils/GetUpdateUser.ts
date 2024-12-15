import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// Define interfaces for type safety
export interface User {
  name: string;
  universityName: string;
  email: string;
  password?: string;
  emailVerified?: boolean;
  VerificationId?: string;
}

export interface ErrorMessage {
  code: number;
  message: string;
  details?: string;
}

// Handle connection errors and responses
function createErrorResponse(code: number, message: string, details?: string): ErrorMessage {
  return { code, message, details };
}

/**
 * Fetch user data from database by email with specific fields only.
 * @param email - Email to query for user.
 * @param fields - List of fields to fetch from database.
 */
export async function getUserData(email: string, fields: (keyof User)[]) {
  try {
    const { db } = await connectToDatabase();

    // Create a projection object dynamically to limit fields fetched from MongoDB
    const projection: Record<string, 1 | 0> = {};
    fields.forEach((field) => {
      projection[field] = 1; // Set the fields specified to return
    });

    const user = await db
      .collection("users")
      .findOne({ email }, { projection });

    if (!user) {
      return createErrorResponse(404, "User not found", "No user exists with this email.");
    }

    return { success: true, data: user };
  } catch (error) {
    console.error("Error fetching user data:", error);
    return createErrorResponse(500, "Failed to fetch user data.");
  }
}

/**
 * Updates user fields or inserts if a new user doesn't exist
 * @param email - User's email
 * @param data - Fields to insert or update
 */
export async function updateUserData(email: string, data: Partial<User>) {
  try {
    const { db } = await connectToDatabase();
    const collection = db.collection("users");

    const existingUser = await collection.findOne({ email });

    if (existingUser) {
      // Update fields if user exists
      const result = await collection.updateOne(
        { email },
        { $set: data }
      );

      if (result.modifiedCount > 0) {
        return { success: true, message: "User updated successfully", data };
      } else {
        return createErrorResponse(400, "No changes made to the user data.");
      }
    } else {
      // Insert a new user if the email doesn't exist
      const newUser = {
        ...data,
        email,
        emailVerified: false, // Set email verification by default
      };

      await collection.insertOne(newUser);

      return { success: true, message: "User created successfully", data: newUser };
    }
  } catch (error) {
    console.error("Error processing user data:", error);
    return createErrorResponse(500, "Failed to process user data.");
  }
}
