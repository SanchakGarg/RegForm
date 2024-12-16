import { decrypt } from "@/app/utils/encryption";
import { removeUserField, fetchUserData, updateUserData } from "@/app/utils/GetUpdateUser";
import { createErrorResponse } from "@/app/utils/interfaces";


export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { vid,e } = body;
    const id = decrypt(vid).vid;
    const email = decrypt(e).email;
    const dbEmail = await fetchUserData('VerificationId', id, ['email']);
    
    // Check if response indicates success
    if ('success' in dbEmail && dbEmail.success && dbEmail.data.email == email
     ) {
      updateUserData(email,{'emailVerified':true});
      
      removeUserField(email,'VerificationId');

      // Return a success response
      return new Response(
        JSON.stringify({ success: true }),
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
