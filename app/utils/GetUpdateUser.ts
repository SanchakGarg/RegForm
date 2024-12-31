import { connectToDatabase } from "@/lib/mongodb";
import { User,createErrorResponse } from "./interfaces";
// Define interfaces for type safety

// Handle connection errors and responses


/**
 * Fetch user data from database by dynamic key (email/vid) with specified fields only.
 * @param queryKey - 'email' or 'vid' as the identifier key.
 * @param queryValue - The value to query with.
 * @param fields - List of fields to fetch from database.
 */
import { Document, WithId } from "mongodb";

// Define return types
interface FetchUserSuccess {
  success: true;
  data: WithId<Document>;
}
  
interface FetchUserError {
  success: false;
  message: string;
  details?: string;
}

type FetchUserResponse = FetchUserSuccess | FetchUserError;

/**
 * Fetch user data from database by dynamic key (email/vid) with specified fields only.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
export async function fetchUserData(
  queryKey: keyof User,
  queryValue: string,
  fields: (keyof User)[]
): Promise<FetchUserResponse> {
  try {
    const { db } = await connectToDatabase();

    // Build projection dynamically
    const projection: Record<string, 1 | 0> = { _id: 0 };
    fields.forEach((field) => (projection[field] = 1));

    const user = await db
      .collection("users")
      .findOne({ [queryKey]: queryValue }, { projection });

    if (!user) {
      return {
        success: false,
        message: "User not found",
        details: `No user found for ${queryKey}: ${queryValue}`,
      };
    }

    return { success: true, data: user };
  } catch (error) {
    console.error("Error fetching user data:", error);
    return {
      success: false,
      message: "Failed to fetch user data.",
    };
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
 *//**
 * Updates or inserts user fields, or creates a new user if one doesn't exist.
 * @param email - Identifier for the user (email).
 * @param data - Fields to insert or update.
 */
 export async function updateUserData(email: string, data: Partial<User>) {
  try {
    const { db } = await connectToDatabase();
    const collection = db.collection("users");

    // Ensure the email is provided and valid
    if (!email) {
      return createErrorResponse(400, "Email is required.");
    }

    // Prepare the update operation to merge fields
    const updateData = Object.entries(data).reduce<Record<string,any>>((acc, [key, value]) => {
      if (typeof value === "object" && value !== null) {
        // Use $mergeObjects for nested fields
        acc[key] = { $mergeObjects: ["$" + key, value] };
      } else {
        // Use $set for primitive fields
        acc[key] = value;
      }
      return acc;
    }, {});

    // Perform the update operation
    const result = await collection.updateOne(
      { email }, // Search by email
      [{
        $set: updateData, // Merge or set fields
      }],
      { upsert: true } // Create if not found
    );

    if (result.upsertedCount > 0) {
      return { success: true, message: "User created successfully.", data: updateData };
    }

    if (result.modifiedCount > 0) {
      return { success: true, message: "User updated successfully.", data: updateData };
    }

    return createErrorResponse(400, "No changes were made.");
  } catch (error) {
    console.error("Error updating user data:", error);
    return createErrorResponse(500, "Failed to update user data.");
  }
}


export async function removeUserField(email: string, fieldToRemove: keyof User) {
  try {
    const { db } = await connectToDatabase();

    // Use email to find the user
    const result = await db.collection("users").updateOne(
      { email }, // Search only by email
      { $unset: { [fieldToRemove]: "" } } // Remove the field specified
    );

    if (result.modifiedCount === 0) {
      return createErrorResponse(404, "No user found or no field was removed.");
    }

    return { success: true, message: `Field '${fieldToRemove}' removed successfully.` };
  } catch (error) {
    console.error("Error removing user field:", error);
    return createErrorResponse(500, "Failed to remove user field.");
  }
}
