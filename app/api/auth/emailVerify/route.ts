import { decrypt } from "@/app/utils/encryption";
import { removeUserField, fetchUserData, updateUserData } from "@/app/utils/GetUpdateUser";
import { createErrorResponse } from "@/app/utils/interfaces";
import {  encrypt } from "@/app/utils/encryption";
import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET || "your-256-bit-secret";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { vid, e } = body;
    const id = decrypt(vid).vid;
    const email = decrypt(e).email;
    const dbEmail = await fetchUserData('VerificationId', id, ['email']);

    // Check if response indicates success
    if ('success' in dbEmail && dbEmail.success && dbEmail.data.email == email
    ) {
      updateUserData(email, { 'emailVerified': true });

      removeUserField(email, 'VerificationId');
      const payload = { email:email};

      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "5d" });

      // Encrypt token (optional)
      const encryptedToken = encrypt({ jwt: token });

      // Return a success response
      return new Response(
        JSON.stringify({ success: true,token:encryptedToken }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    } else {
      // Handle failure cases
      return createErrorResponse(400, "Verification failed.", JSON.stringify(dbEmail));
    }
  } catch (error: unknown) {
    console.error(error);

    // Return a generic error response
    return createErrorResponse(500, "Internal server error.", String(error));
  }
}
