import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getEmailFromToken } from "@/app/utils/forms/getEmail"; // Utility to extract email from JWT
import { fetchUserData, updateUserData } from "@/app/utils/GetUpdateUser"; // Fetch and update user data

export async function POST(req: NextRequest) {
    try {
        // Step 1: Extract the token from the request cookies
        const email = getEmailFromToken(req);
        if (!email) {
            return NextResponse.json(
                { success: false, message: "Invalid or expired token." },
                { status: 401 }
            );
        }

        // Step 2: Validate and extract data from request body
        const { universityName } = await req.json();
        if (!universityName) {
            return NextResponse.json(
                { success: false, message: "University name is required." },
                { status: 400 }
            );
        }

        // Step 3: Connect to MongoDB
        const { db } = await connectToDatabase();
        const usersCollection = db.collection("users");

        // Step 4: Check if the user exists in the database
        const user = await usersCollection.findOne({ email });
        if (!user) {
            return NextResponse.json(
                { success: false, message: "User not found." },
                { status: 404 }
            );
        }

        // Step 5: Update the user's university name
        const updateResult = await usersCollection.updateOne(
            { email },
            { $set: { universityName } }
        );

        // Step 6: Return success message
        if (updateResult.modifiedCount > 0) {
            return NextResponse.json({
                success: true,
                message: "University name saved successfully.",
            });
        } else {
            return NextResponse.json({
                success: false,
                message: "Failed to update university name.",
            });
        }
    } catch (error) {
        console.error("Error in saving university name:", error);
        return NextResponse.json(
            { success: false, message: "Internal server error." },
            { status: 500 }
        );
    }
}
