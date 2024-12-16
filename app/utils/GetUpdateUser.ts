import { connectToDatabase } from "@/lib/mongodb";

// Define interfaces for type safety
export interface User {
  name: string;
  universityName: string;
  email: string;
  password?: string;
  emailVerified?: boolean;
  VerificationId?: string;
  vid?: string;
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
 * Fetch user data from database by dynamic key (email/vid) with specified fields only.
 * @param queryKey - 'email' or 'vid' as the identifier key.
 * @param queryValue - The value to query with.
 * @param fields - List of fields to fetch from database.
 */
export async function fetchUserData(queryKey: keyof User, queryValue: string, fields: (keyof User)[]) {
  try {
    const { db } = await connectToDatabase();

    // Create a projection object dynamically to limit fields fetched
    const projection: Record<string, 1 | 0> = { _id: 0 }; // Explicitly exclude _id
    fields.forEach((field) => {
      projection[field] = 1; // Dynamically build the projection fields
    });

    const user = await db
      .collection("users")
      .findOne({ [queryKey]: queryValue }, { projection });

    if (!user) {
      return createErrorResponse(404, "User not found", `No user found for ${queryKey}: ${queryValue}`);
    }

    return { success: true, data: user };
  } catch (error) {
    console.error("Error fetching user data:", error);
    return createErrorResponse(500, "Failed to fetch user data.");
  }
}

/**
 * Delete user data by dynamic identifier (email/vid).
 * @param queryKey - 'email' or 'vid' as the identifier key.
 * @param queryValue - The value to delete.
 */
export async function deleteUserData(queryKey: keyof User, queryValue: string) {
  try {
    const { db } = await connectToDatabase();

    const result = await db.collection("users").deleteOne({ [queryKey]: queryValue });

    if (result.deletedCount === 0) {
      return createErrorResponse(404, "No user found to delete.");
    }

    return { success: true, message: "User deleted successfully." };
  } catch (error) {
    console.error("Error deleting user data:", error);
    return createErrorResponse(500, "Failed to delete user data.");
  }
}

/**
 * Updates or inserts user fields or creates a new user if one doesn't already exist.
 * @param emailOrVID - Identifier for the user (email/vid).
 * @param data - Fields to insert or update.
 */
export async function updateUserData(emailOrVID: string, data: Partial<User>) {
  try {
    const { db } = await connectToDatabase();
    const collection = db.collection("users");

    const identifierKey = data.email ? "email" : data.vid ? "vid" : undefined;

    if (!identifierKey) {
      return createErrorResponse(400, "Invalid identifier key provided.");
    }

    const existingUser = await collection.findOne({ [identifierKey]: emailOrVID });

    if (existingUser) {
      const result = await collection.updateOne(
        { [identifierKey]: emailOrVID },
        { $set: data }
      );

      if (result.modifiedCount > 0) {
        return { success: true, message: "User updated successfully", data };
      }

      return createErrorResponse(400, "No changes were made.");
    }

    const newUser = {
      ...data,
      email: data.email || undefined,
      vid: data.vid || undefined,
      emailVerified: false,
    };

    await collection.insertOne(newUser);

    return { success: true, message: "User created successfully", data: newUser };
  } catch (error) {
    console.error("Error updating user data:", error);
    return createErrorResponse(500, "Failed to update user data.");
  }
}
