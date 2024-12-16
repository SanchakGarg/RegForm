import { decrypt } from "@/app/utils/encryption";
import { fetchUserData } from "@/app/utils/GetUpdateUser";

interface ErrorMessage {
  code: number;
  message: string;
  details?: string;
}

function createErrorResponse(code: number, message: string, details?: string): Response {
  const error: ErrorMessage = { code, message, details };
  return new Response(JSON.stringify(error), { status: code });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { vid } = body;
    console.log(decrypt(vid).vid);
    const id = decrypt(vid).vid;
    const data = await fetchUserData('VerificationId', id, ['email']);

    // Check if response indicates success
    if ('success' in data && data.success) {
      console.log(data);

      // Return a success response
      return new Response(
        JSON.stringify({ success: true, data }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    } else {
      // Handle failure cases
      return createErrorResponse(400, "Verification failed.", JSON.stringify(data));
    }
  } catch (error: unknown) {
    console.error(error);

    // Return a generic error response
    return createErrorResponse(500, "Internal server error.", String(error));
  }
}
