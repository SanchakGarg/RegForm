import { connectToDatabase } from "@/lib/mongodb";
import { NextApiRequest, NextApiResponse } from "next"; // Import types

// Define interfaces for type safety
export interface User {
  name: string;
  universityName: string;
  email: string;
  password?: string;
  emailVerified?: boolean;
  VerificationId?: string;
  vTimeLimit?: Date;
}

export interface ErrorMessage {
  code: number;
  message: string;
  details?: string;
}

// Utility for creating error responses
function createErrorResponse(code: number, message: string, details?: string): ErrorMessage {
  return { code, message, details };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method, query, body } = req;

  switch (method) {
    case "GET":
      return await handleGetRequest(query, res);
    case "POST":
      return await handlePostRequest(body, res);
    case "DELETE":
      return await handleDeleteRequest(query, res);
    default:
      res.status(405).json(createErrorResponse(405, "Method Not Allowed"));
  }
}

/** Handle GET logic */
async function handleGetRequest(query: any, res: NextApiResponse) {
  try {
    const { db } = await connectToDatabase();
    const { email, vid, fields } = query;

    const dynamicKey = email ? "email" : vid ? "vid" : undefined;

    if (!dynamicKey) {
      return res.status(400).json(createErrorResponse(400, "Invalid query key"));
    }

    const projectionFields = fields ? fields.split(",") : [];
    const projection = projectionFields.reduce((acc:any, field:any) => {
      acc[field] = 1;
      return acc;
    }, {});

    const user = await db.collection("users").findOne({ [dynamicKey]: query[dynamicKey] }, { projection });

    if (!user) {
      return res.status(404).json(createErrorResponse(404, "User not found"));
    }

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    console.error("GET Request Error:", error);
    res.status(500).json(createErrorResponse(500, "Failed to fetch user data."));
  }
}

/** Handle POST logic for user updates or inserts */
async function handlePostRequest(body: any, res: NextApiResponse) {
  try {
    const { db } = await connectToDatabase();
    const { email, vid, data } = body;

    const identifierKey = email ? "email" : vid ? "vid" : undefined;

    if (!identifierKey) {
      return res.status(400).json(createErrorResponse(400, "Invalid identifier provided"));
    }

    const existingUser = await db.collection("users").findOne({ [identifierKey]: email || vid });

    if (existingUser) {
      const updateResult = await db.collection("users").updateOne(
        { [identifierKey]: email || vid },
        { $set: data }
      );

      if (updateResult.modifiedCount) {
        return res.status(200).json({ success: true, message: "User updated successfully" });
      }

      return res.status(400).json(createErrorResponse(400, "No changes made."));
    }

    await db.collection("users").insertOne({ ...data, email, vid, emailVerified: false });

    return res.status(201).json({ success: true, message: "User created successfully" });
  } catch (error) {
    console.error("POST Request Error:", error);
    res.status(500).json(createErrorResponse(500, "Error processing user data"));
  }
}

/** Handle DELETE logic */
async function handleDeleteRequest(query: any, res: NextApiResponse) {
  try {
    const { db } = await connectToDatabase();
    const { email, vid } = query;

    const identifierKey = email ? "email" : vid ? "vid" : undefined;

    if (!identifierKey) {
      return res.status(400).json(createErrorResponse(400, "Invalid identifier provided"));
    }

    const deleteResult = await db.collection("users").deleteOne({ [identifierKey]: email || vid });

    if (!deleteResult.deletedCount) {
      return res.status(404).json(createErrorResponse(404, "No user found to delete"));
    }

    return res.status(200).json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    console.error("DELETE Request Error:", error);
    res.status(500).json(createErrorResponse(500, "Error deleting user"));
  }
}
